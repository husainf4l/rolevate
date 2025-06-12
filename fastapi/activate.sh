#!/bin/bash
# Activation script for the FastAPI CV Analysis project

echo "🚀 Activating FastAPI CV Analysis Environment..."

# Activate virtual environment
source venv/bin/activate

# Check if activation was successful
if [ "$VIRTUAL_ENV" != "" ]; then
    echo "✅ Virtual environment activated: $VIRTUAL_ENV"
    echo "🐍 Python version: $(python --version)"
    echo "📦 Pip version: $(pip --version)"
    echo ""
    echo "📋 Available commands:"
    echo "  uvicorn main:app --reload    # Start the FastAPI server"
    echo "  python -m pytest            # Run tests"
    echo "  alembic upgrade head         # Apply database migrations"
    echo ""
    echo "💡 To deactivate: type 'deactivate'"
else
    echo "❌ Failed to activate virtual environment"
    exit 1
fi
