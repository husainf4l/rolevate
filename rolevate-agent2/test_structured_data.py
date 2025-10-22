#!/usr/bin/env python3
"""
Test script for structured experience and education extraction
"""

import json
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from cvagent.nodes.extract_info import clean_candidate_data, clean_experience, clean_education, normalize_date, clean_phone_number
from cvagent.utils.data_examples import STRUCTURED_CANDIDATE_EXAMPLE, STRING_CANDIDATE_EXAMPLE, validate_candidate_data, print_validation_report


def test_date_normalization():
    """Test date normalization function"""
    print("\n" + "="*60)
    print("Testing Date Normalization")
    print("="*60)
    
    test_cases = [
        ("2020", "2020-01"),
        ("2020-03", "2020-03"),
        ("2020-03-15", "2020-03-15"),
        ("202003", "2020-03"),
        ("", None),
    ]
    
    all_passed = True
    for input_date, expected in test_cases:
        result = normalize_date(input_date)
        status = "✅" if result == expected else "❌"
        print(f"{status} '{input_date}' → '{result}' (expected: '{expected}')")
        if result != expected:
            all_passed = False
    
    return all_passed


def test_phone_cleaning():
    """Test phone number cleaning function"""
    print("\n" + "="*60)
    print("Testing Phone Number Cleaning")
    print("="*60)
    
    test_cases = [
        ("0791234567", "+962791234567"),
        ("791234567", "+962791234567"),
        ("+962791234567", "+962791234567"),
        ("962791234567", "+962791234567"),
    ]
    
    all_passed = True
    for input_phone, expected in test_cases:
        result = clean_phone_number(input_phone)
        status = "✅" if result == expected else "❌"
        print(f"{status} '{input_phone}' → '{result}' (expected: '{expected}')")
        if result != expected:
            all_passed = False
    
    return all_passed


def test_experience_cleaning():
    """Test experience entry cleaning"""
    print("\n" + "="*60)
    print("Testing Experience Cleaning")
    print("="*60)
    
    test_data = {
        "company": "  Google Inc  ",
        "position": " Software Engineer ",
        "startDate": "2020",
        "endDate": None,
        "isCurrent": True,
        "description": "  Built cool stuff  "
    }
    
    cleaned = clean_experience(test_data)
    
    checks = [
        (cleaned.get("company") == "Google Inc", "Company trimmed correctly"),
        (cleaned.get("position") == "Software Engineer", "Position trimmed correctly"),
        (cleaned.get("startDate") == "2020-01", "Start date normalized"),
        (cleaned.get("endDate") is None, "End date is None for current position"),
        (cleaned.get("isCurrent") is True, "isCurrent flag preserved"),
        (cleaned.get("description") == "Built cool stuff", "Description trimmed correctly"),
    ]
    
    all_passed = True
    for passed, description in checks:
        status = "✅" if passed else "❌"
        print(f"{status} {description}")
        if not passed:
            all_passed = False
    
    print(f"\nCleaned data: {json.dumps(cleaned, indent=2)}")
    return all_passed


def test_education_cleaning():
    """Test education entry cleaning"""
    print("\n" + "="*60)
    print("Testing Education Cleaning")
    print("="*60)
    
    test_data = {
        "institution": "  MIT  ",
        "degree": " Master of Science ",
        "fieldOfStudy": " Computer Science ",
        "startDate": "2020",
        "endDate": "2022-06",
        "grade": "3.9/4.0",
        "description": "  Thesis on AI  "
    }
    
    cleaned = clean_education(test_data)
    
    checks = [
        (cleaned.get("institution") == "MIT", "Institution trimmed correctly"),
        (cleaned.get("degree") == "Master of Science", "Degree trimmed correctly"),
        (cleaned.get("fieldOfStudy") == "Computer Science", "Field trimmed correctly"),
        (cleaned.get("startDate") == "2020-01", "Start date normalized"),
        (cleaned.get("endDate") == "2022-06", "End date preserved"),
        (cleaned.get("grade") == "3.9/4.0", "Grade preserved"),
        (cleaned.get("description") == "Thesis on AI", "Description trimmed correctly"),
    ]
    
    all_passed = True
    for passed, description in checks:
        status = "✅" if passed else "❌"
        print(f"{status} {description}")
        if not passed:
            all_passed = False
    
    print(f"\nCleaned data: {json.dumps(cleaned, indent=2)}")
    return all_passed


def test_full_candidate_cleaning():
    """Test full candidate data cleaning"""
    print("\n" + "="*60)
    print("Testing Full Candidate Data Cleaning")
    print("="*60)
    
    test_data = {
        "firstName": "  Ahmad  ",
        "lastName": "  Ali  ",
        "email": "  Ahmad.Ali@Example.COM  ",
        "phone": "0791234567",
        "location": "  Amman, Jordan  ",
        "bio": "  Software engineer  ",
        "skills": ["  Python  ", "FastAPI", "  ", "PostgreSQL"],
        "linkedinUrl": "  https://linkedin.com/in/ahmad  ",
        "githubUrl": " https://github.com/ahmad ",
        "experience": [
            {
                "company": "Google",
                "position": "Engineer",
                "startDate": "2020",
                "isCurrent": True
            }
        ],
        "education": [
            {
                "institution": "MIT",
                "degree": "MS",
                "fieldOfStudy": "CS",
                "endDate": "2022"
            }
        ]
    }
    
    cleaned = clean_candidate_data(test_data)
    
    checks = [
        (cleaned.get("firstName") == "Ahmad", "First name cleaned"),
        (cleaned.get("lastName") == "Ali", "Last name cleaned"),
        (cleaned.get("email") == "ahmad.ali@example.com", "Email lowercased"),
        (cleaned.get("phone") == "+962791234567", "Phone has country code"),
        (cleaned.get("location") == "Amman, Jordan", "Location trimmed"),
        (len(cleaned.get("skills", [])) == 3, "Empty skills removed"),
        (isinstance(cleaned.get("experience"), list), "Experience is array"),
        (len(cleaned.get("experience", [])) == 1, "Experience has 1 entry"),
        (isinstance(cleaned.get("education"), list), "Education is array"),
        (len(cleaned.get("education", [])) == 1, "Education has 1 entry"),
    ]
    
    all_passed = True
    for passed, description in checks:
        status = "✅" if passed else "❌"
        print(f"{status} {description}")
        if not passed:
            all_passed = False
    
    print(f"\nCleaned data preview:")
    print(f"  Name: {cleaned.get('firstName')} {cleaned.get('lastName')}")
    print(f"  Email: {cleaned.get('email')}")
    print(f"  Phone: {cleaned.get('phone')}")
    print(f"  Skills: {cleaned.get('skills')}")
    print(f"  Experience entries: {len(cleaned.get('experience', []))}")
    print(f"  Education entries: {len(cleaned.get('education', []))}")
    
    return all_passed


def test_validation():
    """Test validation functions"""
    print("\n" + "="*60)
    print("Testing Validation Functions")
    print("="*60)
    
    # Test valid structured data
    print("\n1. Valid Structured Data:")
    result = validate_candidate_data(STRUCTURED_CANDIDATE_EXAMPLE)
    print(f"   Valid: {result['isValid']}")
    print(f"   Errors: {len(result['errors'])}")
    print(f"   Warnings: {len(result['warnings'])}")
    
    # Test valid string data
    print("\n2. Valid String Data:")
    result = validate_candidate_data(STRING_CANDIDATE_EXAMPLE)
    print(f"   Valid: {result['isValid']}")
    print(f"   Errors: {len(result['errors'])}")
    print(f"   Warnings: {len(result['warnings'])}")
    
    # Test invalid data
    print("\n3. Invalid Data (missing name):")
    invalid_data = {"email": "test@example.com"}
    result = validate_candidate_data(invalid_data)
    print(f"   Valid: {result['isValid']}")
    print(f"   Errors: {result['errors']}")
    
    return True


def run_all_tests():
    """Run all tests"""
    print("\n" + "🧪 " * 30)
    print("RUNNING STRUCTURED DATA TESTS")
    print("🧪 " * 30)
    
    tests = [
        ("Date Normalization", test_date_normalization),
        ("Phone Cleaning", test_phone_cleaning),
        ("Experience Cleaning", test_experience_cleaning),
        ("Education Cleaning", test_education_cleaning),
        ("Full Candidate Cleaning", test_full_candidate_cleaning),
        ("Validation", test_validation),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            passed = test_func()
            results.append((name, passed))
        except Exception as e:
            print(f"\n❌ {name} failed with error: {e}")
            results.append((name, False))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    
    for name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed_count}/{total_count} tests passed")
    
    if passed_count == total_count:
        print("\n🎉 All tests passed! 🎉")
        return 0
    else:
        print(f"\n⚠️  {total_count - passed_count} test(s) failed")
        return 1


def show_examples():
    """Show example data structures"""
    print("\n" + "📋 " * 30)
    print("EXAMPLE DATA STRUCTURES")
    print("📋 " * 30)
    
    print("\n1. Structured Example:")
    print_validation_report(STRUCTURED_CANDIDATE_EXAMPLE)
    
    print("\n2. String Example:")
    print_validation_report(STRING_CANDIDATE_EXAMPLE)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Test structured data extraction")
    parser.add_argument("--examples", action="store_true", help="Show example data structures")
    parser.add_argument("--tests", action="store_true", help="Run all tests")
    
    args = parser.parse_args()
    
    if args.examples:
        show_examples()
    elif args.tests:
        exit_code = run_all_tests()
        sys.exit(exit_code)
    else:
        # Run both by default
        show_examples()
        exit_code = run_all_tests()
        sys.exit(exit_code)
