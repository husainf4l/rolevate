#!/bin/bash

# Rolevate CV Filler Agent - File Structure Verification
# Run this to see the complete project structure

echo "======================================"
echo "  Rolevate CV Filler Agent Structure"
echo "======================================"
echo ""

tree -L 4 -I 'venv|__pycache__|*.pyc|.git' . || find . -type f -not -path "*/venv/*" -not -path "*/__pycache__/*" -not -name "*.pyc" | sort

echo ""
echo "======================================"
echo "  File Count Summary"
echo "======================================"
echo ""

echo "Python files: $(find . -name "*.py" -not -path "*/venv/*" | wc -l)"
echo "Documentation: $(find . -name "*.md" | wc -l)"
echo "Templates: $(find ./src/templates -name "*.html" -o -name "*.css" 2>/dev/null | wc -l)"
echo "Tests: $(find ./tests -name "test_*.py" 2>/dev/null | wc -l)"
echo ""

echo "✅ Project structure verified!"
