from ..tools.parser_tool import extract_text_auto
from typing import Dict, List, Any, Optional
import re
import os
import json
from openai import OpenAI


def extract_info(state: Dict) -> Dict:
    local_path = state.get("local_path")
    if not local_path:
        return state
    text = extract_text_auto(local_path)
    state["raw_text"] = text
    
    # Use OpenAI to extract structured information from CV
    try:
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        
        extraction_prompt = f"""Extract the following information from this CV/Resume text. Return ONLY a valid JSON object with these exact fields:

{{
  "name": "candidate's full name",
  "email": "email address",
  "phone": "phone number",
  "location": "city/country",
  "linkedinUrl": "LinkedIn profile URL",
  "githubUrl": "GitHub profile URL",
  "portfolioUrl": "portfolio or website URL",
  "bio": "brief professional summary (2-3 sentences)",
  "skills": ["skill1", "skill2", "skill3"],
  
  "experience": [
    {{
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "YYYY-MM-DD or YYYY-MM",
      "endDate": "YYYY-MM-DD or null if current",
      "isCurrent": true/false,
      "description": "What they did in this role"
    }}
  ],
  
  "education": [
    {{
      "institution": "University/School Name",
      "degree": "Degree Type (BS, MS, PhD, etc)",
      "fieldOfStudy": "Major/Field",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "grade": "GPA or grade if mentioned",
      "description": "Honors, achievements, etc"
    }}
  ]
}}

IMPORTANT RULES:
- For experience: Extract ALL work positions, even short-term or freelance
- For current positions: set endDate to null and isCurrent to true
- For dates: Use ISO format (YYYY-MM-DD) or YYYY-MM. If only year is available, use YYYY-01
- For education: Extract ALL degrees, certifications, and relevant courses
- If a field is not found in the CV, omit it (don't use null unless for endDate in current positions)
- Extract as many skills as you can find
- If experience/education data is unclear, you can fall back to a simple string format instead of arrays

CV Text:
{text[:8000]}"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert at extracting structured information from CVs. Always return valid JSON with structured arrays for experience and education when possible."},
                {"role": "user", "content": extraction_prompt}
            ],
            temperature=0.1,  # Low temperature for consistent extraction
            response_format={"type": "json_object"}
        )
        
        extracted_data = json.loads(response.choices[0].message.content)
        
        # Clean and validate the extracted data
        cleaned_data = clean_candidate_data(extracted_data)
        
        print(f"✅ Extracted candidate info via OpenAI")
        print(f"   - Basic fields: {list(set(cleaned_data.keys()) - {'experience', 'education', 'skills'})}")
        print(f"   - Skills: {len(cleaned_data.get('skills', []))} found")
        print(f"   - Experience: {len(cleaned_data.get('experience', [])) if isinstance(cleaned_data.get('experience'), list) else 'string format'}")
        print(f"   - Education: {len(cleaned_data.get('education', [])) if isinstance(cleaned_data.get('education'), list) else 'string format'}")
        
        # Store in state
        state["extracted"] = cleaned_data
        
    except Exception as e:
        print(f"❌ OpenAI extraction error: {e}")
        # Fallback to regex extraction
        extracted_data = extract_with_regex(text)
        state["extracted"] = extracted_data
    
    return state


def clean_candidate_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Clean and validate extracted candidate data"""
    cleaned = {}
    
    # Basic fields
    if data.get("name"):
        cleaned["name"] = data["name"].strip()
    # Support legacy firstName/lastName fields
    elif data.get("firstName") or data.get("lastName"):
        name_parts = []
        if data.get("firstName"):
            name_parts.append(data["firstName"].strip())
        if data.get("lastName"):
            name_parts.append(data["lastName"].strip())
        cleaned["name"] = " ".join(name_parts)
    
    if data.get("email"):
        cleaned["email"] = data["email"].strip().lower()
    if data.get("phone"):
        cleaned["phone"] = clean_phone_number(data["phone"])
    if data.get("location"):
        cleaned["location"] = data["location"].strip()
    if data.get("bio"):
        cleaned["bio"] = data["bio"].strip()
    
    # Skills array
    if data.get("skills") and isinstance(data["skills"], list):
        cleaned["skills"] = [s.strip() for s in data["skills"] if s and s.strip()]
    
    # URLs
    for url_field in ["linkedinUrl", "githubUrl", "portfolioUrl"]:
        if data.get(url_field):
            cleaned[url_field] = data[url_field].strip()
    
    # Experience - can be string or array
    if data.get("experience"):
        if isinstance(data["experience"], list) and len(data["experience"]) > 0:
            # Structured array format (preferred)
            cleaned["experience"] = [clean_experience(exp) for exp in data["experience"]]
        elif isinstance(data["experience"], str):
            # Simple string format (fallback)
            cleaned["experience"] = data["experience"].strip()
    
    # Education - can be string or array
    if data.get("education"):
        if isinstance(data["education"], list) and len(data["education"]) > 0:
            # Structured array format (preferred)
            cleaned["education"] = [clean_education(edu) for edu in data["education"]]
        elif isinstance(data["education"], str):
            # Simple string format (fallback)
            cleaned["education"] = data["education"].strip()
    
    return cleaned


def clean_experience(exp: Dict[str, Any]) -> Dict[str, Any]:
    """Clean a single experience entry"""
    cleaned = {}
    
    if exp.get("company"):
        cleaned["company"] = exp["company"].strip()
    if exp.get("position"):
        cleaned["position"] = exp["position"].strip()
    if exp.get("description"):
        cleaned["description"] = exp["description"].strip()
    
    # Dates
    if exp.get("startDate"):
        cleaned["startDate"] = normalize_date(exp["startDate"])
    if exp.get("endDate") is not None:  # Allow None for current positions
        if exp["endDate"]:
            cleaned["endDate"] = normalize_date(exp["endDate"])
        else:
            cleaned["endDate"] = None
    
    # Current flag
    cleaned["isCurrent"] = bool(exp.get("isCurrent", False))
    
    # Remove empty fields
    return {k: v for k, v in cleaned.items() if v is not None and v != ""}


def clean_education(edu: Dict[str, Any]) -> Dict[str, Any]:
    """Clean a single education entry"""
    cleaned = {}
    
    if edu.get("institution"):
        cleaned["institution"] = edu["institution"].strip()
    if edu.get("degree"):
        cleaned["degree"] = edu["degree"].strip()
    if edu.get("fieldOfStudy"):
        cleaned["fieldOfStudy"] = edu["fieldOfStudy"].strip()
    if edu.get("grade"):
        cleaned["grade"] = str(edu["grade"]).strip()
    if edu.get("description"):
        cleaned["description"] = edu["description"].strip()
    
    # Dates
    if edu.get("startDate"):
        cleaned["startDate"] = normalize_date(edu["startDate"])
    if edu.get("endDate"):
        cleaned["endDate"] = normalize_date(edu["endDate"])
    
    # Remove empty fields
    return {k: v for k, v in cleaned.items() if v is not None and v != ""}


def normalize_date(date_str: str) -> str:
    """Normalize date formats to YYYY-MM-DD or YYYY-MM"""
    if not date_str:
        return None
    
    date_str = str(date_str).strip()
    
    # Already in correct format
    if re.match(r'^\d{4}-\d{2}(-\d{2})?$', date_str):
        return date_str
    
    # Just year (e.g., "2020")
    if re.match(r'^\d{4}$', date_str):
        return f"{date_str}-01"
    
    # Year-Month without dash (e.g., "202003")
    if re.match(r'^\d{6}$', date_str):
        return f"{date_str[:4]}-{date_str[4:]}"
    
    # Return as-is if we can't parse
    return date_str


def clean_phone_number(phone: str) -> str:
    """Clean phone number and ensure it has country code"""
    if not phone:
        return None
    
    phone = str(phone).strip().replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    
    if not phone.startswith("+"):
        # Assume Jordan if no country code
        if phone.startswith("0"):
            phone = "+962" + phone[1:]
        elif phone.startswith("962"):
            phone = "+" + phone
        else:
            phone = "+962" + phone
    
    return phone


def extract_with_regex(text: str) -> Dict:
    """Fallback regex-based extraction"""
    # Extract name (usually first line or near top)
    name = None
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        first_line = lines[0]
        if len(first_line) < 50 and not any(char in first_line for char in ['@', 'http', 'www']):
            name = first_line
    
    # Extract email
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_matches = re.findall(email_pattern, text)
    email = email_matches[0] if email_matches else None
    
    # Extract phone number
    phone_pattern = r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}'
    phone_matches = re.findall(phone_pattern, text)
    phone = None
    for match in phone_matches:
        digits_only = re.sub(r'\D', '', match)
        if 8 <= len(digits_only) <= 15:
            phone = match.strip()
            break
    
    # Extract LinkedIn URL
    linkedin_pattern = r'(?:https?://)?(?:www\.)?linkedin\.com/in/[\w-]+'
    linkedin_matches = re.findall(linkedin_pattern, text, re.IGNORECASE)
    linkedinUrl = linkedin_matches[0] if linkedin_matches else None
    
    # Extract location (look for common patterns)
    location_pattern = r'(?:Address|Location|Based in|City)[:\s]+([A-Za-z\s,]+(?:Jordan|Amman|Dubai|UAE|USA|UK|London|Remote)?)'
    location_matches = re.findall(location_pattern, text, re.IGNORECASE)
    location = location_matches[0].strip() if location_matches else None
    
    extracted = {
        "name": name,
        "email": email,
        "phone": phone,
        "location": location,
        "linkedinUrl": linkedinUrl,
        "portfolioUrl": None,
        "bio": None,
        "skills": [],
        "experience": None,
        "education": None
    }
    
    print(f"⚠️ Regex fallback extraction: {json.dumps(extracted, indent=2)}")
    return extracted
