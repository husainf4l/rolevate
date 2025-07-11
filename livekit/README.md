# HR Interview Agent API

A professional FastAPI-based HR interview agent powered by LiveKit for conducting structured interviews.

## 🏗️ Project Structure

```
livekit/
├── agent.py                    # Main FastAPI application
├── requirements.txt            # Dependencies
├── README.md                  # Documentation
├── config/                    # Configuration management
│   ├── __init__.py
│   └── settings.py           # Application settings and env vars
├── models/                    # Pydantic models
│   ├── __init__.py
│   └── interview.py          # Interview-related models
├── routes/                    # API route handlers
│   ├── __init__.py
│   └── interview_routes.py   # Interview endpoints
└── services/                  # Business logic
    ├── __init__.py
    ├── interview_service.py   # Interview management service
    └── livekit_agent.py      # LiveKit agent implementation
```

## ✨ Features

- **Modular Architecture**: Clean separation of concerns with routes, services, models, and config
- **Professional Interview Structure**: Structured interviews with welcome, background, technical, behavioral, and closing sections
- **Multilingual Support**: Supports both Arabic and English with automatic language detection
- **Real-time Audio**: LiveKit integration for real-time audio processing
- **RESTful API**: FastAPI endpoints for managing interview sessions
- **Environment Validation**: Automatic validation of required environment variables
- **Session Management**: Track and manage multiple concurrent interview sessions
- **Dependency Injection**: Clean dependency management with FastAPI's DI system

## 🚀 Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
# Create .env file with the following variables:
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

## 🏃 Running the Application

Start the FastAPI server:
```bash
python agent.py
```

Or use uvicorn directly:
```bash
uvicorn agent:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

## 📚 API Endpoints

### Health Check
- `GET /` - Basic health check endpoint
- `GET /health` - Detailed health check with environment validation

### Interview Management
- `POST /interview/start` - Start a new interview session
- `GET /interview/{room_name}/status` - Get interview session status
- `DELETE /interview/{room_name}` - End an interview session
- `GET /interviews` - List all active interview sessions

### 📝 Example Usage

Start an interview:
```bash
curl -X POST "http://localhost:8000/interview/start" \
  -H "Content-Type: application/json" \
  -d '{
    "room_name": "interview-room-1",
    "participant_name": "John Doe",
    "position": ".NET Developer",
    "company": "UPT",
    "language": "ar"
  }'
```

Check interview status:
```bash
curl "http://localhost:8000/interview/interview-room-1/status"
```

List all active interviews:
```bash
curl "http://localhost:8000/interviews"
```

## 🔧 Configuration

The application uses Pydantic Settings for configuration management. All settings can be configured via environment variables:

### Required Environment Variables
- `LIVEKIT_URL`: Your LiveKit server URL
- `LIVEKIT_API_KEY`: Your LiveKit API key
- `LIVEKIT_API_SECRET`: Your LiveKit API secret

### Optional Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key
- `APP_HOST`: Application host (default: "0.0.0.0")
- `APP_PORT`: Application port (default: 8000)
- `LOG_LEVEL`: Logging level (default: "info")

### Interview Configuration
The `InterviewConfig` model supports:
- `room_name`: LiveKit room name for the interview
- `participant_name`: Name of the candidate
- `position`: Position being interviewed for (default: ".NET Developer")
- `company`: Company name (default: "UPT")
- `language`: Primary language for the interview (default: "ar")
- `model`: OpenAI model to use (default: "gpt-4o-mini")

## 🏗️ Architecture

### Services Layer
- **InterviewService**: Manages interview sessions, LiveKit integration, and business logic
- **ProfessionalHRAssistant**: LiveKit agent implementation with structured interview flow

### Routes Layer
- **InterviewRoutes**: FastAPI router handling all interview-related endpoints with dependency injection

### Models Layer
- **InterviewConfig**: Configuration model for interview sessions
- **InterviewStatus**: Response model for interview status
- **ActiveInterviewsResponse**: Response model for listing active interviews

### Config Layer
- **Settings**: Centralized configuration management with environment variable validation

## 📖 Interactive API Documentation

Visit `http://localhost:8000/docs` for the automatic interactive API documentation (Swagger UI).

## 🛠️ Development

The application includes:
- **Type Safety**: Full type hints with Pydantic models
- **Dependency Injection**: Clean service dependencies with FastAPI DI
- **Error Handling**: Comprehensive error handling and logging
- **CORS Support**: CORS middleware for web integration
- **Background Tasks**: Async background task processing
- **Session State Management**: In-memory session tracking
- **Environment Validation**: Startup validation of required configuration

### Project Guidelines
- Keep business logic in services
- Use Pydantic models for all data validation
- Follow FastAPI best practices for routing
- Maintain separation of concerns across modules
- Use dependency injection for service access

## 📄 License

This project is for professional HR interview purposes.