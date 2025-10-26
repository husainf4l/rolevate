# Rolevate Interview Agent

A professional AI-powered interview agent built with LiveKit, featuring real-time voice interaction in English and Arabic.

## 🏗️ Project Structure

```
rolevate-interview/
├── agent.py              # Main entry point and orchestration
├── api_client.py         # GraphQL API client for Rolevate backend
├── config.py             # Configuration and environment variables
├── models.py             # Data models and structures
├── rolevate_agent.py     # Agent implementation and behavior
├── utils.py              # Utility functions (parsing, logging, etc.)
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (not in git)
└── README.md            # This file
```

## 📁 Module Descriptions

### `agent.py`
- **Purpose**: Main entry point for the application
- **Responsibilities**:
  - Initialize the LiveKit agent
  - Orchestrate session setup and teardown
  - Connect STT, LLM, and TTS components
  - Manage agent lifecycle

### `config.py`
- **Purpose**: Centralized configuration management
- **Contains**:
  - API endpoints and keys
  - Model configurations (OpenAI, ElevenLabs, Soniox)
  - Agent settings (languages, timeouts)
  - Environment variable loading

### `models.py`
- **Purpose**: Data structures and type definitions
- **Contains**:
  - `InterviewContext`: Stores candidate, job, and company information
  - Helper methods for data validation

### `api_client.py`
- **Purpose**: Communication with Rolevate backend
- **Responsibilities**:
  - GraphQL query construction
  - API authentication and error handling
  - Response parsing and validation

### `rolevate_agent.py`
- **Purpose**: Core agent behavior and logic
- **Responsibilities**:
  - Generate personalized instructions
  - Build context-aware greetings
  - Handle agent events (on_enter, etc.)

### `utils.py`
- **Purpose**: Shared utility functions
- **Contains**:
  - Room name parsing (extract application ID)
  - Logging configuration
  - Common helper functions

## 🚀 Setup

### 1. Install Dependencies

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file with the following variables:

```bash
# LiveKit Configuration
LIVEKIT_URL=wss://your-livekit-instance.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# ElevenLabs TTS Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=EkK5I93UQWFDigLMpZcX

# Soniox STT Configuration
SONIOX_API_KEY=your_soniox_api_key

# Rolevate API Configuration
ROLEVATE_API_URL=https://rolevate.com/api/graphql
ROLEVATE_API_KEY=your_rolevate_api_key
```

### 3. Run the Agent

#### Development Mode (with auto-reload)
```bash
python agent.py dev
```

#### Production Mode
```bash
python agent.py start
```

## 🎯 How It Works

### Room Name Format
The agent expects room names in the format: `interview-{uuid}-{optional-suffix}`

Example: `interview-354046a3-44a5-48ee-9d84-6bd7c7b3455c-5`

### Flow

1. **Agent Starts**: Listens for new interview sessions
2. **Room Joined**: Parses application ID from room name
3. **Fetch Context**: Queries Rolevate API for candidate/job information
4. **Session Setup**: Configures STT (Soniox), LLM (OpenAI), TTS (ElevenLabs)
5. **Personalized Greeting**: Welcomes candidate with their name and job details
6. **Interview**: Conducts conversation in English or Arabic
7. **Session End**: Cleans up resources

## 🌐 Supported Languages

- **English** (`en`)
- **Arabic** (`ar`)

The agent automatically detects the candidate's language preference.

## 🔧 Customization

### Adding New Languages
Update `config.py`:
```python
SUPPORTED_LANGUAGES = ["en", "ar", "fr", "es"]  # Add more languages
```

### Changing AI Models
Update `config.py`:
```python
OPENAI_MODEL = "gpt-4"  # Use a different OpenAI model
ELEVENLABS_VOICE_ID = "your_voice_id"  # Change voice
```

### Modifying Agent Behavior
Edit `rolevate_agent.py` to customize:
- Interview instructions
- Greeting messages
- Agent personality

## 📝 Best Practices

### Code Organization
- ✅ **Separation of Concerns**: Each module has a single, well-defined purpose
- ✅ **Type Hints**: All functions use type hints for clarity
- ✅ **Docstrings**: Comprehensive documentation for all classes and functions
- ✅ **Error Handling**: Graceful fallbacks and detailed logging
- ✅ **Configuration**: Environment-based configuration (no hardcoded values)

### Development
- Use `agent.py dev` for development with auto-reload
- Check logs for debugging information
- Test with different room name formats
- Verify API responses with curl or GraphQL client

## 🐛 Troubleshooting

### Agent Not Starting
- Check `.env` file exists and contains all required variables
- Verify API keys are valid
- Check LiveKit server is accessible

### API Errors
- Confirm `ROLEVATE_API_KEY` is correct
- Check network connectivity to `https://rolevate.com`
- Review logs for detailed error messages

### No Audio
- Verify `SONIOX_API_KEY` and `ELEVENLABS_API_KEY` are valid
- Check microphone permissions in browser
- Ensure proper audio device configuration

## 📊 Logging

The agent uses Python's built-in logging with the logger name `rolevate-agent`.

Log levels:
- `INFO`: General information (session start, API calls)
- `WARNING`: Non-critical issues (missing context)
- `ERROR`: Critical errors (API failures, parsing errors)

## 🤝 Contributing

When adding new features:
1. Create appropriate module if needed
2. Update `config.py` for new settings
3. Add type hints and docstrings
4. Update this README
5. Test thoroughly in dev mode

## 📄 License

[Your License Here]
