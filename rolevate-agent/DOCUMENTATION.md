# Rolevate CV Filler Agent - Technical Documentation

## 📋 Overview

The CV Filler Agent is an intelligent, AI-powered system that automates the process of extracting structured data from CVs and filling professional templates. It uses GPT-4 and LangChain for intelligent parsing and supports multiple output formats.

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     CV Filler Agent                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Input      │───▶│  Extraction  │───▶│   Template   │  │
│  │   Layer      │    │    Layer     │    │    Filler    │  │
│  │              │    │              │    │              │  │
│  │ • PDF Parser │    │ • LangChain  │    │ • Jinja2     │  │
│  │ • DOCX Parse │    │ • GPT-4      │    │ • HTML/CSS   │  │
│  │ • TXT Parse  │    │ • Pydantic   │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                ↓              │
│                                         ┌──────────────┐     │
│                                         │   Export     │     │
│                                         │   Layer      │     │
│                                         │              │     │
│                                         │ • WeasyPrint │     │
│                                         │ • python-docx│     │
│                                         └──────────────┘     │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                     API & CLI Interface                       │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
rolevate-agent/
├── src/
│   ├── api/
│   │   ├── __init__.py
│   │   └── main.py                 # FastAPI application
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py               # Configuration management
│   ├── models/
│   │   ├── __init__.py
│   │   └── cv_schema.py            # Pydantic models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── cv_agent.py             # Main orchestrator
│   │   ├── cv_extractor.py         # AI extraction service
│   │   ├── cv_exporter.py          # PDF/DOCX export
│   │   └── template_filler.py      # Template rendering
│   ├── templates/
│   │   ├── modern/
│   │   │   ├── template.html
│   │   │   └── style.css
│   │   ├── professional/
│   │   └── creative/
│   └── utils/
│       ├── __init__.py
│       └── file_parser.py          # File parsing utilities
├── tests/
│   ├── conftest.py
│   ├── test_api.py
│   ├── test_cv_extractor.py
│   └── test_cv_exporter.py
├── examples/
│   ├── README.md
│   └── sample_cv.json
├── uploads/                         # Temporary upload directory
├── outputs/                         # Generated CVs
├── cli.py                          # Command-line interface
├── main.py                         # API entry point
├── requirements.txt
├── .env.example
├── setup.sh
└── README.md
```

## 🔧 Core Components

### 1. CV Extractor (`cv_extractor.py`)

**Purpose**: Extract structured data from raw CV text using AI

**Key Features**:
- LangChain integration for LLM orchestration
- GPT-4 powered intelligent parsing
- Pydantic validation for data quality
- Fallback mechanisms for error handling
- Enhancement mode for AI-improved data

**Methods**:
- `extract_from_text(cv_text)`: Parse raw text
- `extract_from_file(file_path)`: Parse from file
- `enhance_cv_data(cv_data)`: Improve data quality

### 2. Template Filler (`template_filler.py`)

**Purpose**: Render CV data using Jinja2 templates

**Key Features**:
- Jinja2 template engine
- Custom filters for formatting
- Support for multiple templates
- HTML/CSS rendering

**Methods**:
- `render_html(cv_data, template_name)`: Render to HTML
- `get_available_templates()`: List templates
- `fill_docx_template()`: Fill DOCX templates

### 3. CV Exporter (`cv_exporter.py`)

**Purpose**: Export rendered CVs to PDF or DOCX

**Key Features**:
- WeasyPrint for HTML to PDF conversion
- python-docx for Word document generation
- Custom styling and formatting
- Multiple export formats

**Methods**:
- `export_to_pdf(cv_data, template_name)`: Generate PDF
- `export_to_docx(cv_data, template_name)`: Generate DOCX
- `export(cv_data, format)`: Unified export interface

### 4. CV Agent (`cv_agent.py`)

**Purpose**: Main orchestrator for the complete pipeline

**Key Features**:
- End-to-end pipeline management
- Component coordination
- Error handling and logging

**Methods**:
- `process_cv()`: Complete pipeline
- `extract_only()`: Extract data only
- `fill_template()`: Fill with existing data
- `preview_html()`: Generate preview

## 🔌 API Endpoints

### Authentication
Currently no authentication required. Add JWT/API keys for production.

### Endpoints

#### `GET /`
Root endpoint - service information

#### `GET /health`
Health check endpoint

#### `POST /api/v1/cv/extract`
Extract structured data from CV
- **Input**: `multipart/form-data` with CV file
- **Output**: JSON with `CVData` schema

#### `POST /api/v1/cv/fill`
Fill template with CV data
- **Input**: JSON with `CVData` and template preferences
- **Output**: PDF or DOCX file

#### `POST /api/v1/cv/process`
Complete pipeline: upload, extract, fill, export
- **Input**: `multipart/form-data` with CV file + preferences
- **Output**: Generated CV file + metadata

#### `GET /api/v1/cv/download/{filename}`
Download generated CV file

#### `GET /api/v1/templates`
List available templates

#### `POST /api/v1/cv/preview`
Generate HTML preview
- **Input**: JSON with `CVData`
- **Output**: HTML content

## 📊 Data Models

### CVData (Main Schema)

```python
CVData:
  - full_name: str (required)
  - job_title: Optional[str]
  - contact: ContactInfo
  - summary: Optional[str]
  - experience: List[Experience]
  - education: List[Education]
  - skills: List[str]
  - skill_categories: List[SkillCategory]
  - certifications: List[Certification]
  - projects: List[Project]
  - languages: List[Language]
  - awards: List[str]
  - publications: List[str]
  - volunteer: List[str]
  - interests: List[str]
```

### Supporting Models

- **ContactInfo**: Email, phone, location, social links
- **Experience**: Job details, dates, achievements
- **Education**: Degree, institution, dates, GPA
- **Certification**: Name, issuer, credentials
- **Project**: Name, description, technologies
- **Language**: Language name, proficiency level
- **SkillCategory**: Category name, skills list

## 🎨 Template System

### Template Structure

Each template is a directory containing:
- `template.html` - Jinja2 HTML template
- `style.css` - CSS stylesheet
- `template.docx` - (Optional) Word template

### Available Templates

1. **Modern**: Clean, minimalist design with blue accents
2. **Professional**: Traditional corporate style
3. **Creative**: Colorful, dynamic layout (TODO)

### Creating Custom Templates

1. Create new directory in `src/templates/`
2. Add `template.html` with Jinja2 syntax
3. Add `style.css` for styling
4. Use template variables from CVData schema

### Template Variables

Available in templates:
- `{{ name }}` - Full name
- `{{ title }}` - Job title
- `{{ contact }}` - Contact info object
- `{{ summary }}` - Professional summary
- `{{ experience }}` - List of experiences
- `{{ education }}` - List of education
- `{{ skills }}` - Skills list
- And more...

### Custom Filters

- `format_date` - Format date strings
- `format_phone` - Format phone numbers
- `nl2br` - Convert newlines to `<br>` tags

## 🖥️ CLI Usage

### Installation

```bash
./setup.sh
source venv/bin/activate
```

### Commands

```bash
# Show help
python cli.py --help

# Extract data
python cli.py extract -i cv.pdf -o data.json --enhance

# Fill template
python cli.py fill -d data.json -t modern -f pdf -o output.pdf

# Complete process
python cli.py process -i cv.pdf -t professional -f docx --enhance

# List templates
python cli.py templates

# Start API server
python cli.py serve --port 8000 --reload
```

## 🚀 Deployment

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Run API server
python main.py
```

### Production Deployment

#### Docker (Recommended)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for WeasyPrint
RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
```

#### Environment Variables

Production `.env`:
```
OPENAI_API_KEY=your-production-key
OPENAI_MODEL=gpt-4-turbo-preview
DEBUG=false
STORAGE_TYPE=s3  # Use S3 for production
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET_NAME=rolevate-cvs
```

## 🔒 Security Considerations

1. **API Key Management**: Store OpenAI keys securely
2. **File Validation**: Validate uploaded files
3. **Rate Limiting**: Implement rate limits for API
4. **Authentication**: Add JWT or API key auth for production
5. **CORS**: Configure CORS properly for your domain
6. **File Cleanup**: Automatically clean temporary files
7. **Input Sanitization**: Validate all inputs

## 📈 Performance Optimization

### Current Optimizations

1. **Async Processing**: All I/O operations are async
2. **Caching**: Template caching in Jinja2
3. **Connection Pooling**: Reuse OpenAI connections

### Recommended Improvements

1. **Redis Cache**: Cache extracted CV data
2. **Queue System**: Use Celery for background processing
3. **CDN**: Serve static templates from CDN
4. **Load Balancer**: Scale horizontally with multiple instances

## 🧪 Testing

```bash
# Run all tests
pytest tests/ -v

# Run specific test
pytest tests/test_api.py -v

# Run with coverage
pytest --cov=src tests/
```

## 🐛 Troubleshooting

### Common Issues

**Issue**: ImportError for PyPDF2 or python-docx
**Solution**: `pip install -r requirements.txt`

**Issue**: WeasyPrint installation fails
**Solution**: Install system dependencies:
```bash
# Ubuntu/Debian
sudo apt-get install libpango-1.0-0 libpangocairo-1.0-0

# macOS
brew install pango
```

**Issue**: OpenAI API errors
**Solution**: Check API key in `.env` and quota limits

**Issue**: Template not found
**Solution**: Ensure template directory has `template.html`

## 📝 Changelog

### Version 1.0.0 (2024-10-13)
- Initial release
- CV extraction with GPT-4
- PDF and DOCX export
- FastAPI REST API
- CLI interface
- Modern template
- Comprehensive documentation

## 🤝 Contributing

1. Follow PEP 8 style guide
2. Add type hints to all functions
3. Write tests for new features
4. Update documentation
5. Use meaningful commit messages

## 📄 License

Proprietary - Rolevate Platform

## 🆘 Support

For issues and questions:
- Create GitHub issue
- Contact dev team
- Check documentation

## 🔮 Future Enhancements

- [ ] Multiple language support (i18n)
- [ ] More CV templates (Creative, Minimalist, etc.)
- [ ] Batch processing capability
- [ ] Web-based template editor
- [ ] AI-powered resume optimization suggestions
- [ ] LinkedIn profile import
- [ ] ATS (Applicant Tracking System) optimization
- [ ] Custom branding options
- [ ] Real-time collaboration
- [ ] Version history for CVs
