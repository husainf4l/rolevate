# 🚀 Rolevate Agent - LLM-Powered CV Builder# Rolevate CV Agent



> **AI-Driven Professional CV Generation Platform**  AI-powered CV builder with chat interface and professional templates.

> Built with OpenAI GPT-4, LangChain, and LangGraph

## 🚀 Quick Start

[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)

[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-green.svg)](https://openai.com/)1. **Install dependencies:**

[![LangChain](https://img.shields.io/badge/LangChain-Enabled-orange.svg)](https://langchain.com/)   ```bash

[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-teal.svg)](https://fastapi.tiangolo.com/)   python3 -m venv venv

   source venv/bin/activate

---   pip install -r requirements.txt

   ```

## 🌟 Overview

2. **Configure environment:**

**Rolevate Agent** is an advanced CV building platform that leverages **100% LLM-powered processing** to intelligently extract, enhance, and format professional resumes. Unlike traditional regex-based parsers, our system uses OpenAI's GPT-4 to understand context, generate professional content, and create ATS-optimized CVs tailored for banking, finance, and corporate sectors.   ```bash

   cp .env.example .env

### Key Highlights   # Edit .env and add your OpenAI API key

   ```

✅ **LLM-First Architecture** - All extraction and processing powered by OpenAI GPT-4  

✅ **Intelligent Extraction** - Context-aware data parsing from professional descriptions  3. **Run the server:**

✅ **Professional Writing** - AI-generated summaries, achievements, and descriptions     ```bash

✅ **Smart Follow-ups** - Contextual questions to complete missing information     PORT=8003 DEBUG=true venv/bin/python -m app.main

✅ **Industry Specialization** - Optimized for banking, finance, and corporate sectors     ```

✅ **ATS-Friendly** - Generated CVs pass Applicant Tracking Systems  

4. **Access the application:**

---   - Homepage: http://localhost:8003/

   - CV Builder: http://localhost:8003/chat

## 🏗️ Architecture   - API Docs: http://localhost:8003/docs

   - Health Check: http://localhost:8003/health

### **LLM-Powered Workflow**

## 📁 Project Structure

```

User Input → GPT-4 Understanding → Extraction → Enhancement → Optimization → PDF Export```

```rolevate-agent/

├── app/

All 17 workflow nodes use OpenAI GPT-4 for intelligent processing.│   ├── main.py                 # FastAPI application entry point

│   ├── config.py              # Configuration settings

---│   ├── models/

│   │   └── schemas.py         # Pydantic data models

## 📁 Project Structure│   ├── services/

│   │   ├── cv_agent.py        # Main CV processing orchestrator

```│   │   ├── cv_extractor.py    # LLM-based CV extraction

rolevate-agent/│   │   ├── cv_exporter.py     # PDF/DOCX export

├── app/agent/nodes/          # 17 LLM-powered workflow nodes│   │   └── template_filler.py # Template rendering

├── app/agent/tools/          # AI tools (GPT-4 primary + utilities)│   ├── agent/

├── app/api/                  # FastAPI routes│   │   ├── agent.py           # LangGraph workflow orchestration

├── app/services/             # Business logic│   │   ├── nodes/             # Processing nodes (extract, enhance, export)

├── tests/                    # Test suite│   │   └── tools/             # Agent tools (validation, etc.)

├── scripts/                  # Utility scripts│   ├── utils/

├── archive/                  # Archived components│   │   └── file_parser.py     # File parsing utilities

├── docs/                     # Documentation│   └── templates/

└── README.md                 # This file│       ├── components/        # Reusable UI components

```│       │   ├── base.html     # Base layout template

│       │   ├── navbar.html   # Navigation bar

---│       │   └── footer.html   # Footer

│       ├── pages/            # Application pages

## 🛠️ Quick Start│       │   ├── home.html     # Homepage (landing page)

│       │   └── chat.html     # CV Builder interface

### 1. Install Dependencies│       └── cv_templates/     # CV document templates

│           ├── classic_cv.html

```bash│           ├── modern_cv.html

python -m venv venv│           └── executive_cv.html

source venv/bin/activate├── requirements.txt           # Python dependencies

pip install -r requirements.txt├── .env                       # Environment variables (not in git)

```└── .env.example              # Example environment config



### 2. Configure Environment```



```bash## 🔧 API Endpoints

cp .env.example .env

# Edit .env with your OPENAI_API_KEY### Pages

```- `GET /` - Homepage (marketing landing page)

- `GET /chat` - Chat-based CV builder interface

### 3. Run Application- `GET /health` - Health check endpoint



```bash### CV Processing

uvicorn app.main:app --reload --port 8001- `POST /api/v1/cv/extract` - Extract structured data from uploaded CV

```- `POST /api/v1/cv/fill` - Fill template with CV data and generate PDF/DOCX

- `GET /api/v1/cv/download/{filename}` - Download generated CV file

Visit: `http://localhost:8001`

### Templates

---- `GET /api/v1/templates` - List available CV templates



## 🧪 Testing## 🎨 Templates



```bashThree professional CV templates are available:

python tests/test_llm_assistant.py

```1. **Classic** - Traditional layout with clean design

2. **Modern** - Contemporary styling with visual appeal

---3. **Executive** - Professional layout for senior positions



## 📚 DocumentationAll templates are:

- ATS-friendly (Applicant Tracking System compatible)

See `/docs/` directory for comprehensive guides:- Mobile-responsive

- `LLM_INTEGRATION_COMPLETE.md` - LLM architecture details- Exportable as PDF or DOCX

- `CLEANUP_INVENTORY.md` - Project reorganization report

- `TECHNOLOGY_STACK_IMPLEMENTATION.md` - Tech stack guide## 🤖 Features



---- **AI Chat Interface** - Conversational CV building experience

- **Smart Extraction** - Upload existing CV and extract data automatically

## 🔄 Recent Updates (October 15, 2025)- **Real-time Preview** - See changes as you build your CV

- **Multiple Formats** - Export as PDF or DOCX

- ✅ Migrated to 100% LLM-powered architecture- **Professional Templates** - Choose from 3 carefully designed templates

- ✅ Integrated OpenAI GPT-4 for all processing- **No Signup Required** - Start building immediately

- ✅ Reorganized project structure- **RESTful API** - Integrate into your own applications

- ✅ Archived obsolete regex-based components

- ✅ Updated all documentation## 🛠️ Technology Stack



---- **Backend:** FastAPI, Python 3.12

- **AI/LLM:** OpenAI GPT-4, LangChain, LangGraph

**Built with ❤️ by the Rolevate Team**- **Export:** WeasyPrint (PDF), python-docx (DOCX)

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
