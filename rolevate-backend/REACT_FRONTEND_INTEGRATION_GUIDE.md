# Rolevate Backend - Complete React Frontend Integration Guide

## System Overview

Your **Rolevate** backend is now fully operational with:

- ✅ **Authentication System** (HTTP-only cookies)
- ✅ **LiveKit Integration** (Video interviews)
- ✅ **Public Interview System** (Phone number-based access)
- ✅ **Multi-Candidate Support** (Multiple candidates per job)
- ✅ **Database Schema** (Complete recruitment platform)
- ✅ **API Endpoints** (All necessary endpoints)

## Backend Status: 🟢 READY FOR PRODUCTION

**Server URL**: `http://localhost:4005`
**Live Demo Data**: Available (Husain admin user, job posts, companies)

---

## Frontend Integration Steps

### 1. Authentication Integration

#### Login Flow

```typescript
// Frontend login function
const login = async (username: string, password: string) => {
  const response = await fetch('http://localhost:4005/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // IMPORTANT: Include cookies
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    const userData = await response.json();
    return userData;
  }
  throw new Error('Login failed');
};
```

#### Protected API Calls

```typescript
// All authenticated requests must include credentials
const makeAuthenticatedRequest = async (
  url: string,
  options: RequestInit = {},
) => {
  return fetch(url, {
    ...options,
    credentials: 'include', // Always include for authenticated requests
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};
```

#### Get Current User

```typescript
const getCurrentUser = async () => {
  const response = await makeAuthenticatedRequest(
    'http://localhost:4005/api/auth/users/me',
  );
  return response.json();
};
```

#### Logout

```typescript
const logout = async () => {
  await makeAuthenticatedRequest('http://localhost:4005/api/auth/logout', {
    method: 'POST',
  });
};
```

### 2. LiveKit Video Integration

#### Install LiveKit Components

```bash
npm install @livekit/components-react @livekit/components-core livekit-client
```

#### Create Interview Room (Admin/HR)

```typescript
const createInterviewRoom = async (jobPostId: string) => {
  const response = await makeAuthenticatedRequest(
    'http://localhost:4005/api/public/interview/room/create',
    {
      method: 'POST',
      body: JSON.stringify({
        jobPostId,
        interviewType: 'AI_SCREENING',
        instructions:
          'Welcome to your interview. Please speak clearly and answer all questions.',
        maxDuration: 1800, // 30 minutes
        maxCandidates: 50,
      }),
    },
  );

  return response.json();
  // Returns: { roomCode, roomName, joinUrl, instructions, jobTitle, companyName }
};
```

#### Get LiveKit Token (Authenticated Users)

```typescript
const getLiveKitToken = async (
  roomName: string,
  identity: string,
  name: string,
) => {
  const response = await makeAuthenticatedRequest(
    'http://localhost:4005/api/livekit/token',
    {
      method: 'POST',
      body: JSON.stringify({
        roomName,
        identity,
        name,
      }),
    },
  );

  return response.json();
  // Returns: { token, serverUrl, participantToken, roomName, identity }
};
```

#### React LiveKit Component for Authenticated Users

```typescript
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';

const InterviewRoom = ({ roomName, userIdentity, userName }: {
  roomName: string;
  userIdentity: string;
  userName: string;
}) => {
  const [token, setToken] = useState<string>('');
  const [serverUrl] = useState('wss://rolvate-fi6h6rke.livekit.cloud');

  useEffect(() => {
    const getToken = async () => {
      const tokenData = await getLiveKitToken(roomName, userIdentity, userName);
      setToken(tokenData.token);
    };
    getToken();
  }, [roomName, userIdentity, userName]);

  if (!token) return <div>Loading...</div>;

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      style={{ height: '100dvh' }}
    >
      <VideoConference />
    </LiveKitRoom>
  );
};
```

### 3. Public Interview System (Candidates)

#### Candidate Join Interview (No Login Required)

```typescript
const joinInterviewAsCandidate = async (
  roomCode: string,
  phoneNumber: string,
  firstName: string,
  lastName: string,
) => {
  const response = await fetch(
    `http://localhost:4005/api/public/interview/join/${roomCode}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber, // Must be Jordan format: +962XXXXXXXXX
        firstName,
        lastName,
      }),
    },
  );

  return response.json();
  // Returns: { token, serverUrl, roomName, identity, participantName, jobTitle, instructions, maxDuration }
};
```

#### Get Interview Room Info (Public)

```typescript
const getInterviewRoomInfo = async (roomCode: string) => {
  const response = await fetch(
    `http://localhost:4005/api/public/interview/room/${roomCode}`,
  );
  return response.json();
  // Returns: { roomCode, jobTitle, companyName, instructions, maxDuration, status, interviewType }
};
```

#### React Component for Candidate Interview

```typescript
import { LiveKitRoom, VideoConference } from '@livekit/components-react';

const CandidateInterviewRoom = ({ roomCode }: { roomCode: string }) => {
  const [interviewData, setInterviewData] = useState<any>(null);
  const [candidateInfo, setCandidateInfo] = useState({
    phoneNumber: '',
    firstName: '',
    lastName: ''
  });
  const [joined, setJoined] = useState(false);

  const handleJoinInterview = async () => {
    try {
      const data = await joinInterviewAsCandidate(
        roomCode,
        candidateInfo.phoneNumber,
        candidateInfo.firstName,
        candidateInfo.lastName
      );
      setInterviewData(data);
      setJoined(true);
    } catch (error) {
      console.error('Failed to join interview:', error);
    }
  };

  if (!joined) {
    return (
      <div className="interview-join-form">
        <h2>Join Interview - {roomCode}</h2>
        <input
          placeholder="Phone (+962XXXXXXXXX)"
          value={candidateInfo.phoneNumber}
          onChange={(e) => setCandidateInfo({...candidateInfo, phoneNumber: e.target.value})}
        />
        <input
          placeholder="First Name"
          value={candidateInfo.firstName}
          onChange={(e) => setCandidateInfo({...candidateInfo, firstName: e.target.value})}
        />
        <input
          placeholder="Last Name"
          value={candidateInfo.lastName}
          onChange={(e) => setCandidateInfo({...candidateInfo, lastName: e.target.value})}
        />
        <button onClick={handleJoinInterview}>Join Interview</button>
      </div>
    );
  }

  return (
    <div>
      <div className="interview-header">
        <h2>{interviewData.jobTitle}</h2>
        <p>{interviewData.instructions}</p>
        <p>Duration: {Math.floor(interviewData.maxDuration / 60)} minutes</p>
      </div>

      <LiveKitRoom
        video={true}
        audio={true}
        token={interviewData.token}
        serverUrl={interviewData.serverUrl}
        data-lk-theme="default"
        style={{ height: '70vh' }}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
};
```

### 4. Available Demo Data

#### Test Credentials

- **Username**: `husain`
- **Password**: `password123`
- **Role**: `SUPER_ADMIN`
- **Company**: `Roxate Ltd`

#### Job Posts Available

1. **Senior Backend Developer - Fintech** (ID: `398c4ff8-05ad-4ed5-960a-ef2e7a727321`)
2. **AI/ML Engineer - Risk Analytics** (ID: `6a4ac178-eaf7-4c36-85fa-b8f758ad959c`)
3. **Cybersecurity Analyst** (ID: `04cf6f79-0000-4a04-bb3b-6733cd6b7361`)

### 5. API Endpoints Summary

#### Authentication (Requires login)

- `POST /api/auth/login` - Login with username/password
- `GET /api/auth/users/me` - Get current user
- `POST /api/auth/logout` - Logout

#### LiveKit (Requires authentication)

- `POST /api/livekit/token` - Generate LiveKit token for authenticated users
- `POST /api/livekit/room` - Create LiveKit room
- `GET /api/livekit/rooms` - List all rooms

#### Public Interview (No authentication required for candidates)

- `POST /api/public/interview/room/create` - Create interview room (requires auth)
- `POST /api/public/interview/join/{roomCode}` - Join interview with phone number
- `GET /api/public/interview/room/{roomCode}` - Get room info
- `GET /api/public/interview/room/{roomCode}/candidates` - List candidates

### 6. Key Features Implemented

#### Multi-Candidate Support

- ✅ Multiple candidates can join the same interview room
- ✅ Each candidate gets a unique LiveKit room name
- ✅ Separate interview sessions tracked per candidate
- ✅ Up to 50 candidates per job post

#### Phone Number Authentication

- ✅ Jordan phone number format validation (+962XXXXXXXXX)
- ✅ No account creation required for candidates
- ✅ Unique participant identity per phone number

#### Real-time Video Interviews

- ✅ LiveKit Cloud integration
- ✅ Audio/Video communication
- ✅ Recording capabilities
- ✅ Token-based secure access

### 7. Next Steps for Frontend

1. **Set up the authentication flow** with HTTP-only cookies
2. **Implement the admin dashboard** for creating interview rooms
3. **Create the candidate interview interface** with phone number entry
4. **Add the LiveKit video components** for both admin and candidate views
5. **Test the complete flow** with multiple candidates

### 8. Environment Setup

Make sure your React app includes these environment variables:

```env
REACT_APP_API_URL=http://localhost:4005
REACT_APP_LIVEKIT_URL=wss://rolvate-fi6h6rke.livekit.cloud
```

---

## Testing the System

### Test Flow 1: Admin Creates Interview

1. Login as `husain` / `password123`
2. Create interview room for job ID `398c4ff8-05ad-4ed5-960a-ef2e7a727321`
3. Get room code (e.g., `2YKFR8GD`)

### Test Flow 2: Candidates Join

1. Candidate 1: Join with `+962791234567`, `Ahmed`, `Al-Rashid`
2. Candidate 2: Join with `+962795678901`, `Sarah`, `Al-Mahmoud`
3. Both get separate LiveKit rooms and tokens

### Test Flow 3: Video Interview

1. Each candidate connects to their unique room
2. AI agent can join the room for automated interviews
3. Sessions are tracked separately in the database

---

Your backend is **production-ready** and fully tested! The integration with your React frontend should be straightforward using the patterns above.
