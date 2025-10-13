# 🚀 Rolevate CV Filler Agent

An intelligent AI-powered agent that automatically extracts structured data from CVs and fills professional templates.

## 📋 Features

- **AI-Powered Extraction**: Uses GPT-4 and LangChain to parse CV data intelligently
- **Multiple Input Formats**: Accepts PDF, TXT, JSON, and DOCX files
- **Template System**: Pre-designed professional CV templates
- **Multiple Output Formats**: Generate PDF and DOCX documents
- **REST API**: Easy integration with web applications
- **CLI Tool**: Command-line interface for batch processing
- **Flexible Storage**: Local filesystem or S3-compatible storage

## 🏗️ Architecture

```
rolevate-agent/
├── src/
│   ├── api/              # FastAPI endpoints
│   ├── core/             # Core business logic
│   ├── models/           # Pydantic schemas
│   ├── services/         # AI extraction & template filling
│   ├── templates/        # CV templates (HTML/DOCX)
│   └── utils/            # Helper functions
├── tests/                # Test suite
├── uploads/              # Temporary upload directory
├── outputs/              # Generated CVs
└── cli.py               # Command-line interface
```

## 🚀 Quick Start

### 1. Installation

```bash
cd rolevate-agent
pip install -r requirements.txt
```

### 2. Configuration

```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### 3. Run API Server

```bash
python main.py
```

API will be available at: `http://localhost:8000`

### 4. Use CLI

```bash
# Parse and fill CV in one command
python cli.py process --input cv.pdf --template modern --output filled_cv.pdf
```

## 📡 API Endpoints

### Upload & Parse CV
```bash
POST /api/v1/cv/upload
Content-Type: multipart/form-data

# Returns structured JSON with extracted data
```

### Fill Template
```bash
POST /api/v1/cv/fill
Content-Type: application/json

{
  "cv_data": {...},
  "template": "modern",
  "output_format": "pdf"
}
```

### Complete Pipeline
```bash
POST /api/v1/cv/process
Content-Type: multipart/form-data

# Upload CV, extract, fill template, and return download link
```

## 🎨 Available Templates

1. **Modern** - Clean, minimalist design
2. **Professional** - Traditional corporate style
3. **Creative** - Colorful and dynamic layout

## 🧪 Testing

```bash
pytest tests/ -v
```

## 📝 Usage Examples

### Python SDK

```python
from src.services.cv_agent import CVFillerAgent

agent = CVFillerAgent()

# Extract data from CV
cv_data = await agent.extract_from_file("path/to/cv.pdf")

# Fill template and generate PDF
pdf_path = await agent.fill_and_export(
    cv_data=cv_data,
    template_name="modern",
    output_format="pdf"
)
```

### CLI Examples

```bash
# Extract only
python cli.py extract --input cv.pdf --output data.json

# Fill template with JSON data
python cli.py fill --data data.json --template professional --output cv.pdf

# Full pipeline
python cli.py process --input cv.pdf --template modern --output result.pdf
```

## 🔧 Configuration

Edit `.env` file to configure:
- OpenAI API key and model
- Storage location (local/S3)
- Upload limits
- Default templates

## 📦 Dependencies

- **FastAPI** - Modern web framework
- **LangChain** - LLM orchestration
- **OpenAI** - GPT-4 for intelligent parsing
- **WeasyPrint** - HTML to PDF conversion
- **python-docx** - Word document generation
- **Jinja2** - Template engine

## 🤝 Contributing

This is part of the Rolevate platform. For contribution guidelines, see the main repository.

## 📄 License

Proprietary - Rolevate Platform

## 🆘 Support

For issues and questions, contact the Rolevate development team.
