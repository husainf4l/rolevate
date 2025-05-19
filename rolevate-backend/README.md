# LiveKit AI Interview System Backend

This NestJS backend serves as the "brain" behind the AI Interview System, handling LiveKit integration and AI interviewer logic.

## Core Components

### 1. LiveKit Integration

- Token generation for secure access
- Room management for interview sessions
- Real-time connection handling

### 2. AI Interviewer Logic

- Interview state management
- Intelligent question generation
- Response analysis
- Natural conversation flow

## API Endpoints

### LiveKit Endpoints

- `POST /livekit/token` - Generate a token for room access
- `POST /livekit/room` - Create a new LiveKit room
- `GET /livekit/room/:name` - Get information about a room
- `DELETE /livekit/room/:name` - Delete a room
- `GET /livekit/rooms` - List all active rooms

### Interview Endpoints

- `POST /interview/create` - Create a new interview session
- `POST /interview/:id/start` - Start an interview
- `POST /interview/:id/response` - Process a candidate response
- `GET /interview/:id` - Get interview details
- `GET /interview/:id/transcript` - Get the interview transcript
- `GET /interview/:id/summary` - Generate an interview summary

### Audio Processing

- `POST /audio/synthesize` - Convert text to speech for AI responses
- `GET /audio/file/:filename` - Retrieve synthesized audio files
- `POST /audio/cleanup` - Clean up old audio files

### Speech Recognition

- `POST /transcription/audio` - Transcribe candidate audio to text

## WebSocket Events

The backend uses Socket.IO for real-time communication:

### Client Events (Frontend to Backend)

- `joinInterview` - Join an interview session
- `leaveInterview` - Leave an interview session
- `candidateResponse` - Send a candidate's response
- `startInterview` - Start an interview session
- `endInterview` - End an interview session

### Server Events (Backend to Frontend)

- `joinedInterview` - Confirmation of joining an interview
- `participantJoined` - Notification when a new participant joins
- `participantLeft` - Notification when a participant leaves
- `aiInterviewerMessage` - Messages from the AI interviewer
- `interviewEnded` - Notification that the interview has ended
- `error` - Error messages

## Environment Configuration

Required environment variables:

```
# LiveKit Configuration
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-livekit-server.com

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
PORT=3000
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables: Copy `.env.example` to `.env` and fill in the values
4. Start the development server: `npm run start:dev`

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Architecture

The system architecture follows these principles:

- Clear separation of concerns between LiveKit integration and AI logic
- Stateful management of interview sessions
- Real-time bidirectional communication
- Secure token-based authentication
- Modular design for easy extension

## License

This project is [MIT licensed](LICENSE).
