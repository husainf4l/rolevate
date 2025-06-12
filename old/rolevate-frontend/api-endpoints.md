# LiveKit AI Interview System API Endpoints

## LiveKit Endpoints

### 1. Generate Token for Candidate

```
GET /livekit/token?identity=candidate123&room=interview456&name=John%20Doe
```

- **Purpose**: Generates a token for a candidate to join a LiveKit room
- **Query Parameters**:
  - `identity`: Unique identifier for the candidate (required)
  - `room`: The room name to join (required)
  - `name`: Display name for the participant (optional)

You can also use the POST method:

```
POST /livekit/token
```

- **Request Body**:

```json
{
  "identity": "candidate123",
  "roomName": "interview456",
  "name": "John Doe"
}
```

### 2. Create Room

```
POST /livekit/room
```

- **Request Body**:

```json
{
  "name": "interview-room-123",
  "emptyTimeout": 10,
  "maxParticipants": 2
}
```

- **Purpose**: Creates a new LiveKit room for an interview

### 3. Get Room Info

```
GET /livekit/room/:roomName
```

- **Purpose**: Gets information about a specific room
- **Path Parameters**:
  - `roomName`: The name of the room to get information about

### 4. Delete Room

```
DELETE /livekit/room/:roomName
```

- **Purpose**: Deletes a room
- **Path Parameters**:
  - `roomName`: The name of the room to delete

### 5. List Rooms

```
GET /livekit/rooms
```

- **Purpose**: Lists all active LiveKit rooms

## AI Interview Endpoints

### 1. Create Interview Session

```
POST /interview
```

- **Request Body**:

```json
{
  "roomName": "interview-room-123",
  "candidateId": "candidate123",
  "jobDescription": "Looking for someone experienced in NestJS and React"
}
```

- **Purpose**: Initializes a new interview session and returns session ID

### 2. Start Interview

```
POST /interview/:sessionId/start
```

- **Purpose**: Starts an interview session and makes the AI bot join the room
- **Path Parameters**:
  - `sessionId`: The unique identifier for the interview session

### 3. Send Candidate Response

```
POST /interview/:sessionId/response
```

- **Request Body**:

```json
{
  "response": "I have 5 years of experience working with React and Node.js..."
}
```

- **Purpose**: Sends the candidate's response to a question
- **Path Parameters**:
  - `sessionId`: The interview session ID

### 4. Get Interview Status

```
GET /interview/:sessionId
```

- **Purpose**: Gets the current status and information about an interview session
- **Path Parameters**:
  - `sessionId`: The interview session ID

### 5. Get Interview Transcript

```
GET /interview/:sessionId/transcript
```

- **Purpose**: Gets the full transcript of an interview session
- **Path Parameters**:
  - `sessionId`: The interview session ID

### 6. Get Interview Summary

```
GET /interview/:sessionId/summary
```

- **Purpose**: Gets an AI-generated summary of the interview
- **Path Parameters**:
  - `sessionId`: The interview session ID

### 7. End Interview

```
POST /interview/:sessionId/end
```

- **Purpose**: Ends the interview session
- **Path Parameters**:
  - `sessionId`: The interview session ID

## Audio Handling Endpoints

### 1. Synthesize Speech

```
POST /audio/synthesize
```

- **Request Body**:

```json
{
  "text": "Hello, I'm your AI interviewer today.",
  "voice": "alloy"
}
```

- **Purpose**: Converts text to speech and returns audio URL
- **Available Voices**: "alloy", "echo", "fable", "onyx", "nova", "shimmer"

### 2. Transcribe Audio

```
POST /transcription/audio
```

- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `file`: Audio file to transcribe (typically .wav or .mp3)
- **Purpose**: Transcribes spoken audio to text

## WebSocket Events

Connect to the WebSocket at: `ws://localhost:4003`

### Client-to-Server Events:

- `joinInterview`: Join an existing interview session
- `leaveInterview`: Leave an interview session
- `candidateResponse`: Send candidate's response to current question
- `startInterview`: Start the interview process
- `endInterview`: End the interview session

### Server-to-Client Events:

- `joinedInterview`: Confirmation that client joined the interview
- `participantJoined`: Notification that a new participant joined
- `participantLeft`: Notification that a participant left
- `aiInterviewerMessage`: Message from the AI interviewer
- `interviewEnded`: Notification that interview has ended
- `error`: Error notification

## Health Endpoints

### Check API Health

```
GET /health
```

- **Purpose**: Checks if the API is up and running

## Testing Flow

A typical test flow would be:

1. Create a room with `/livekit/room`
2. Generate a token with `/livekit/token`
3. Create an interview session with `/interview`
4. Connect to the LiveKit room using the token
5. Start the interview with `/interview/:sessionId/start`
6. Send candidate responses with `/interview/:sessionId/response`
7. End the interview with `/interview/:sessionId/end`
8. Get interview summary with `/interview/:sessionId/summary`

Make sure to handle proper error responses and implement retry logic where appropriate.
