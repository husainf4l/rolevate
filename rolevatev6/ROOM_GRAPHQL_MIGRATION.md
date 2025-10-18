# Room Service GraphQL Migration

## Overview
Migrated the room/interview functionality from REST API to GraphQL to maintain consistency across the application.

---

## Changes Made

### 1. Created New Room Service (`/src/services/room.service.ts`)

A complete GraphQL service for managing interview rooms with LiveKit integration.

#### Features:
- **Create Interview Room**: Creates a LiveKit room with complete interview context
- **Get Room Status**: Checks if a room exists and is active
- **Room Name Generation**: Helper for generating unique room names

#### GraphQL Mutations:

**Create Interview Room:**
```graphql
mutation CreateInterviewRoom($input: CreateInterviewRoomInput!) {
  createInterviewRoom(input: $input) {
    success
    room {
      id
      name
      metadata
      createdAt
    }
    token
    participantName
    candidateId
    liveKitUrl
    expiresAt
    interviewContext {
      candidateName
      jobName
      companyName
      interviewLanguage
      interviewPrompt
      cvAnalysis {
        score
        summary
        overallFit
        strengths
        weaknesses
      }
    }
    interviewSummary {
      candidateName
      position
      company
      interviewLanguage
      interviewType
    }
    message
    instructions {
      step1
      step2
      step3
      step4
    }
  }
}
```

**Get Room Status:**
```graphql
query GetRoomStatus($roomName: String!) {
  roomStatus(roomName: $roomName) {
    exists
    active
    participantCount
    metadata
  }
}
```

---

### 2. Updated `useRoomConnection` Hook

**File:** `/src/app/room/hooks/useRoomConnection.ts`

#### Before (REST API):
```typescript
const createResponse = await fetch(
  `${API_CONFIG.API_BASE_URL}/room/create-new-room`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId, phone, roomName: backendRoomName }),
  }
);

if (!createResponse.ok) {
  throw new Error(`Failed to create room: ${await createResponse.text()}`);
}

const createData = await createResponse.json();
```

#### After (GraphQL):
```typescript
const createData = await roomService.createInterviewRoom({
  jobId,
  phone,
  roomName: backendRoomName
});
```

#### Benefits:
- ✅ Type-safe with TypeScript interfaces
- ✅ Automatic error handling
- ✅ Consistent with rest of the application
- ✅ Better code organization
- ✅ Built-in Apollo Client caching

---

### 3. Updated Imports

**Removed:**
```typescript
import { API_CONFIG } from "@/lib/config";
```

**Added:**
```typescript
import { roomService } from "@/services/room.service";
```

---

## TypeScript Interfaces

### CreateRoomInput
```typescript
interface CreateRoomInput {
  jobId: string;
  phone: string;
  roomName: string;
}
```

### CreateRoomResponse
```typescript
interface CreateRoomResponse {
  success: boolean;
  room: Room;
  token: string;
  participantName: string;
  candidateId: string;
  liveKitUrl: string;
  expiresAt: string;
  interviewContext: InterviewContext;
  interviewSummary: InterviewSummary;
  message: string;
  instructions: RoomInstructions;
}
```

### Room
```typescript
interface Room {
  id: string;
  name: string;
  metadata: RoomMetadata;
  createdAt: string;
}
```

### RoomMetadata
```typescript
interface RoomMetadata {
  applicationId?: string;
  candidateId?: string;
  candidatePhone?: string;
  jobId?: string;
  jobName?: string;
  companyName?: string;
  companySpelling?: string;
  interviewLanguage?: string;
  interviewPrompt?: string;
  cvAnalysis?: {
    score?: number;
    summary?: string;
    overallFit?: string;
    strengths?: string[];
    weaknesses?: string[];
  };
}
```

### InterviewContext
```typescript
interface InterviewContext {
  candidateName: string;
  jobName: string;
  companyName: string;
  interviewLanguage: string;
  interviewPrompt: string;
  cvAnalysis?: {
    score?: number;
    summary?: string;
    overallFit?: string;
    strengths?: string[];
    weaknesses?: string[];
  };
}
```

### RoomStatus
```typescript
interface RoomStatus {
  exists: boolean;
  active: boolean;
  participantCount: number;
  metadata?: RoomMetadata;
}
```

---

## Usage Examples

### 1. Create Interview Room
```typescript
import { roomService } from '@/services/room.service';

const createRoom = async () => {
  try {
    const response = await roomService.createInterviewRoom({
      jobId: '123',
      phone: '+1234567890',
      roomName: 'interview_app123_1234567890'
    });

    console.log('Room created:', response.room);
    console.log('LiveKit token:', response.token);
    console.log('Interview context:', response.interviewContext);
  } catch (error) {
    console.error('Failed to create room:', error);
  }
};
```

### 2. Check Room Status
```typescript
import { roomService } from '@/services/room.service';

const checkStatus = async () => {
  try {
    const status = await roomService.getRoomStatus('interview_app123_1234567890');
    
    if (status.active) {
      console.log('Room is active with', status.participantCount, 'participants');
    } else {
      console.log('Room is not active');
    }
  } catch (error) {
    console.error('Failed to get room status:', error);
  }
};
```

### 3. Generate Room Name
```typescript
import { roomService } from '@/services/room.service';

const roomName = roomService.generateRoomName('app_123');
// Returns: "interview_app_123_1234567890"
```

---

## Backend Requirements

The backend GraphQL API must implement:

### 1. Mutation: `createInterviewRoom`
```graphql
type Mutation {
  createInterviewRoom(input: CreateInterviewRoomInput!): CreateInterviewRoomResponse!
}

input CreateInterviewRoomInput {
  jobId: ID!
  phone: String!
  roomName: String!
}
```

### 2. Query: `roomStatus`
```graphql
type Query {
  roomStatus(roomName: String!): RoomStatusResponse!
}
```

### 3. Types
```graphql
type CreateInterviewRoomResponse {
  success: Boolean!
  room: RoomInfo!
  token: String!
  participantName: String!
  candidateId: ID!
  liveKitUrl: String!
  expiresAt: String!
  interviewContext: InterviewContext!
  interviewSummary: InterviewSummary!
  message: String!
  instructions: RoomInstructions!
}

type RoomInfo {
  id: ID!
  name: String!
  metadata: JSON!
  createdAt: String!
}

type InterviewContext {
  candidateName: String!
  jobName: String!
  companyName: String!
  interviewLanguage: String!
  interviewPrompt: String!
  cvAnalysis: CVAnalysis
}

type CVAnalysis {
  score: Float
  summary: String
  overallFit: String
  strengths: [String!]
  weaknesses: [String!]
}

type InterviewSummary {
  candidateName: String!
  position: String!
  company: String!
  interviewLanguage: String!
  interviewType: String!
}

type RoomInstructions {
  step1: String!
  step2: String!
  step3: String!
  step4: String!
}

type RoomStatusResponse {
  exists: Boolean!
  active: Boolean!
  participantCount: Int!
  metadata: JSON
}
```

---

## Testing

### Test Room Creation
```bash
# Test with curl (if backend supports HTTP)
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "mutation CreateRoom($input: CreateInterviewRoomInput!) { createInterviewRoom(input: $input) { success token liveKitUrl room { id name } } }",
    "variables": {
      "input": {
        "jobId": "test-job-id",
        "phone": "+1234567890",
        "roomName": "test-room-123"
      }
    }
  }'
```

### Test Room Status
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetStatus($roomName: String!) { roomStatus(roomName: $roomName) { exists active participantCount } }",
    "variables": {
      "roomName": "test-room-123"
    }
  }'
```

---

## Migration Checklist

### Frontend ✅
- [x] Created `/src/services/room.service.ts`
- [x] Updated `/src/app/room/hooks/useRoomConnection.ts`
- [x] Added TypeScript interfaces
- [x] Updated imports in hooks
- [x] Exported service from `/src/services/index.ts`
- [x] Removed dependency on `API_CONFIG`

### Backend (Required)
- [ ] Implement `createInterviewRoom` mutation
- [ ] Implement `roomStatus` query
- [ ] Add GraphQL types for room operations
- [ ] Maintain existing LiveKit integration
- [ ] Test with frontend integration

---

## Benefits of Migration

### 1. **Type Safety**
- Full TypeScript support
- Compile-time error checking
- Better IDE autocomplete

### 2. **Consistency**
- Matches other services (jobs, applications, auth)
- Uses Apollo Client for all API calls
- Unified error handling

### 3. **Better Developer Experience**
- Clear API contracts
- Self-documenting code
- Easier to maintain

### 4. **Performance**
- Apollo Client caching
- Optimistic updates possible
- Better error recovery

### 5. **Scalability**
- Easy to add new room operations
- Can add subscriptions for real-time updates
- Better suited for complex queries

---

## Potential Enhancements

### 1. Room Subscriptions (Real-time Updates)
```graphql
subscription OnRoomUpdated($roomName: String!) {
  roomUpdated(roomName: $roomName) {
    status
    participantCount
    participants {
      id
      name
      joinedAt
    }
  }
}
```

### 2. Batch Room Creation
```graphql
mutation CreateMultipleRooms($inputs: [CreateInterviewRoomInput!]!) {
  createMultipleRooms(inputs: $inputs) {
    success
    rooms {
      id
      name
      token
    }
  }
}
```

### 3. Room Analytics
```graphql
query GetRoomAnalytics($roomName: String!) {
  roomAnalytics(roomName: $roomName) {
    duration
    participantEngagement
    technicalQuality
    transcriptSummary
  }
}
```

---

## Rollback Plan

If issues occur, you can temporarily revert to REST API:

1. Restore old import: `import { API_CONFIG } from "@/lib/config";`
2. Replace the GraphQL call with the original fetch call
3. Keep the room service file for future use

---

## Summary

Successfully migrated room/interview functionality from REST to GraphQL:
- ✅ Cleaner code
- ✅ Type-safe
- ✅ Consistent with application architecture
- ✅ Better error handling
- ✅ Ready for future enhancements

All room operations now use GraphQL, making the application more maintainable and scalable! 🎉
