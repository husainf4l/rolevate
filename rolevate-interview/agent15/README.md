# Agent10 - Simple Clean Interview Agent

## Overview

Agent10 is a clean, straightforward interview agent based on the successful Agent8 architecture with added capabilities for transcript saving and video link management.

## Features

### Core Functionality

- ✅ Simple, clean interview flow
- ✅ Maximum 3 questions limit
- ✅ Professional HR approach
- ✅ Multilingual support (Arabic/English)
- ✅ Clean role definition (agent = interviewer, user = candidate)

### Added Capabilities

- ✅ **Video Link Saving**: Automatically saves recording URLs to backend
- ✅ **Transcript Saving**: Real-time transcript saving with speaker identification
- ✅ **Metadata Integration**: Supports job, candidate, and company information
- ✅ **Clean Shutdown**: Proper resource cleanup and final data saving

### Removed Complexity

- ❌ No silence monitoring (removed to avoid issues)
- ❌ No complex conversation tracking
- ❌ No duplicate message handling
- ❌ Simplified event handling

## Architecture

```
agent10/
├── __init__.py
├── agent.py              # Simple interview agent
├── main.py               # Clean entrypoint
├── utils/
│   ├── __init__.py
│   ├── metadata.py       # Metadata extraction
│   ├── recording.py      # Recording management
│   └── transcript_saver.py # Simple transcript saving
└── README.md
```

## Configuration

### Required Environment Variables

```bash
# OpenAI (for STT)
OPENAI_API_KEY=your_openai_key

# Google (for LLM)
GOOGLE_API_KEY=your_google_key

# ElevenLabs (for TTS)
ELEVENLABS_API_KEY=your_elevenlabs_key

# AWS (for recording storage)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_BUCKET_NAME=your_bucket_name
AWS_REGION=your_aws_region

# Backend integration
BACKEND_URL=http://localhost:4005

# Agent port
LIVEKIT_AGENT_PORT=8010
```

## Usage

### Start Agent10

```bash
cd agent10
python main.py
```

### Expected Flow

1. Agent connects and sends welcome message
2. Candidate introduces themselves
3. Agent asks maximum 3 strategic questions
4. Agent ends with: "Thank you for your time. This concludes the interview."
5. System saves transcript and video link to backend

## Key Differences from Agent9

| Feature               | Agent9       | Agent10    |
| --------------------- | ------------ | ---------- |
| Silence Monitoring    | ✅ Complex   | ❌ Removed |
| Conversation Tracking | ✅ Detailed  | ✅ Simple  |
| Error Handling        | ✅ Extensive | ✅ Basic   |
| Code Complexity       | 🔴 High      | 🟢 Low     |
| Debugging Output      | 🔴 Verbose   | 🟢 Clean   |
| Transcript Saving     | ✅ Advanced  | ✅ Simple  |
| Video Link Saving     | ✅ Yes       | ✅ Yes     |

## Benefits

- **Reliability**: Based on proven Agent8 architecture
- **Simplicity**: Clean, maintainable code
- **Functionality**: Essential features for production use
- **Debugging**: Clear, concise logging
- **Performance**: Lightweight and efficient

## Troubleshooting

### Common Issues

1. **Role Confusion**: Agent10 has clear role definition to prevent acting like candidate
2. **Missing Transcripts**: Automatic saving with fallback mechanisms
3. **Video URL Issues**: Constructs S3 URLs if presigned URLs fail
4. **Language Issues**: Proper multilingual support with clear instructions

### Logs to Check

- Connection status
- Recording start/stop
- Transcript saving
- Video URL backend calls
- Agent speech/user speech events
