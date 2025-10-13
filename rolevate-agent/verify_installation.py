#!/usr/bin/env python3
"""
Rolevate CV Filler Agent - Installation Verification Script
Run this after setup to verify everything is working correctly.
"""

import sys
import os
from pathlib import Path

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}{text.center(60)}{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")

def check_pass(text):
    print(f"{GREEN}✓{RESET} {text}")

def check_fail(text):
    print(f"{RED}✗{RESET} {text}")

def check_warn(text):
    print(f"{YELLOW}⚠{RESET} {text}")

def check_python_version():
    """Check Python version."""
    version = sys.version_info
    if version.major == 3 and version.minor >= 11:
        check_pass(f"Python version: {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        check_fail(f"Python version: {version.major}.{version.minor}.{version.micro} (Need 3.11+)")
        return False

def check_dependencies():
    """Check if all dependencies are installed."""
    required = [
        'fastapi', 'uvicorn', 'pydantic', 'langchain', 'langchain_openai',
        'openai', 'jinja2', 'weasyprint', 'click', 'loguru', 'PyPDF2', 'docx'
    ]
    
    missing = []
    for package in required:
        try:
            __import__(package.replace('-', '_'))
            check_pass(f"Package installed: {package}")
        except ImportError:
            check_fail(f"Package missing: {package}")
            missing.append(package)
    
    return len(missing) == 0

def check_env_file():
    """Check if .env file exists and has required keys."""
    env_path = Path('.env')
    
    if not env_path.exists():
        check_fail(".env file not found")
        check_warn("Run: cp .env.example .env")
        return False
    
    check_pass(".env file exists")
    
    # Check for OpenAI API key
    with open(env_path, 'r') as f:
        content = f.read()
        if 'OPENAI_API_KEY=sk-' in content and 'your-openai-api-key' not in content:
            check_pass("OpenAI API key configured")
            return True
        else:
            check_warn("OpenAI API key not configured")
            check_warn("Edit .env and add your OPENAI_API_KEY")
            return False

def check_directories():
    """Check if required directories exist."""
    required_dirs = [
        'src', 'src/api', 'src/core', 'src/models', 'src/services',
        'src/templates', 'src/utils', 'tests', 'uploads', 'outputs', 'examples'
    ]
    
    all_exist = True
    for dir_path in required_dirs:
        path = Path(dir_path)
        if path.exists():
            check_pass(f"Directory exists: {dir_path}")
        else:
            check_fail(f"Directory missing: {dir_path}")
            all_exist = False
    
    return all_exist

def check_templates():
    """Check if templates exist."""
    template_dir = Path('src/templates/modern')
    
    if not template_dir.exists():
        check_fail("Modern template directory not found")
        return False
    
    check_pass("Modern template directory exists")
    
    html_file = template_dir / 'template.html'
    css_file = template_dir / 'style.css'
    
    if html_file.exists():
        check_pass("Modern template HTML exists")
    else:
        check_fail("Modern template HTML missing")
        return False
    
    if css_file.exists():
        check_pass("Modern template CSS exists")
    else:
        check_warn("Modern template CSS missing (optional)")
    
    return True

def check_import():
    """Try importing the main modules."""
    sys.path.insert(0, str(Path(__file__).parent))
    
    try:
        from src.core.config import settings
        check_pass("Core config module imports successfully")
    except Exception as e:
        check_fail(f"Core config import failed: {e}")
        return False
    
    try:
        from src.models.cv_schema import CVData
        check_pass("CV schema module imports successfully")
    except Exception as e:
        check_fail(f"CV schema import failed: {e}")
        return False
    
    try:
        from src.services.cv_agent import CVFillerAgent
        check_pass("CV Agent module imports successfully")
    except Exception as e:
        check_fail(f"CV Agent import failed: {e}")
        return False
    
    return True

def main():
    """Run all verification checks."""
    print_header("ROLEVATE CV FILLER AGENT")
    print_header("Installation Verification")
    
    results = []
    
    # Check Python version
    print_header("Python Version")
    results.append(check_python_version())
    
    # Check dependencies
    print_header("Dependencies")
    results.append(check_dependencies())
    
    # Check .env file
    print_header("Environment Configuration")
    env_ok = check_env_file()
    results.append(env_ok)
    
    # Check directories
    print_header("Directory Structure")
    results.append(check_directories())
    
    # Check templates
    print_header("Templates")
    results.append(check_templates())
    
    # Check imports
    print_header("Module Imports")
    results.append(check_import())
    
    # Summary
    print_header("Verification Summary")
    
    if all(results):
        print(f"{GREEN}{'='*60}{RESET}")
        print(f"{GREEN}✓ ALL CHECKS PASSED{RESET}".center(60))
        print(f"{GREEN}{'='*60}{RESET}\n")
        print("🎉 Installation verified successfully!")
        print("\nNext steps:")
        print("1. Make sure OpenAI API key is set in .env")
        print("2. Run: python cli.py templates")
        print("3. Try: python cli.py fill --data examples/sample_cv.json --template modern --format pdf")
        print("4. Or start API: python cli.py serve")
        return 0
    else:
        print(f"{RED}{'='*60}{RESET}")
        print(f"{RED}✗ SOME CHECKS FAILED{RESET}".center(60))
        print(f"{RED}{'='*60}{RESET}\n")
        print("Please fix the issues above and run verification again.")
        print("\nCommon fixes:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Create .env file: cp .env.example .env")
        print("3. Add OpenAI API key to .env")
        print("4. Run setup script: ./setup.sh")
        return 1

if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\nVerification interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n{RED}Error during verification: {e}{RESET}")
        sys.exit(1)
