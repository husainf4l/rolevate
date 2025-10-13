#!/bin/bash

# Rolevate CV Filler Agent - Setup Script

echo "🚀 Setting up Rolevate CV Filler Agent..."
echo ""

# Check Python version
echo "📋 Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "   Found Python $python_version"

# Create virtual environment
echo ""
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "   Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo ""
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo ""
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "   ⚠️  Please edit .env and add your OPENAI_API_KEY"
fi

# Create necessary directories
echo ""
echo "📁 Creating directories..."
mkdir -p uploads outputs

# Make CLI executable
chmod +x cli.py

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your OPENAI_API_KEY"
echo "2. Activate the virtual environment: source venv/bin/activate"
echo "3. Run the CLI: python cli.py --help"
echo "4. Or start the API: python main.py"
echo ""
