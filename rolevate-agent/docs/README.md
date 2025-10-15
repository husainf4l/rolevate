# Rolevate CV Agent

AI-powered CV builder with chat interface and professional templates.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Run the server:**
   ```bash
   PORT=8003 DEBUG=true venv/bin/python -m app.main
   ```

4. **Access the application:**
   - Homepage: http://localhost:8003/
   - CV Builder: http://localhost:8003/chat
   - API Docs: http://localhost:8003/docs
   - Health Check: http://localhost:8003/health

## 📁 Project Structure

```
rolevate-agent/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py              # Configuration settings
│   ├── models/
│   │   └── schemas.py         # Pydantic data models
│   ├── services/
│   │   ├── cv_agent.py        # Main CV processing orchestrator
│   │   ├── cv_extractor.py    # LLM-based CV extraction
│   │   ├── cv_exporter.py     # PDF/DOCX export
│   │   └── template_filler.py # Template rendering
│   ├── agent/
│   │   ├── agent.py           # LangGraph workflow orchestration
│   │   ├── nodes/             # Processing nodes (extract, enhance, export)
│   │   └── tools/             # Agent tools (validation, etc.)
│   ├── utils/
│   │   └── file_parser.py     # File parsing utilities
│   └── templates/
│       ├── components/        # Reusable UI components
│       │   ├── base.html     # Base layout template
│       │   ├── navbar.html   # Navigation bar
│       │   └── footer.html   # Footer
│       ├── pages/            # Application pages
│       │   ├── home.html     # Homepage (landing page)
│       │   └── chat.html     # CV Builder interface
│       └── cv_templates/     # CV document templates
│           ├── classic_cv.html
│           ├── modern_cv.html
│           └── executive_cv.html
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables (not in git)
└── .env.example              # Example environment config

```

## 🔧 API Endpoints

### Pages
- `GET /` - Homepage (marketing landing page)
- `GET /chat` - Chat-based CV builder interface
- `GET /health` - Health check endpoint

### CV Processing
- `POST /api/v1/cv/extract` - Extract structured data from uploaded CV
- `POST /api/v1/cv/fill` - Fill template with CV data and generate PDF/DOCX
- `GET /api/v1/cv/download/{filename}` - Download generated CV file

### Templates
- `GET /api/v1/templates` - List available CV templates

## 🎨 Templates

Three professional CV templates are available:

1. **Classic** - Traditional layout with clean design
2. **Modern** - Contemporary styling with visual appeal
3. **Executive** - Professional layout for senior positions

All templates are:
- ATS-friendly (Applicant Tracking System compatible)
- Mobile-responsive
- Exportable as PDF or DOCX

## 🤖 Features

- **AI Chat Interface** - Conversational CV building experience
- **Smart Extraction** - Upload existing CV and extract data automatically
- **Real-time Preview** - See changes as you build your CV
- **Multiple Formats** - Export as PDF or DOCX
- **Professional Templates** - Choose from 3 carefully designed templates
- **No Signup Required** - Start building immediately
- **RESTful API** - Integrate into your own applications

## 🛠️ Technology Stack

- **Backend:** FastAPI, Python 3.12
- **AI/LLM:** OpenAI GPT-4, LangChain, LangGraph
- **Export:** WeasyPrint (PDF), python-docx (DOCX)
- **Frontend:** Tailwind CSS, Vanilla JavaScript
- **Templating:** Jinja2

## 📝 Environment Variables

Required environment variables in `.env`:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4

# Server Configuration
HOST=0.0.0.0
PORT=8003
DEBUG=true

# Storage
UPLOAD_DIR=uploads
OUTPUT_DIR=outputs
```

## 🔒 Security Notes

- Never commit `.env` file to version control
- Keep your OpenAI API key secure
- Configure CORS appropriately for production
- Validate all file uploads
- Implement rate limiting for production use

## 📦 Dependencies

Key dependencies:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `openai` - OpenAI API client
- `langchain` - LLM framework
- `langgraph` - Workflow orchestration
- `weasyprint` - PDF generation
- `python-docx` - DOCX generation
- `pydantic` - Data validation
- `loguru` - Logging

See `requirements.txt` for complete list.

## 🤝 Development

The project follows standard Python best practices:

- **Package structure:** All code in `app/` package
- **Type hints:** Full type annotations
- **Error handling:** Comprehensive exception handling
- **Logging:** Structured logging with loguru
- **Configuration:** Environment-based settings
- **API documentation:** Auto-generated OpenAPI docs

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

Built with ❤️ by the Rolevate team
