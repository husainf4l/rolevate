"""
Pre-commit script to ensure code quality.
Run before committing code to repository.
"""

import subprocess
import sys


def run_command(command: str, description: str) -> bool:
    """Run a command and return success status."""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=True,
            capture_output=True,
            text=True
        )
        print(result.stdout)
        print(f"✅ {description} passed")
        return True
    except subprocess.CalledProcessError as e:
        print(e.stdout)
        print(e.stderr)
        print(f"❌ {description} failed")
        return False


def main():
    """Run all code quality checks."""
    print("\n🚀 Starting code quality checks...\n")
    
    checks = [
        ("black --check .", "Code formatting (black)"),
        ("ruff check .", "Linting (ruff)"),
        ("mypy --install-types --non-interactive .", "Type checking (mypy)"),
        ("pytest --maxfail=1 -x", "Unit tests"),
    ]
    
    all_passed = True
    for command, description in checks:
        if not run_command(command, description):
            all_passed = False
    
    print(f"\n{'='*60}")
    if all_passed:
        print("✅ All checks passed! Ready to commit.")
        print(f"{'='*60}\n")
        return 0
    else:
        print("❌ Some checks failed. Please fix them before committing.")
        print(f"{'='*60}\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
