# FastAPI CV Analysis System with LangGraph Agents

A comprehensive FastAPI application that processes PDF CVs, analyzes them using AI, and sends WhatsApp notifications to candidates.

## 🚀 Features

### 1. PDF CV Processing

- **PDF Upload**: Accept PDF CV files from frontend
- **Text Extraction**: Convert PDF to text using PyPDF2 and pdfplumber
- **File Validation**: Ensure only PDF files are accepted (max 10MB)
- **Storage**: Save uploaded files with unique naming

### 2. AI-Powered CV Analysis

- **LangGraph Agent**: Uses GPT-4 for intelligent CV analysis
- **Skills Extraction**: Automatically identify technical and soft skills
- **Experience Evaluation**: Calculate years of experience
- **Education Analysis**: Extract educational qualifications
- **Scoring System**: Generate comprehensive CV scores (0-100)
- **Smart Recommendations**: Provide personalized improvement suggestions

### 3. WhatsApp Integration

- **Template System**: Professional message templates
- **Link Generation**: Create WhatsApp web links for instant messaging
- **API Integration**: Ready for WhatsApp Business API
- **Multiple Templates**: CV received, interview invitation, follow-up

### 4. Database Integration

- **PostgreSQL**: Uses existing database structure
- **Real-time Updates**: Track analysis progress
- **Foreign Key Support**: Integrates with existing candidates and applications

## 📊 API Endpoints

### CV Processing

- `POST /api/cv/create` - Upload PDF CV and create analysis record
- `POST /api/cv/analyze/{analysis_id}` - Analyze CV using AI agent
- `GET /api/cv/{analysis_id}` - Get analysis results
- `GET /api/cv/list` - List all analyses

### WhatsApp Integration

- `POST /api/whatsapp/send/{analysis_id}` - Send WhatsApp message
- `GET /api/templates` - Get available message templates

### System

- `GET /` - Root endpoint with API overview
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation

## 🛠 Installation & Setup

### 1. Environment Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Variables

Copy `.env.template` to `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database"

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# WhatsApp Business API
WHATSAPP_API_URL=https://graph.facebook.com/v21.0
WHATSAPP_AUTH_CODE=your_whatsapp_auth_code
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id

# Application
DEBUG=True
HOST=0.0.0.0
PORT=8001
```

### 3. Start the Server

```bash
# Development
uvicorn main_updated:app --reload --host 0.0.0.0 --port 8001

# Or use the activation script
chmod +x activate.sh
./activate.sh
uvicorn main_updated:app --reload
```

## 📝 Usage Examples

### 1. Upload and Analyze CV

```bash
# Upload PDF CV
curl -X POST "http://localhost:8001/api/cv/create" \
  -F "candidateId=candidate-uuid" \
  -F "applicationId=application-uuid" \
  -F "cv_file=@path/to/cv.pdf"

# Analyze the CV
curl -X POST "http://localhost:8001/api/cv/analyze/{analysis_id}"

# Get results
curl -X GET "http://localhost:8001/api/cv/{analysis_id}"
```

### 2. Send WhatsApp Message

```bash
curl -X POST "http://localhost:8001/api/whatsapp/send/{analysis_id}" \
  -F "phone_number=+1234567890" \
  -F "template_name=cv_received"
```

## 🏗 Architecture

### LangGraph Agents

#### 1. CV Analysis Agent

- **Extract Basic Info**: Uses LLM to extract skills, education, roles
- **Analyze Skills**: Categorizes and evaluates technical skills
- **Evaluate Experience**: Calculates experience years
- **Calculate Score**: Generates weighted CV score
- **Generate Summary**: Creates personalized analysis summary

#### 2. WhatsApp Agent

- **Validate Input**: Checks phone number and template
- **Generate Message**: Creates personalized message from template
- **Create Link**: Generates WhatsApp web link
- **Send Message**: Integrates with WhatsApp Business API
- **Finalize Response**: Returns success/failure status

### Database Schema

The application uses the existing `cv_analyses` table with fields:

- `id`, `cvUrl`, `extractedText`
- `overallScore`, `skillsScore`, `experienceScore`, `educationScore`
- `summary`, `strengths`, `weaknesses`, `suggestedImprovements`
- `skills`, `experience`, `education`, `certifications`
- `applicationId`, `candidateId`

## 🔧 Components

### PDF Processor (`src/utils/pdf_processor.py`)

- File validation and size checking
- Text extraction using multiple libraries
- Error handling and fallback mechanisms

### CV Analysis Agent (`src/agents/cv_analysis_agent.py`)

- LangGraph workflow implementation
- OpenAI GPT-4 integration
- Structured data extraction

### WhatsApp Agent (`src/agents/whatsapp_agent.py`)

- Message template system
- Link generation for instant messaging
- WhatsApp Business API integration

### Service Layer (`src/services/cv_service.py`)

- Business logic coordination
- Database operations
- Agent orchestration

## 📱 WhatsApp Templates

### CV Received Template

```
Hello {candidate_name}! 👋

Thank you for applying for the {position} position at our company.

We have successfully received your CV and our team is currently reviewing it. Here's what happens next:

✅ CV Analysis Complete
📊 Your Profile Score: {score}/100

📋 Quick Summary:
{summary}

💡 Our Recommendations:
{recommendations}

We'll be in touch soon with the next steps in our hiring process.

Best regards,
HR Team
```

## 🔐 Security Features

- File type validation (PDF only)
- File size limits (10MB max)
- SQL injection protection via SQLAlchemy ORM
- Input validation using Pydantic models
- Environment variable configuration

## 🚀 Production Deployment

### Docker Deployment

```dockerfile
FROM python:3.13-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8001

CMD ["uvicorn", "main_updated:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Environment Configuration

- Use production database URL
- Set proper CORS origins
- Configure real WhatsApp API credentials
- Enable production logging

## 🧪 Testing

### Manual Testing

1. **PDF Upload**: Test with various PDF formats
2. **CV Analysis**: Verify AI analysis quality
3. **WhatsApp Integration**: Test message generation
4. **Database**: Verify data persistence

### API Testing

Use the interactive documentation at `http://localhost:8001/docs` for comprehensive API testing.

## 📊 Monitoring

### Available Endpoints

- Health check: `GET /health`
- Metrics: Monitor via application logs
- Database: PostgreSQL query monitoring

## 🔄 Workflow

1. **Frontend uploads PDF CV** → `POST /api/cv/create`
2. **System extracts text** → PDF processing utility
3. **Creates database record** → CV analysis model
4. **Triggers AI analysis** → `POST /api/cv/analyze/{id}`
5. **Updates analysis results** → Database update
6. **Sends WhatsApp notification** → `POST /api/whatsapp/send/{id}`
7. **Generates message link** → WhatsApp web link

## 🤝 Integration

### Frontend Integration

```javascript
// Upload CV
const formData = new FormData();
formData.append("candidateId", candidateId);
formData.append("applicationId", applicationId);
formData.append("cv_file", pdfFile);

const response = await fetch("/api/cv/create", {
  method: "POST",
  body: formData,
});

const analysis = await response.json();

// Trigger analysis
await fetch(`/api/cv/analyze/${analysis.id}`, {
  method: "POST",
});

// Send WhatsApp
await fetch(`/api/whatsapp/send/${analysis.id}`, {
  method: "POST",
  body: new FormData([
    ["phone_number", candidate.phone],
    ["template_name", "cv_received"],
  ]),
});
```

## 📈 Performance

- **PDF Processing**: Handles files up to 10MB
- **AI Analysis**: GPT-4 processing in ~5 seconds
- **Concurrent Processing**: Async/await pattern
- **Database**: Optimized queries with SQLAlchemy

## 🛡 Error Handling

- Comprehensive exception catching
- Graceful fallbacks for AI processing
- Detailed error messages in API responses
- Logging for debugging and monitoring

---

## 🎯 Next Steps

1. **Enhanced AI Analysis**: Add more sophisticated scoring algorithms
2. **Real WhatsApp API**: Implement actual message sending
3. **Email Integration**: Add email notifications
4. **Analytics Dashboard**: Track analysis metrics
5. **Batch Processing**: Handle multiple CVs simultaneously
6. **Template Customization**: Allow dynamic template editing

---

## 📞 Support

For technical support or questions:

- Review the API documentation at `/docs`
- Check the health endpoint at `/health`
- Monitor application logs for debugging

---

**Built with FastAPI, LangGraph, OpenAI GPT-4, and PostgreSQL** 🚀
