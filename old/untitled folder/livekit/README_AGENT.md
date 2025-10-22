# HR Interview Agent - LiveKit 2025

A professional HR interview agent built with LiveKit Agents SDK 2025, designed to conduct dynamic interviews for various job positions with multilingual support (Arabic/English).

## Features

- 🎯 **Dynamic Job Adaptation**: Automatically adapts interview questions based on job type
- 🌍 **Multilingual Support**: Supports both Arabic and English with auto-detection
- 🤖 **AI-Powered Conversations**: Uses OpenAI GPT-4o-mini for intelligent responses
- 🎙️ **Voice Interface**: Real-time speech-to-text and text-to-speech
- 📊 **Automatic Room Joining**: Connects to all rooms in your LiveKit project
- 👥 **Personalized Experience**: Uses candidate names and job details for personalized interviews

## Supported Job Types

The agent automatically adjusts its interview approach based on the job title:

### 🎨 **Graphic Designer / Creative Roles**

- Portfolio review and creative process
- Design software proficiency (Adobe Creative Suite, Figma)
- Design principles and typography
- Healthcare industry design considerations
- Accessibility and user experience

### 💻 **Software Developer / Technical Roles**

- Programming languages and frameworks
- Software development best practices
- Problem-solving and algorithmic thinking
- Code quality and testing approaches
- System design and architecture

### 🏥 **Healthcare Roles**

- Healthcare industry knowledge
- Patient care considerations
- Medical terminology and procedures
- Compliance and regulatory understanding
- Patient privacy and confidentiality

### 📊 **General Roles**

- Role-specific technical skills
- Industry knowledge and best practices
- Problem-solving abilities
- Team collaboration and communication
- Professional development

## Installation

1. **Install Dependencies**

```bash
pip install -r requirements.txt
```

2. **Configure Environment Variables**
   Create a `.env` file with your credentials:

```env
# LiveKit Configuration
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Optional: ElevenLabs (if you want premium voice)
ELEVENLABS_API_KEY=your_elevenlabs_key
```

## Usage

### Development Mode

Start the agent in development mode (auto-reloads on file changes):

```bash
python agent.py dev
```

### Production Mode

Start the agent in production mode:

```bash
python agent.py start
```

### Connect to Specific Room

Connect to a specific interview room:

```bash
python agent.py connect --room "interview_cmd9f0t2r00113snsg7yacfhb_1752879208091"
```

### Console Mode (Testing)

Test the agent in console mode:

```bash
python agent.py console
```

## Room Integration

The agent automatically extracts job and candidate information from:

### Room Name Format

```
interview_applicationId_timestamp
```

Example: `interview_cmd9f0t2r00113snsg7yacfhb_1752879208091`

### Room Metadata (JSON)

```json
{
  "candidate": {
    "firstName": "AL-HUSSEIN",
    "lastName": "QASEM-ABDULLAH",
    "email": "publishing@roxate.com"
  },
  "job": {
    "title": "Healthcare Graphic Designer",
    "company": "papaya trading"
  },
  "application": {
    "id": "cmd9f0t2r00113snsg7yacfhb",
    "status": "SUBMITTED"
  }
}
```

### Participant Metadata

The agent can also extract information from participant metadata when they join the room.

## Interview Structure

Each interview follows a professional structure:

1. **Welcome & Introduction** (2-3 minutes)

   - Personalized greeting using candidate's name
   - Brief explanation of the interview process
   - Confirmation of readiness to begin

2. **Background & Experience** (10-15 minutes)

   - Educational background
   - Previous work experience
   - Career progression and goals

3. **Technical/Job-Specific Questions** (15-20 minutes)

   - Role-specific technical questions
   - Portfolio review (for creative roles)
   - Problem-solving scenarios
   - Industry-specific knowledge

4. **Behavioral & Situational Questions** (10-15 minutes)

   - Team collaboration examples
   - Conflict resolution
   - Leadership experiences
   - Cultural fit assessment

5. **Candidate Questions & Closing** (5-10 minutes)
   - Opportunity for candidate questions
   - Next steps explanation
   - Professional closing

## API Configuration

### Worker Options

The agent is configured with:

- **Agent Name**: `hr-interview-agent`
- **Auto Room Joining**: Automatically joins all rooms in your project
- **Language Detection**: Auto-detects Arabic and English
- **Voice**: Professional "alloy" voice from OpenAI

### Voice Configuration

- **STT**: OpenAI Whisper-1 with language auto-detection
- **LLM**: GPT-4o-mini with temperature 0.7 for natural conversation
- **TTS**: OpenAI TTS with "alloy" voice
- **VAD**: Silero Voice Activity Detection

## Monitoring & Logs

The agent provides comprehensive logging:

- Room connection status
- Participant join events
- Extracted job and candidate information
- Interview session progress
- Error handling and debugging

## Best Practices

1. **Room Metadata**: Include comprehensive job and candidate information in room metadata for best results
2. **Network Stability**: Ensure stable internet connection for real-time voice processing
3. **Audio Quality**: Use quality microphones for best speech recognition
4. **Testing**: Use console mode for testing before production deployment

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure you're using the latest LiveKit Agents SDK (1.2.1+)
2. **Authentication**: Verify your LiveKit credentials are correct
3. **Audio Issues**: Check microphone permissions and audio devices
4. **Voice Recognition**: Ensure clear audio input for accurate transcription

### Debug Mode

Add debug logging by setting:

```python
logging.basicConfig(level=logging.DEBUG)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:

- Check the LiveKit Agents documentation
- Review the logs for error details
- Test in console mode for debugging
