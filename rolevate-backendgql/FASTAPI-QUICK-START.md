# Quick Start: Update FastAPI Agent for Structured Experience & Education

## What Changed?

The NestJS backend now accepts **structured arrays** for work experience and education instead of just plain text. This gives you much better data quality and enables powerful features like timeline views, filtering by company/school, and analytics.

---

## TLDR - What You Need to Do

### Before (Old Way - Still Works):
```python
candidate_data = {
    "experience": "Software Engineer at Google (2020-Present); Developer at Microsoft (2018-2020)",
    "education": "MS in CS from MIT (2015-2017); BS from Stanford (2011-2015)"
}
```

### After (New Way - RECOMMENDED):
```python
candidate_data = {
    "experience": [
        {
            "company": "Google",
            "position": "Software Engineer",
            "startDate": "2020-03-15",
            "endDate": None,
            "isCurrent": True,
            "description": "Built scalable microservices for Google Cloud Platform"
        },
        {
            "company": "Microsoft",
            "position": "Software Developer",
            "startDate": "2018-06-01",
            "endDate": "2020-02-28",
            "isCurrent": False,
            "description": "Developed features for Azure DevOps"
        }
    ],
    "education": [
        {
            "institution": "MIT",
            "degree": "Master of Science",
            "fieldOfStudy": "Computer Science",
            "startDate": "2015-09",
            "endDate": "2017-06",
            "grade": "3.9/4.0",
            "description": "Specialization in Distributed Systems"
        },
        {
            "institution": "Stanford University",
            "degree": "Bachelor of Science",
            "fieldOfStudy": "Computer Engineering",
            "startDate": "2011-09",
            "endDate": "2015-06",
            "grade": "3.8/4.0"
        }
    ]
}
```

---

## Step-by-Step Implementation

### 1. Update Your GPT-4 Prompt

Add this to your CV parsing prompt:

```python
EXTRACTION_PROMPT = """
Extract the following from this CV in JSON format:

{
    "firstName": "...",
    "lastName": "...",
    "email": "...",
    "phone": "...",
    "location": "...",
    "bio": "...",
    "skills": ["skill1", "skill2", ...],
    "linkedinUrl": "...",
    "githubUrl": "...",
    "portfolioUrl": "...",
    
    "experience": [
        {
            "company": "Company Name",
            "position": "Job Title",
            "startDate": "YYYY-MM-DD or YYYY-MM",
            "endDate": "YYYY-MM-DD or null if current",
            "isCurrent": true/false,
            "description": "What they did in this role"
        }
    ],
    
    "education": [
        {
            "institution": "University/School Name",
            "degree": "Degree Type (BS, MS, PhD, etc)",
            "fieldOfStudy": "Major/Field",
            "startDate": "YYYY-MM",
            "endDate": "YYYY-MM",
            "grade": "GPA or grade if mentioned",
            "description": "Honors, achievements, etc"
        }
    ]
}

Rules:
- For current positions, set endDate to null and isCurrent to true
- Extract ALL work experience, even short-term or freelance
- Extract ALL education, including certifications
- Use ISO date format (YYYY-MM-DD) or just YYYY-MM
- If a field is not found, omit it (don't use null unless for endDate)
"""
```

### 2. Parse the GPT-4 Response

```python
import json
from typing import Dict, List, Any, Optional

def parse_cv_with_gpt4(cv_text: str) -> Dict[str, Any]:
    """Extract structured data from CV using GPT-4"""
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a CV parsing expert. Extract data in valid JSON format."},
            {"role": "user", "content": f"{EXTRACTION_PROMPT}\n\nCV Text:\n{cv_text}"}
        ],
        temperature=0.1  # Low temperature for consistent extraction
    )
    
    extracted_data = json.loads(response.choices[0].message.content)
    
    # Validate and clean the data
    return clean_candidate_data(extracted_data)


def clean_candidate_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Clean and validate extracted candidate data"""
    
    cleaned = {}
    
    # Basic fields
    if data.get("firstName"):
        cleaned["firstName"] = data["firstName"].strip()
    if data.get("lastName"):
        cleaned["lastName"] = data["lastName"].strip()
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
        cleaned["skills"] = [s.strip() for s in data["skills"] if s]
    
    # URLs
    for url_field in ["linkedinUrl", "githubUrl", "portfolioUrl"]:
        if data.get(url_field):
            cleaned[url_field] = data[url_field].strip()
    
    # Experience - can be string or array
    if data.get("experience"):
        if isinstance(data["experience"], list):
            cleaned["experience"] = [clean_experience(exp) for exp in data["experience"]]
        else:
            cleaned["experience"] = str(data["experience"])
    
    # Education - can be string or array
    if data.get("education"):
        if isinstance(data["education"], list):
            cleaned["education"] = [clean_education(edu) for edu in data["education"]]
        else:
            cleaned["education"] = str(data["education"])
    
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
        cleaned["startDate"] = exp["startDate"]
    if exp.get("endDate"):
        cleaned["endDate"] = exp["endDate"]
    
    # Current flag
    cleaned["isCurrent"] = bool(exp.get("isCurrent", False))
    
    return cleaned


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
        cleaned["grade"] = edu["grade"].strip()
    if edu.get("description"):
        cleaned["description"] = edu["description"].strip()
    
    # Dates
    if edu.get("startDate"):
        cleaned["startDate"] = edu["startDate"]
    if edu.get("endDate"):
        cleaned["endDate"] = edu["endDate"]
    
    return cleaned


def clean_phone_number(phone: str) -> str:
    """Ensure phone has country code"""
    phone = phone.strip().replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    
    if not phone.startswith("+"):
        # Assume Jordan if no country code
        if phone.startswith("0"):
            phone = "+962" + phone[1:]
        elif phone.startswith("962"):
            phone = "+" + phone
        else:
            phone = "+962" + phone
    
    return phone
```

### 3. Send to NestJS

```python
async def send_analysis_to_nestjs(
    application_id: str,
    candidate_data: Dict[str, Any],
    cv_score: float,
    recommendations: str
):
    """Send CV analysis results to NestJS GraphQL API"""
    
    mutation = """
    mutation UpdateApplicationAnalysis($input: UpdateApplicationAnalysisInput!) {
      updateApplicationAnalysis(input: $input) {
        id
        status
        cvAnalysisScore
        analyzedAt
      }
    }
    """
    
    variables = {
        "input": {
            "applicationId": application_id,
            "cvAnalysisScore": cv_score,
            "aiCvRecommendations": recommendations,
            "candidateInfo": candidate_data
        }
    }
    
    headers = {
        "X-API-Key": "31a29647809f2bf22295b854b30eafd58f50ea1559b0875ad2b55f508aa5215e",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "http://localhost:4005/api/graphql",
            json={"query": mutation, "variables": variables},
            headers=headers
        )
        
        if response.status_code != 200:
            raise Exception(f"GraphQL request failed: {response.text}")
        
        result = response.json()
        
        if "errors" in result:
            raise Exception(f"GraphQL errors: {result['errors']}")
        
        return result["data"]["updateApplicationAnalysis"]
```

---

## Full Example

Here's a complete working example:

```python
async def analyze_cv_and_send(application_id: str, cv_url: str):
    """Complete CV analysis flow"""
    
    # 1. Download CV from S3
    cv_text = await download_cv_from_s3(cv_url)
    
    # 2. Extract structured data with GPT-4
    candidate_data = parse_cv_with_gpt4(cv_text)
    
    # 3. Calculate score (your existing logic)
    cv_score = calculate_cv_score(candidate_data)
    
    # 4. Generate recommendations (your existing logic)
    recommendations = generate_recommendations(candidate_data, cv_score)
    
    # 5. Send to NestJS
    result = await send_analysis_to_nestjs(
        application_id=application_id,
        candidate_data=candidate_data,
        cv_score=cv_score,
        recommendations=recommendations
    )
    
    print(f"✅ CV analysis completed for application {application_id}")
    print(f"   Score: {cv_score}")
    print(f"   Status: {result['status']}")
    
    return result
```

---

## Testing

### Test with Simple Data First:

```python
# Test payload
test_data = {
    "applicationId": "your-test-app-id",
    "cvAnalysisScore": 85,
    "candidateInfo": {
        "firstName": "Ahmad",
        "lastName": "Ali",
        "email": "ahmad@example.com",
        "phone": "+962791234567",
        "skills": ["Python", "FastAPI", "PostgreSQL"],
        "experience": [
            {
                "company": "Tech Corp",
                "position": "Software Engineer",
                "startDate": "2020-01",
                "isCurrent": True
            }
        ],
        "education": [
            {
                "institution": "Jordan University",
                "degree": "Bachelor of Science",
                "fieldOfStudy": "Computer Science",
                "endDate": "2020-06"
            }
        ]
    }
}

# Send it
await send_analysis_to_nestjs(**test_data)
```

---

## Fallback Strategy

If GPT-4 can't extract structured data (messy CV, weird format), fall back to strings:

```python
def extract_with_fallback(cv_text: str) -> Dict[str, Any]:
    """Try structured extraction, fall back to simple strings"""
    
    try:
        # Try structured extraction
        data = parse_cv_with_gpt4(cv_text)
        
        # Validate we got arrays
        if isinstance(data.get("experience"), list) and len(data["experience"]) > 0:
            return data
        
        # If not arrays, fall back
        print("⚠️ Structured extraction failed, using simple strings")
        return extract_simple_strings(cv_text)
        
    except Exception as e:
        print(f"❌ Extraction error: {e}, falling back to simple strings")
        return extract_simple_strings(cv_text)


def extract_simple_strings(cv_text: str) -> Dict[str, Any]:
    """Fallback: extract as simple strings"""
    
    prompt = "Extract name, email, phone, and brief experience/education summaries as text"
    # ... simpler GPT-4 call
    
    return {
        "firstName": "...",
        "lastName": "...",
        "experience": "Software Engineer at Google (2020-Present)...",
        "education": "MS in CS from MIT (2015-2017)..."
    }
```

---

## Expected Benefits

After implementing this:

✅ **Better candidate profiles** - Structured, queryable data  
✅ **Timeline views** - Can show career progression visually  
✅ **Smart filtering** - Filter by company, university, years of experience  
✅ **Analytics** - Track trends, popular companies, education levels  
✅ **Professional presentation** - Resume-like display in UI  
✅ **Still backward compatible** - Simple strings still work  

---

## Need Help?

- **Full documentation:** `CV-ANALYSIS-DATA-FORMAT.md`
- **Implementation details:** `EXPERIENCE-EDUCATION-IMPLEMENTATION.md`
- **Backend code:** `src/application/application.service.ts` (lines 313-447)

---

**Questions?** The NestJS backend is flexible and forgiving:
- Handles field name variations (e.g., `organization` → `company`)
- Parses various date formats
- Gracefully handles missing fields
- Logs everything for debugging

Just send what you can extract, and the backend will handle it professionally! 🚀
