#!/bin/bash
# Setup script for Rolevate Interview Agent

set -e

echo "🚀 Setting up Rolevate Interview Agent..."
echo ""

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
else
    echo "✅ Virtual environment found"
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source .venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "To activate the virtual environment manually, run:"
echo "  source .venv/bin/activate"
echo ""
echo "To start the agent, run:"
echo "  python agent.py dev"
echo ""
