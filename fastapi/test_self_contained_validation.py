#!/usr/bin/env python3
"""
Standalone test script to verify job post validation fixes.
This script implements a simplified version of the validation logic
for testing without dependencies.
"""

import json
import os
from dotenv import load_dotenv

def test_job_post_validation():
    """Test job post validation with problematic data that should be fixed."""
    
    print("🧪 Testing job post validation fixes...\n")
    
    # Load environment variables
    load_dotenv()
    
    # Sample job post with validation issues
    problematic_job_post = {
        "title": "Senior Software Developer",
        "description": "We are looking for an experienced developer to join our team.",
        "requirements": "- 5+ years experience\n- Strong coding skills",
        "department": "Engineering",  # This field should be removed
        "experienceLevel": "senior",  # This should be mapped to SENIOR
        "salaryMin": "5000.50",  # This should be converted to integer
        "salaryMax": "8000.75",  # This should be converted to integer
        "location": "Amman, Jordan",
        "workType": "hybrid",
        "skills": ["Python", "JavaScript", "React"],
        "currency": "JOD"
    }
    
    print("📋 Original job post data:")
    print(json.dumps(problematic_job_post, indent=2))
    print("\n")
    
    # Validate and fix job post data
    fixed_job_post = validate_and_fix_job_post(problematic_job_post)
    
    print("✅ Fixed job post data:")
    print(json.dumps(fixed_job_post, indent=2))
    print("\n")
    
    # Check for fixes:
    print("🔍 Validation results:")
    if "department" not in fixed_job_post:
        print("✅ Department field was properly removed")
    else:
        print("❌ Department field was not removed")
        
    if fixed_job_post.get("experienceLevel") == "SENIOR":
        print("✅ Experience level was properly mapped to SENIOR")
    else:
        print("❌ Experience level was not properly mapped")
        
    if isinstance(fixed_job_post.get("salaryMin"), int):
        print("✅ Salary min was properly converted to integer")
    else:
        print("❌ Salary min was not properly converted to integer")
        
    if isinstance(fixed_job_post.get("salaryMax"), int):
        print("✅ Salary max was properly converted to integer")
    else:
        print("❌ Salary max was not properly converted to integer")

def validate_and_fix_job_post(job_data):
    """Simplified version of the validation logic for testing."""
    
    # Create a copy to avoid modifying the original
    job_data = job_data.copy()
    
    # Remove department field if it exists
    if "department" in job_data:
        print("🔧 Removing department field")
        job_data.pop("department")
    
    # Map experience level
    experience_level = job_data.get("experienceLevel", "")
    valid_experience_levels = ["ENTRY_LEVEL", "JUNIOR", "MID_LEVEL", "SENIOR", "LEAD", "PRINCIPAL", "EXECUTIVE"]
    
    # Simple mapping function
    level_mapping = {
        "entry": "ENTRY_LEVEL",
        "entry level": "ENTRY_LEVEL",
        "junior": "JUNIOR",
        "mid": "MID_LEVEL",
        "middle": "MID_LEVEL", 
        "senior": "SENIOR",
        "lead": "LEAD",
        "principal": "PRINCIPAL",
        "executive": "EXECUTIVE"
    }
    
    if experience_level and experience_level.lower() in level_mapping:
        print(f"🔧 Mapping experience level '{experience_level}' to '{level_mapping[experience_level.lower()]}'")
        job_data["experienceLevel"] = level_mapping[experience_level.lower()]
    elif experience_level and experience_level.upper() not in valid_experience_levels:
        print(f"⚠️ Invalid experience level '{experience_level}' - using MID_LEVEL default")
        job_data["experienceLevel"] = "MID_LEVEL"
    elif experience_level:
        job_data["experienceLevel"] = experience_level.upper()
    
    # Fix salary values
    try:
        if "salaryMin" in job_data:
            salary_min = float(job_data.get("salaryMin", 0))
            print(f"🔧 Converting salaryMin from {job_data['salaryMin']} to {int(salary_min)}")
            job_data["salaryMin"] = int(salary_min)
    except (ValueError, TypeError):
        print("⚠️ Invalid salaryMin value - setting to 0")
        job_data["salaryMin"] = 0
        
    try:
        if "salaryMax" in job_data:
            salary_max = float(job_data.get("salaryMax", 0))
            print(f"🔧 Converting salaryMax from {job_data['salaryMax']} to {int(salary_max)}")
            job_data["salaryMax"] = int(salary_max)
    except (ValueError, TypeError):
        print("⚠️ Invalid salaryMax value - setting to 0")
        job_data["salaryMax"] = 0
    
    return job_data

if __name__ == "__main__":
    test_job_post_validation()
