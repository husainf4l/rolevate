# 🚀 Quick Start Guide - Rolevate CV Filler Agent

Get up and running in 5 minutes!

## Prerequisites

- Python 3.11 or higher
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- pip (Python package manager)

## Step 1: Clone or Navigate to Project

```bash
cd /path/to/rolevate-agent
```

## Step 2: Run Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

This will:
- Create a virtual environment
- Install all dependencies
- Create configuration files
- Set up directories

## Step 3: Configure Environment

Edit the `.env` file and add your OpenAI API key:

```bash
nano .env
# or
vim .env
# or use any text editor
```

Add your key:
```
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

## Step 4: Activate Virtual Environment

```bash
source venv/bin/activate
```

## Step 5: Test Installation

### Option A: Try the CLI

```bash
# List available commands
python cli.py --help

# List templates
python cli.py templates

# Process the sample CV
python cli.py fill \
  --data examples/sample_cv.json \
  --template modern \
  --format pdf \
  --output my_first_cv.pdf
```

### Option B: Start the API Server

```bash
# Start server
python cli.py serve

# Or use main.py
python main.py
```

Then open your browser to:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs

## Step 6: Process Your First CV

### Using CLI

```bash
# Complete pipeline: Extract + Fill + Export
python cli.py process \
  --input /path/to/your/cv.pdf \
  --template modern \
  --format pdf \
  --enhance
```

### Using API

```bash
# Upload and process CV
curl -X POST "http://localhost:8000/api/v1/cv/process" \
  -F "file=@/path/to/your/cv.pdf" \
  -F "template_name=modern" \
  -F "output_format=pdf" \
  -F "enhance=true"
```

## 📋 Common Commands

### Extract Data Only
```bash
python cli.py extract -i cv.pdf -o data.json --enhance
```

### Fill Template with JSON Data
```bash
python cli.py fill -d data.json -t professional -f docx
```

### Start API Server with Auto-Reload
```bash
python cli.py serve --reload
```

## 🎯 Next Steps

1. **Explore Templates**: Check `src/templates/` for available designs
2. **Read Documentation**: See `DOCUMENTATION.md` for detailed info
3. **Customize Templates**: Create your own template in `src/templates/`
4. **Integrate with Your App**: Use the REST API endpoints
5. **Run Tests**: `pytest tests/ -v`

## 🆘 Troubleshooting

### Virtual Environment Issues

```bash
# Deactivate current environment
deactivate

# Remove and recreate
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### WeasyPrint Installation Issues

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y libpango-1.0-0 libpangocairo-1.0-0
```

**macOS:**
```bash
brew install pango cairo
```

### OpenAI API Errors

- Verify your API key is correct in `.env`
- Check your OpenAI account has credits
- Ensure you have access to GPT-4 model

## 📚 Learn More

- **Full Documentation**: `DOCUMENTATION.md`
- **API Reference**: http://localhost:8000/docs (when server is running)
- **Examples**: See `examples/` directory
- **Code**: Explore `src/` directory

## 🎉 You're All Set!

Start processing CVs and building amazing applications with the CV Filler Agent!

---

**Need Help?**
- Check `DOCUMENTATION.md` for detailed guides
- Review example files in `examples/`
- Contact the development team
