"""
Example data structures and validation utilities for CV analysis
"""

from typing import Dict, List, Any


# Example of structured experience and education data
STRUCTURED_CANDIDATE_EXAMPLE = {
    "name": "Ahmad Ali",
    "email": "ahmad.ali@example.com",
    "phone": "+962791234567",
    "location": "Amman, Jordan",
    "bio": "Experienced software engineer with 5+ years building scalable web applications and cloud infrastructure.",
    "linkedinUrl": "https://linkedin.com/in/ahmad-ali",
    "githubUrl": "https://github.com/ahmadali",
    "portfolioUrl": "https://ahmadali.dev",
    "skills": [
        "Python",
        "FastAPI",
        "PostgreSQL",
        "Docker",
        "AWS",
        "React",
        "TypeScript",
        "GraphQL"
    ],
    "experience": [
        {
            "company": "Tech Innovations Ltd",
            "position": "Senior Software Engineer",
            "startDate": "2021-03",
            "endDate": None,
            "isCurrent": True,
            "description": "Leading development of microservices architecture using FastAPI and PostgreSQL. Built CI/CD pipelines and improved deployment efficiency by 40%."
        },
        {
            "company": "Digital Solutions Inc",
            "position": "Software Engineer",
            "startDate": "2019-06",
            "endDate": "2021-02",
            "isCurrent": False,
            "description": "Developed RESTful APIs and React frontend applications. Collaborated with cross-functional teams to deliver enterprise solutions."
        },
        {
            "company": "StartupXYZ",
            "position": "Junior Developer",
            "startDate": "2018-01",
            "endDate": "2019-05",
            "isCurrent": False,
            "description": "Full-stack development using Python Django and Vue.js. Built customer-facing features and internal tools."
        }
    ],
    "education": [
        {
            "institution": "Jordan University of Science and Technology",
            "degree": "Master of Science",
            "fieldOfStudy": "Computer Science",
            "startDate": "2016-09",
            "endDate": "2018-06",
            "grade": "3.8/4.0",
            "description": "Specialization in Distributed Systems and Cloud Computing. Thesis on microservices architecture."
        },
        {
            "institution": "University of Jordan",
            "degree": "Bachelor of Science",
            "fieldOfStudy": "Computer Engineering",
            "startDate": "2012-09",
            "endDate": "2016-06",
            "grade": "3.6/4.0",
            "description": "Dean's List for 3 semesters. Participated in ACM programming competitions."
        }
    ]
}


# Example of simple string format (backward compatible)
STRING_CANDIDATE_EXAMPLE = {
    "name": "Sarah Mohammed",
    "email": "sarah.mohammed@example.com",
    "phone": "+962795555555",
    "location": "Dubai, UAE",
    "bio": "Marketing professional with expertise in digital campaigns and brand strategy.",
    "skills": ["Digital Marketing", "SEO", "Content Strategy", "Analytics"],
    "experience": "Marketing Manager at ABC Corp (2020-Present); Marketing Specialist at XYZ Ltd (2018-2020)",
    "education": "MBA in Marketing from American University (2016-2018); BS in Business from Jordan University (2012-2016)"
}


def validate_experience_entry(exp: Dict[str, Any]) -> bool:
    """Validate a single experience entry has required fields"""
    required = ["company", "position"]
    return all(exp.get(field) for field in required)


def validate_education_entry(edu: Dict[str, Any]) -> bool:
    """Validate a single education entry has required fields"""
    required = ["institution", "degree"]
    return all(edu.get(field) for field in required)


def validate_candidate_data(data: Dict[str, Any]) -> Dict[str, List[str]]:
    """
    Validate candidate data structure and return validation results
    
    Returns:
        Dict with 'errors' and 'warnings' lists
    """
    errors = []
    warnings = []
    
    # Check basic required fields
    if not data.get("name"):
        # Support legacy firstName/lastName
        if not data.get("firstName") and not data.get("lastName"):
            errors.append("Missing name")
    
    if not data.get("email"):
        warnings.append("Missing email address")
    
    # Validate experience if it's an array
    if data.get("experience"):
        if isinstance(data["experience"], list):
            for i, exp in enumerate(data["experience"]):
                if not validate_experience_entry(exp):
                    errors.append(f"Experience entry {i+1} missing required fields (company, position)")
        elif not isinstance(data["experience"], str):
            errors.append("Experience must be either a string or an array of objects")
    
    # Validate education if it's an array
    if data.get("education"):
        if isinstance(data["education"], list):
            for i, edu in enumerate(data["education"]):
                if not validate_education_entry(edu):
                    errors.append(f"Education entry {i+1} missing required fields (institution, degree)")
        elif not isinstance(data["education"], str):
            errors.append("Education must be either a string or an array of objects")
    
    # Validate skills
    if data.get("skills") and not isinstance(data["skills"], list):
        errors.append("Skills must be an array")
    
    return {
        "errors": errors,
        "warnings": warnings,
        "isValid": len(errors) == 0
    }


def print_validation_report(data: Dict[str, Any]) -> None:
    """Print a formatted validation report for candidate data"""
    result = validate_candidate_data(data)
    
    print("\n" + "="*60)
    print("CANDIDATE DATA VALIDATION REPORT")
    print("="*60)
    
    # Basic info
    name = data.get('name') or f"{data.get('firstName', '')} {data.get('lastName', '')}".strip() or "Unknown"
    print(f"\nCandidate: {name}")
    print(f"Email: {data.get('email', 'Not provided')}")
    
    # Data format
    print(f"\nData Format:")
    exp_format = "Array" if isinstance(data.get("experience"), list) else "String" if data.get("experience") else "None"
    edu_format = "Array" if isinstance(data.get("education"), list) else "String" if data.get("education") else "None"
    print(f"  Experience: {exp_format}")
    print(f"  Education: {edu_format}")
    print(f"  Skills: {len(data.get('skills', []))} items")
    
    # Validation results
    print(f"\nValidation Status: {'✅ PASSED' if result['isValid'] else '❌ FAILED'}")
    
    if result['errors']:
        print(f"\n❌ Errors ({len(result['errors'])}):")
        for error in result['errors']:
            print(f"  - {error}")
    
    if result['warnings']:
        print(f"\n⚠️  Warnings ({len(result['warnings'])}):")
        for warning in result['warnings']:
            print(f"  - {warning}")
    
    if result['isValid'] and not result['warnings']:
        print("\n✅ All validations passed!")
    
    print("="*60 + "\n")


# Test the examples
if __name__ == "__main__":
    print("\n🧪 Testing Structured Example:")
    print_validation_report(STRUCTURED_CANDIDATE_EXAMPLE)
    
    print("\n🧪 Testing String Example:")
    print_validation_report(STRING_CANDIDATE_EXAMPLE)
