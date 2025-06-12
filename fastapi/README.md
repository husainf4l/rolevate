# CV Analysis API with LangGraph Agents

A FastAPI application with 2 LangGraph agents for CV analysis and WhatsApp messaging.

## Features

### 🤖 Agent 1: CV Analysis Agent

- Extracts skills, experience, education from CVs
- Calculates CV scores
- Generates analysis summaries and recommendations
- Built with LangGraph for complex workflow management

### 📱 Agent 2: WhatsApp Agent

- Generates personalized WhatsApp messages from templates
- Creates WhatsApp links for easy messaging
- Supports multiple message templates
- Handles template variable substitution

## Project Structure

```
fastapi/
├── main.py                              # FastAPI application
├── requirements.txt                     # Python dependencies
├── .env                                 # Environment variables
├── .env.example                        # Environment template
└── src/
    ├── schemas.py                      # Pydantic models
    ├── models.py                       # SQLAlchemy models
    ├── database.py                     # Database configuration
    ├── agents/
    │   ├── cv_analysis_agent.py        # LangGraph CV Analysis Agent
    │   └── whatsapp_agent.py           # LangGraph WhatsApp Agent
    └── services/
        └── cv_service.py               # Business logic service
```

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env file with your actual values:
# - Add your OpenAI API key
# - Configure database URL if using PostgreSQL
```

### 3. Run the Application

```bash
python main.py
```

The server will start at `http://localhost:8000`

## API Endpoints

### 📊 Main Workflow

1. **Upload CV**: `POST /api/cv/upload`

   - Upload candidate CV and basic information
   - Creates analysis record with PENDING status

2. **Analyze CV**: `POST /api/cv/analyze/{analysis_id}`

   - Triggers CV Analysis Agent (LangGraph)
   - Extracts skills, experience, education
   - Calculates score and generates recommendations

3. **Send WhatsApp**: `POST /api/whatsapp/send/{analysis_id}`
   - Triggers WhatsApp Agent (LangGraph)
   - Generates personalized message
   - Creates WhatsApp link for candidate

### 📖 Additional Endpoints

- `GET /` - API overview and endpoints
- `GET /health` - Health check
- `GET /api/cv/{analysis_id}` - Get analysis details
- `GET /api/cv/list` - List all analyses
- `GET /api/templates` - Available WhatsApp templates
- `GET /docs` - Interactive API documentation

## Usage Examples

### 1. Upload CV

```bash
curl -X POST "http://localhost:8000/api/cv/upload" \
  -F "candidate_name=John Doe" \
  -F "candidate_email=john@example.com" \
  -F "candidate_phone=+966501234567" \
  -F "position=Software Developer" \
  -F "cv_file=@resume.pdf"
```

### 2. Analyze CV

```bash
curl -X POST "http://localhost:8000/api/cv/analyze/1"
```

### 3. Send WhatsApp Message

```bash
curl -X POST "http://localhost:8000/api/whatsapp/send/1?template_name=cv_received"
```

## WhatsApp Templates

### Available Templates:

- `cv_received` - Confirmation message when CV is received
- `interview_invitation` - Invitation for interview
- `follow_up` - Follow-up messages

### Template Variables:

- `{candidate_name}` - Candidate's name
- `{position}` - Applied position
- `{score}` - CV analysis score
- `{summary}` - Analysis summary
- `{recommendations}` - Analysis recommendations

## LangGraph Agents

### CV Analysis Agent Workflow:

1. `extract_basic_info` - Parse CV content
2. `analyze_skills` - Extract and categorize skills
3. `evaluate_experience` - Calculate years of experience
4. `calculate_score` - Generate overall CV score
5. `generate_summary` - Create analysis summary

### WhatsApp Agent Workflow:

1. `validate_input` - Validate phone number and template
2. `generate_message` - Format message from template
3. `create_whatsapp_link` - Generate WhatsApp URL
4. `finalize_response` - Prepare final response

## Database Schema

### CVAnalysis Table:

- `id` - Primary key
- `candidate_name` - Candidate name
- `candidate_email` - Candidate email
- `candidate_phone` - Phone number
- `position` - Applied position
- `status` - Analysis status (pending, analyzing, completed, failed)
- `analysis_result` - JSON with CV analysis results
- `whatsapp_link` - Generated WhatsApp link
- `cv_agent_result` - Raw CV agent output
- `whatsapp_agent_result` - Raw WhatsApp agent output
- `created_at` / `updated_at` - Timestamps

## Development Notes

### Current Status: ✅ EMPTY IMPLEMENTATION READY

- All components are created with empty/mock implementations
- Ready for step-by-step development
- Agents return placeholder data for testing

### Next Steps:

1. **Implement CV Parsing**: Add actual PDF/Word CV parsing
2. **Connect OpenAI**: Add real LLM integration for analysis
3. **Enhance Scoring**: Implement sophisticated scoring algorithms
4. **Add File Storage**: Implement proper file storage (AWS S3, etc.)
5. **Production Database**: Configure PostgreSQL for production
6. **Authentication**: Add user authentication and authorization
7. **Error Handling**: Enhance error handling and logging
8. **Testing**: Add comprehensive test suite

### Environment Variables:

- `DATABASE_URL` - Database connection string
- `OPENAI_API_KEY` - OpenAI API key for LLM
- `DEBUG` - Debug mode flag
- `HOST` / `PORT` - Server configuration

## Testing

Visit `http://localhost:8000/docs` for interactive API documentation and testing.

The application is ready for development - all endpoints work with mock data!
