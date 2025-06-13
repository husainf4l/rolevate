# Session Management for Job Post Agent

## Overview

The job post creation agent now supports **proper chat ID session management** using LangGraph for maintaining conversation state across multiple API requests. This allows for true conversational experiences where the agent remembers previous context and can continue building job posts over multiple interactions.

## Key Features

### ✅ Session Persistence

- **Automatic Session Creation**: Each new conversation gets a unique session ID
- **State Preservation**: Job data, conversation history, and progress are maintained between requests
- **Session Resume**: Existing sessions can be resumed even after server restarts
- **Automatic Cleanup**: Sessions expire after 24 hours of inactivity

### ✅ Enhanced API Endpoints

- **Session-aware Create**: `/create-job-post` with optional session_id parameter
- **Conversation Continuity**: `/job-post-chat` using session_id for state management
- **Session Information**: `/job-post-session/{session_id}` to query session details
- **Session Management**: DELETE endpoint to clean up sessions

### ✅ Improved User Experience

- **Context Awareness**: Agent remembers what was discussed previously
- **Progressive Data Collection**: Job details are built incrementally across turns
- **Smart Completion Detection**: Automatically finalizes when sufficient data is collected
- **Resume Capability**: Users can return to incomplete job posts

## API Endpoints

### 1. Create Job Post (New or Resume Session)

```http
POST /create-job-post
Content-Type: application/x-www-form-urlencoded

message=.net developer full stack
company_id=eeb88919-5a2d-4393-b14b-8a3bfbb51c7e
company_name=papaya trading
session_id=optional-existing-session-id
```

**Response:**

```json
{
  "status": "success",
  "session_id": "90c811b9-ff13-4d19-a752-a94cf04de1aa",
  "company_id": "eeb88919-5a2d-4393-b14b-8a3bfbb51c7e",
  "company_name": "papaya trading",
  "agent_response": "Great! You're looking to hire a Full Stack .Net Developer...",
  "is_complete": false,
  "job_data": {
    "title": ".Net Developer Full Stack",
    "experienceLevel": "",
    "skills": [".net"],
    "location": ""
    // ... other job fields
  },
  "current_step": "collecting_details"
}
```

### 2. Continue Conversation

```http
POST /job-post-chat
Content-Type: application/x-www-form-urlencoded

message=senior level with 5+ years experience
session_id=90c811b9-ff13-4d19-a752-a94cf04de1aa
```

**Response:**

```json
{
  "status": "success",
  "session_id": "90c811b9-ff13-4d19-a752-a94cf04de1aa",
  "agent_response": "Fantastic! A senior Full-Stack .Net Developer...",
  "is_complete": false,
  "job_data": {
    "title": ".Net Developer Full Stack",
    "experienceLevel": "senior",
    "skills": [".net"]
    // ... updated job fields
  },
  "current_step": "collecting_details"
}
```

### 3. Get Session Information

```http
GET /job-post-session/{session_id}
```

**Response:**

```json
{
  "status": "success",
  "session_id": "90c811b9-ff13-4d19-a752-a94cf04de1aa",
  "company_id": "eeb88919-5a2d-4393-b14b-8a3bfbb51c7e",
  "company_name": "papaya trading",
  "created_at": "2025-06-13T15:55:59.947583",
  "last_updated": "2025-06-13T16:02:30.123456",
  "current_step": "collecting_details",
  "is_complete": false,
  "conversation_turns": 5,
  "job_data": {
    /* current job data */
  }
}
```

### 4. Delete Session

```http
DELETE /job-post-session/{session_id}
```

## Usage Examples

### Starting a New Conversation

```python
import requests

# Start new job post conversation
response = requests.post("http://localhost:8000/create-job-post", data={
    "message": ".net developer",
    "company_id": "your-company-id",
    "company_name": "Your Company"
})

session_id = response.json()["session_id"]
```

### Continuing the Conversation

```python
# Continue the conversation
response = requests.post("http://localhost:8000/job-post-chat", data={
    "message": "senior level, 5+ years experience, full-stack",
    "session_id": session_id
})

print(response.json()["agent_response"])
```

### Resuming an Existing Session

```python
# Resume existing session
response = requests.post("http://localhost:8000/create-job-post", data={
    "message": "hello",  # Can be any message
    "company_id": "your-company-id",
    "company_name": "Your Company",
    "session_id": "existing-session-id"
})
```

## Session Storage

### File-Based Persistence

- Sessions are stored as JSON files in the `sessions/` directory
- Each session has its own file: `{session_id}.json`
- Sessions survive server restarts
- Automatic cleanup of expired sessions

### Session Data Structure

```json
{
  "session_id": "90c811b9-ff13-4d19-a752-a94cf04de1aa",
  "company_id": "eeb88919-5a2d-4393-b14b-8a3bfbb51c7e",
  "company_name": "papaya trading",
  "created_at": "2025-06-13T15:55:59.947583",
  "last_updated": "2025-06-13T16:02:30.123456",
  "conversation_history": [
    "User: .net developer full stack",
    "AI: Great! You're looking to hire a Full Stack .Net Developer...",
    "User: senior level with 5+ years experience",
    "AI: Fantastic! A senior Full-Stack .Net Developer..."
  ],
  "job_data": {
    "title": ".Net Developer Full Stack",
    "experienceLevel": "senior",
    "skills": [".net"],
    "location": ""
    // ... complete job post data
  },
  "current_step": "collecting_details",
  "is_complete": false
}
```

## Architecture

### SessionManager Class

- **Handles**: Session creation, retrieval, updates, and cleanup
- **Storage**: File-based persistence with in-memory caching
- **Timeout**: 24-hour session expiration
- **Thread-safe**: Uses locks for concurrent access

### SessionJobPostAgent Class

- **Stateful**: Maintains conversation context across requests
- **Intelligent**: Extracts job information progressively
- **Completion Detection**: Automatically finalizes when ready
- **Error Handling**: Graceful degradation for missing/expired sessions

## Benefits

1. **True Conversational Experience**: Users can have natural, multi-turn conversations
2. **Persistent State**: No information is lost between requests
3. **Resume Capability**: Users can return to incomplete job posts later
4. **Scalable**: Session storage can be easily extended to databases
5. **Reliable**: Sessions survive server restarts and crashes
6. **Automatic Cleanup**: Expired sessions are automatically removed

## Error Handling

### Session Not Found

```json
{
  "status": "error",
  "error": "Session not found or expired. Please start a new conversation.",
  "session_id": null,
  "agent_response": "I'm sorry, but your session has expired. Let's start fresh!",
  "is_complete": false,
  "job_data": {},
  "current_step": "getting_basic_info"
}
```

### Invalid Session ID

- Returns 404 status for GET/DELETE requests
- Creates new session for POST requests with invalid session_id

## Testing

Run the comprehensive test suite:

```bash
python test_session_management.py
```

This tests:

- Session creation and management
- Conversation continuity
- State persistence
- API endpoint functionality
- Error handling scenarios

## Future Enhancements

1. **Database Storage**: Replace file storage with Redis/PostgreSQL
2. **User Authentication**: Associate sessions with user accounts
3. **Session Analytics**: Track conversation patterns and completion rates
4. **Multi-tenant Support**: Isolate sessions by organization
5. **Session Migration**: Transfer sessions between different conversation flows
