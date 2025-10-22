#!/usr/bin/env python3
"""
Verification script for the rolevate Python environment setup.
This script tests that all required packages are properly installed.
"""

import sys
import importlib

def test_import(package_name, display_name=None):
    """Test if a package can be imported successfully."""
    if display_name is None:
        display_name = package_name
    
    try:
        importlib.import_module(package_name)
        print(f"✅ {display_name}: Successfully imported")
        return True
    except ImportError as e:
        print(f"❌ {display_name}: Failed to import - {e}")
        return False

def main():
    """Run all package import tests."""
    print("🔧 Verifying rolevate Python environment setup...\n")
    
    packages_to_test = [
        ("fastapi", "FastAPI"),
        ("uvicorn", "Uvicorn"),
        ("langchain", "LangChain"),
        ("openai", "OpenAI"),
        ("weasyprint", "WeasyPrint"),
        ("docxtpl", "DocxTpl (python-docx-template)"),
        ("PyPDF2", "PyPDF2"),
        ("jinja2", "Jinja2")
    ]
    
    success_count = 0
    total_count = len(packages_to_test)
    
    for package, display_name in packages_to_test:
        if test_import(package, display_name):
            success_count += 1
    
    print(f"\n📊 Results: {success_count}/{total_count} packages successfully imported")
    
    if success_count == total_count:
        print("🎉 All packages are properly installed! Environment setup is complete.")
        return 0
    else:
        print("⚠️  Some packages failed to import. Please check the installation.")
        return 1

if __name__ == "__main__":
    sys.exit(main())