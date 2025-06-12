# Rolevate Interview API - Frontend Integration Guide

## Overview
Our simplified API provides a single endpoint that handles everything:
- Candidate registration
- Room creation with complete metadata for AI agent
- LiveKit token generation
- Database records

## API Endpoint

### POST /interview/create

**Request Body:**
```json
{
  "jobPostId": "306bfccd-5030-46bb-b468-e5027a073b4a",
  "phoneNumber": "+962791234567",
  "firstName": "Ahmed", // optional
  "lastName": "Hassan"  // optional
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "roomName": "interview_uuid_1234",
  "participantName": "Ahmed Hassan",
  "identity": "candidate_962791234567_1718123456789",
  "wsUrl": "wss://rolvate2-ckmk80qb.livekit.cloud",
  "roomCode": "7912341234",
  "jobTitle": "Senior Software Engineer",
  "companyName": "TechCorp",
  "maxDuration": 1800,
  "interviewId": "interview-uuid",
  "candidateId": "candidate-uuid",
  "applicationId": "application-uuid",
  "jobPostId": "306bfccd-5030-46bb-b468-e5027a073b4a",
  "status": "READY_TO_JOIN"
}
```

## Frontend Implementation

### 1. Basic HTML/JavaScript Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Rolevate Interview</title>
    <script src="https://unpkg.com/@livekit/client@latest/dist/livekit-client.umd.js"></script>
</head>
<body>
    <div id="interview-container">
        <h1>Interview Room</h1>
        <div id="video-container"></div>
        <button onclick="joinInterview()">Join Interview</button>
    </div>

    <script>
        async function joinInterview() {
            try {
                // 1. Create interview session
                const response = await fetch('http://localhost:4005/interview/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        jobPostId: '306bfccd-5030-46bb-b468-e5027a073b4a',
                        phoneNumber: '+962791234567',
                        firstName: 'Ahmed',
                        lastName: 'Hassan'
                    })
                });

                const data = await response.json();
                console.log('Interview session created:', data);

                // 2. Connect to LiveKit room
                const room = new LiveKit.Room();
                
                // Handle events
                room.on('participantConnected', (participant) => {
                    console.log('Participant connected:', participant.identity);
                });
                
                room.on('trackSubscribed', (track, publication, participant) => {
                    if (track.kind === 'video') {
                        const videoElement = track.attach();
                        document.getElementById('video-container').appendChild(videoElement);
                    }
                });

                // 3. Join the room
                await room.connect(data.wsUrl, data.token);
                console.log('Connected to room:', data.roomName);

                // 4. Enable camera and microphone
                await room.localParticipant.enableCameraAndMicrophone();

            } catch (error) {
                console.error('Failed to join interview:', error);
            }
        }
    </script>
</body>
</html>
```

### 2. React Component Example

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { Room, RemoteTrack, Track } from 'livekit-client';

function InterviewRoom({ jobPostId, phoneNumber, firstName, lastName }) {
    const [room, setRoom] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [interviewData, setInterviewData] = useState(null);
    const videoContainerRef = useRef(null);

    const joinInterview = async () => {
        try {
            // 1. Create interview session
            const response = await fetch('http://localhost:4005/interview/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobPostId,
                    phoneNumber,
                    firstName,
                    lastName
                })
            });

            const data = await response.json();
            setInterviewData(data);

            // 2. Connect to LiveKit room
            const newRoom = new Room();
            
            // Handle events
            newRoom.on('participantConnected', (participant) => {
                console.log('Participant connected:', participant.identity);
            });
            
            newRoom.on('trackSubscribed', (track, publication, participant) => {
                if (track.kind === Track.Kind.Video) {
                    const videoElement = track.attach();
                    if (videoContainerRef.current) {
                        videoContainerRef.current.appendChild(videoElement);
                    }
                }
            });

            // 3. Join the room
            await newRoom.connect(data.wsUrl, data.token);
            setRoom(newRoom);
            setIsConnected(true);

            // 4. Enable camera and microphone
            await newRoom.localParticipant.enableCameraAndMicrophone();

        } catch (error) {
            console.error('Failed to join interview:', error);
        }
    };

    const leaveInterview = async () => {
        if (room) {
            await room.disconnect();
            setRoom(null);
            setIsConnected(false);
        }
    };

    return (
        <div className="interview-room">
            <h1>Interview for {interviewData?.jobTitle}</h1>
            <p>Company: {interviewData?.companyName}</p>
            
            <div ref={videoContainerRef} className="video-container">
                {/* Video elements will be appended here */}
            </div>
            
            <div className="controls">
                {!isConnected ? (
                    <button onClick={joinInterview}>Join Interview</button>
                ) : (
                    <button onClick={leaveInterview}>Leave Interview</button>
                )}
            </div>
        </div>
    );
}

export default InterviewRoom;
```

### 3. URL-based Access (Shareable Links)

You can also create shareable interview links by encoding the parameters in the URL:

```javascript
// Generate interview link
function generateInterviewLink(jobPostId, phoneNumber, firstName, lastName) {
    const params = new URLSearchParams({
        jobPostId,
        phoneNumber,
        firstName: firstName || '',
        lastName: lastName || ''
    });
    
    return `https://yourwebsite.com/interview?${params.toString()}`;
}

// Parse URL parameters and auto-join
function autoJoinFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const jobPostId = params.get('jobPostId');
    const phoneNumber = params.get('phoneNumber');
    const firstName = params.get('firstName');
    const lastName = params.get('lastName');
    
    if (jobPostId && phoneNumber) {
        joinInterview(jobPostId, phoneNumber, firstName, lastName);
    }
}
```

## Key Points

1. **Single API Call**: One request creates everything needed for the interview
2. **Unique Rooms**: Each candidate gets their own room based on phone number + timestamp
3. **Complete Metadata**: The AI agent receives all job and candidate information
4. **Ready-to-Use Token**: Frontend gets a LiveKit token ready for immediate connection
5. **Database Records**: All data is automatically stored for tracking

## Example Usage Flow

1. **WhatsApp/SMS**: Send link like `https://yoursite.com/interview?jobPostId=123&phoneNumber=+962791234567`
2. **Candidate clicks**: Frontend extracts parameters from URL
3. **Auto-join**: Frontend calls `/interview/create` and connects to LiveKit
4. **AI Agent**: Receives complete metadata and starts personalized interview

This approach eliminates the need for multiple API calls and complex room management!
