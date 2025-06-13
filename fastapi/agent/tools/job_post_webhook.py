"""
Tool for sending job post data to NestJS API via webhook.
"""

import os
import requests
import json
from typing import Dict, Any
from dotenv import load_dotenv

def map_experience_level(level: str) -> str:
    """Map experience level to backend enum format."""
    level_mapping = {
        "junior": "JUNIOR",
        "mid": "MID_LEVEL", 
        "senior": "SENIOR",
        "executive": "EXECUTIVE"
    }
    return level_mapping.get(level.lower(), "MID_LEVEL")

def map_work_type(work_type: str) -> str:
    """Map work type to backend enum format."""
    type_mapping = {
        "remote": "REMOTE",
        "hybrid": "HYBRID",
        "onsite": "ON_SITE"
    }
    return type_mapping.get(work_type.lower(), None)

def generate_ai_interview_prompt(job_data: Dict[str, Any], company_name: str) -> tuple[str, str]:
    """
    Generate AI interview prompt and instructions based on job data.
    
    Returns:
        tuple: (aiPrompt, aiInstructions)
    """
    
    # Extract job details
    job_title = job_data.get("title", "the position")
    experience_level = job_data.get("experienceLevel", "").lower()
    skills = job_data.get("skills", [])
    work_type = job_data.get("workType", "")
    location = job_data.get("location", "")
    salary_min = job_data.get("salaryMin")
    salary_max = job_data.get("salaryMax")
    currency = job_data.get("currency", "USD")
    
    # Create intelligent skill-based questions
    skill_questions = []
    technical_depth = "senior" in experience_level or "lead" in experience_level
    
    # Technology-specific questions
    for skill in skills:
        skill_lower = skill.lower()
        if ".net" in skill_lower or "c#" in skill_lower:
            skill_questions.extend([
                f"Your experience with .NET framework and C# development",
                f"ASP.NET Core, Entity Framework, and modern .NET practices" if technical_depth else "Basic .NET concepts and C# programming"
            ])
        elif "javascript" in skill_lower or "react" in skill_lower or "node" in skill_lower:
            skill_questions.extend([
                f"Frontend development with JavaScript frameworks like React or Vue",
                f"Modern JavaScript (ES6+), async programming, and state management" if technical_depth else "JavaScript fundamentals and DOM manipulation"
            ])
        elif "python" in skill_lower:
            skill_questions.extend([
                f"Python development experience and favorite libraries",
                f"Django/Flask frameworks and Python best practices" if technical_depth else "Python syntax and basic programming concepts"
            ])
        elif "sql" in skill_lower or "database" in skill_lower:
            skill_questions.extend([
                f"Database design and SQL query optimization",
                f"Performance tuning, indexing strategies, and database architecture" if technical_depth else "Basic SQL queries and database concepts"
            ])
        elif "aws" in skill_lower or "azure" in skill_lower or "cloud" in skill_lower:
            skill_questions.extend([
                f"Cloud platform experience and deployment strategies",
                f"Microservices, containerization, and cloud-native architectures" if technical_depth else "Basic cloud services and deployment"
            ])
    
    # Add default technical questions if no specific skills matched
    if not skill_questions:
        skill_questions = [
            "Your technical background and programming experience",
            "Problem-solving approach when facing technical challenges",
            "Tools and technologies you're most comfortable with"
        ]
    
    # Experience-level specific questions
    exp_questions = []
    if "senior" in experience_level or "lead" in experience_level:
        exp_questions.extend([
            "Leadership experience and team management approaches",
            "Mentoring junior developers and knowledge transfer strategies",
            "Architecture decisions and technical strategy involvement",
            "Code review processes and quality assurance practices"
        ])
    elif "mid" in experience_level:
        exp_questions.extend([
            "Project ownership and independent work experience", 
            "Collaboration with senior team members and stakeholders",
            "Technical decision-making within your current role"
        ])
    else:  # junior, entry-level, or intern
        exp_questions.extend([
            "Learning approach and how you stay updated with technology",
            "Academic projects, internships, or personal coding projects",
            "How you handle new technologies and learning challenges"
        ])
    
    # Work arrangement and location questions
    work_questions = []
    if work_type and work_type.lower() == "remote":
        work_questions.append("Remote work experience and self-management strategies")
    elif work_type and work_type.lower() == "hybrid":
        work_questions.append("Flexibility with hybrid work arrangements and office collaboration")
    elif work_type and work_type.lower() == "onsite":
        work_questions.append("Preference for in-office collaboration and team dynamics")
    
    if location:
        work_questions.append(f"Experience working in {location} or similar environments")
    
    # Salary and compensation questions
    salary_questions = []
    if salary_min and salary_max:
        salary_range = f"{salary_min:,}-{salary_max:,} {currency}"
        salary_questions.append(f"Thoughts on the salary range of {salary_range} for this position")
    else:
        salary_questions.append("Salary expectations and compensation preferences")
    
    # Construct the comprehensive AI prompt
    ai_prompt = f"""System: You are Al-hussein Abdullah, a friendly and highly experienced AI HR assistant for {company_name}. You are conducting a structured virtual interview for the {job_title} position. Your role is to evaluate candidates professionally while maintaining a warm, conversational tone.

PERSONALITY & BEHAVIOR:
- Professional yet approachable, like an experienced HR manager
- Ask one focused question at a time and wait for complete responses
- Use natural transitions: "That's great to hear", "Thanks for sharing", "Interesting, let's move on"
- Never provide feedback or hints during the interview
- Be encouraging but maintain professional boundaries
- Show genuine interest in their responses

INTERVIEW STRUCTURE:
1. **Opening Welcome**
   - Warm introduction and position overview
   - Set expectations for the interview process

2. **Background & Experience**
   - Overall experience in relevant field
   - Career progression and current role

3. **Technical Competency** (Choose 3-4 most relevant)
   - {skill_questions[0] if skill_questions else 'Technical experience relevant to this role'}
   - {skill_questions[1] if len(skill_questions) > 1 else 'Problem-solving methodology and approach'}
   - {skill_questions[2] if len(skill_questions) > 2 else 'Tools and technologies preference'}

4. **Experience Level Assessment**
   - {exp_questions[0] if exp_questions else 'Project ownership and responsibility levels'}
   - {exp_questions[1] if len(exp_questions) > 1 else 'Team collaboration and communication style'}

5. **Work Style & Environment**
   - {work_questions[0] if work_questions else 'Preferred work environment and team dynamics'}
   - {'Communication and collaboration preferences' if not work_questions else work_questions[1] if len(work_questions) > 1 else 'Team integration approach'}

6. **Projects & Achievements**
   - Most challenging project and how you handled it
   - Recent accomplishment you're proud of

7. **Role-Specific Interest**
   - What attracts you to this {job_title} position
   - How this role fits into your career goals

8. **Compensation & Logistics**
   - {salary_questions[0] if salary_questions else 'Salary expectations and benefits preferences'}
   - Availability and start date preferences

9. **Closing Questions**
   - Questions about the company, team, or role
   - Any additional information you'd like to share

CLOSING: Thank the candidate professionally and explain next steps (review responses, contact within 3-5 business days)."""

    # Construct detailed AI instructions
    ai_instructions = f"""INTERVIEW OPENING:
"Hello and welcome to your virtual interview for the {job_title} position at {company_name}. I'm Al-hussein Abdullah, your AI HR assistant. This is a comprehensive evaluation, but please feel comfortable and answer naturally. We'll cover your background, technical skills, and fit for this role. Ready to begin?"

EVALUATION FOCUS AREAS:

🎯 **Technical Skills Assessment:**
- Proficiency in: {', '.join(skills[:6]) if skills else 'relevant technologies for this role'}
- {'Senior-level' if technical_depth else 'Appropriate-level'} expertise and problem-solving
- Practical application of technologies in real projects

🎯 **Experience Level Evaluation:**
- {experience_level.replace('_', ' ').title() if experience_level else 'Appropriate'} level competency
- {'Leadership, mentoring, and strategic thinking' if technical_depth else 'Learning agility and growth potential'}
- Project complexity and responsibility levels

🎯 **Work Style & Cultural Fit:**
- {f'{work_type.title()} work capability and preferences' if work_type else 'Work flexibility and adaptation'}
- Communication skills and team collaboration
- Problem-solving approach and independence level

🎯 **Role Alignment:**
- Motivation for this specific position
- Career goals alignment with company growth
- {'Compensation expectations within {salary_range}' if salary_min and salary_max else 'Realistic salary expectations'}

INTERVIEW GUIDELINES:
- Maintain professional but warm tone throughout
- Allow candidates to fully express their thoughts
- Ask natural follow-up questions when needed
- Keep questions focused and relevant to the role
- Evaluate both technical skills and soft skills

CLOSING MESSAGE:
"Thank you for your time and thoughtful responses today. We've covered all the key areas for the {job_title} position at {company_name}. Our hiring team will carefully review your interview, and you can expect to hear back from us within 3-5 business days with next steps. Have a wonderful day!"

Remember: This is a formal evaluation that will be reviewed by the hiring team."""

    return ai_prompt, ai_instructions

def send_job_post_to_api(
    job_data: Dict[str, Any],
    company_id: str,
    company_name: str = None,
    user_id: str = None
) -> Dict[str, Any]:
    """
    Send job post data to the NestJS AI API endpoint (bypasses auth).
    
    Args:
        job_data: Dictionary containing all job post information
        company_id: The company ID creating the job post
        company_name: Optional company name
        user_id: Optional user ID (for tracking who created the job)
        
    Returns:
        Dictionary with the result of the API call
    """
    try:
        # Load environment variables with override to ensure fresh values
        load_dotenv(override=True)
        
        # Get API configuration from environment
        api_base_url = os.getenv("NESTJS_API_BASE_URL", "http://localhost:3000/api")
        
        # Construct API URL for AI job post creation (bypasses auth)
        # The base URL should already include /api if needed
        url = f"{api_base_url}/jobposts/ai-create"
        
        print(f"DEBUG: Sending job post to AI API: {url}")
        
        # Set up headers (no auth required for AI endpoint)
        headers = {
            "Content-Type": "application/json"
        }
        
        # Extract and format data to match CreateJobPostDto structure
        requirements_text = job_data.get("requirements", "")
        if isinstance(requirements_text, list):
            requirements_text = "\n".join(f"• {req}" for req in requirements_text)
        
        responsibilities_text = job_data.get("responsibilities", "")
        if isinstance(responsibilities_text, list):
            responsibilities_text = "\n".join(f"• {resp}" for resp in responsibilities_text)
            
        benefits_text = job_data.get("benefits", "")
        if isinstance(benefits_text, list):
            benefits_text = "\n".join(f"• {benefit}" for benefit in benefits_text)
        
        # Generate AI interview prompts based on job requirements
        ai_prompt, ai_instructions = generate_ai_interview_prompt(job_data, company_name or "our company")
        
        print(f"DEBUG: Generated AI Interview Prompt (length: {len(ai_prompt)})")
        print(f"DEBUG: Generated AI Instructions (length: {len(ai_instructions)})")
        
        # Prepare the job post payload to match CreateJobPostDto + AI endpoint requirements
        payload = {
            "title": job_data.get("title", ""),
            "description": job_data.get("description", ""),
            "requirements": requirements_text,
            "responsibilities": responsibilities_text if responsibilities_text else None,
            "benefits": benefits_text if benefits_text else None,
            "skills": job_data.get("skills", []),
            "experienceLevel": map_experience_level(job_data.get("experienceLevel", "")),
            "location": job_data.get("location", None),
            "workType": map_work_type(job_data.get("workType", "")),
            "salaryMin": job_data.get("salaryMin", None),
            "salaryMax": job_data.get("salaryMax", None),
            "currency": job_data.get("currency", None),
            "isFeatured": job_data.get("isFeatured", False),
            "expiresAt": job_data.get("expiresAt", None),
            # AI Interview Configuration - Auto-generated
            "enableAiInterview": True,  # Always enable AI interviews for agent-created jobs
            "interviewLanguages": job_data.get("interviewLanguages", ["English"]),
            "interviewDuration": job_data.get("interviewDuration", 30),  # Default 30 minutes
            "aiPrompt": ai_prompt,
            "aiInstructions": ai_instructions,
            # AI endpoint specific fields
            "companyId": company_id,
            "userId": user_id or "ai-agent",  # Default to "ai-agent" if no user_id provided
            "createdBy": "AI Job Post Agent"
        }
        
        # Remove None values to keep payload clean
        payload = {k: v for k, v in payload.items() if v is not None}
        
        print(f"DEBUG: Sending job post to API: {url}")
        print(f"DEBUG: Job post payload: {json.dumps(payload, indent=2)}")
        
        # Make the API request
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=30  # 30 second timeout
        )
        
        print(f"DEBUG: API Response Status: {response.status_code}")
        print(f"DEBUG: API Response: {response.text}")
        
        # Parse response
        if response.status_code in [200, 201]:
            # Success
            try:
                response_data = response.json()
                return {
                    "success": True,
                    "status_code": response.status_code,
                    "data": response_data,
                    "message": "Job post created successfully"
                }
            except json.JSONDecodeError:
                return {
                    "success": True,
                    "status_code": response.status_code,
                    "data": {"message": "Job post created successfully"},
                    "raw_response": response.text
                }
        else:
            # Error
            try:
                error_data = response.json()
                error_message = error_data.get("message", "Unknown error")
            except json.JSONDecodeError:
                error_message = response.text or f"HTTP {response.status_code} error"
                
            return {
                "success": False,
                "status_code": response.status_code,
                "error": error_message,
                "details": f"Failed to create job post via API"
            }
            
    except requests.exceptions.Timeout:
        return {
            "success": False,
            "status_code": 408,
            "error": "Request timeout - API took too long to respond",
            "details": "The job post API request timed out after 30 seconds"
        }
        
    except requests.exceptions.ConnectionError:
        return {
            "success": False,
            "status_code": 503,
            "error": "Connection error - Could not reach the API server",
            "details": f"Failed to connect to {api_base_url}"
        }
        
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "status_code": 500,
            "error": f"Request error: {str(e)}",
            "details": "An error occurred while making the API request"
        }
        
    except Exception as e:
        return {
            "success": False,
            "status_code": 500,
            "error": f"Unexpected error: {str(e)}",
            "details": "An unexpected error occurred while sending the job post"
        }

def validate_job_post_data(job_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate job post data before sending to API.
    
    Args:
        job_data: Job post data dictionary
        
    Returns:
        Dictionary with validation results
    """
    errors = []
    warnings = []
    
    # Required fields according to CreateJobPostDto
    required_fields = ["title", "description", "requirements"]
    for field in required_fields:
        if not job_data.get(field):
            errors.append(f"Missing required field: {field}")
    
    # Recommended fields
    recommended_fields = ["skills", "experienceLevel", "location"]
    for field in recommended_fields:
        field_value = job_data.get(field) or job_data.get(field.lower()) or job_data.get(field.replace("Level", "_level"))
        if not field_value:
            warnings.append(f"Missing recommended field: {field}")
    
    # Validate salary range
    salary_range = job_data.get("salary_range", {})
    if salary_range.get("min") and salary_range.get("max"):
        if salary_range["min"] > salary_range["max"]:
            errors.append("Minimum salary cannot be greater than maximum salary")
    
    # Validate experience level enum values
    experience_level = job_data.get("experience_level", "").upper()
    valid_experience_levels = ["ENTRY_LEVEL", "MID_LEVEL", "SENIOR_LEVEL", "EXECUTIVE"]
    if experience_level and experience_level not in valid_experience_levels:
        warnings.append(f"Experience level should be one of: {', '.join(valid_experience_levels)}")
    
    # Validate skills array
    skills = job_data.get("skills", [])
    if skills and not isinstance(skills, list):
        errors.append("Skills field must be an array/list")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings
    }
