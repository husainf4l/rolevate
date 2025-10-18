# LiveKit Room Metadata Fix - Delete & Recreate Strategy

## Problem
The LiveKit agent was receiving **empty metadata** because:
1. Rooms were being reused without updating metadata on LiveKit server
2. Old rooms retained stale or missing metadata
3. Metadata was only updated in our database, not on LiveKit server

## Solution
Implemented a **Delete & Recreate** strategy:
1. **Delete existing room completely** (removes all participants and room)
2. **Wait 500ms** for deletion to complete
3. **Create brand new room** with fresh metadata
4. **Update our database** with the new metadata

## Code Changes

### File: `/src/livekit/livekit.service.ts`

#### Before (Problematic Approach)
```typescript
// Only removed participants, didn't delete room
// Room metadata never updated on LiveKit server
const participants = await roomService.listParticipants(name);
for (const participant of participants) {
  await roomService.removeParticipant(name, participant.identity);
}
```

#### After (Delete & Recreate)
```typescript
// 1. Check if room exists and DELETE it completely
try {
  const existingRooms = await roomService.listRooms([name]);
  
  if (existingRooms.length > 0) {
    console.log(`🔍 Found existing room: ${name}, deleting it completely...`);
    
    // Delete the room completely
    await roomService.deleteRoom(name);
    console.log(`🗑️ Deleted existing room: ${name}`);
    
    // Wait for deletion to complete
    await new Promise(resolve => setTimeout(resolve, 500));
  }
} catch (error) {
  console.log(`⚠️ Room check/delete failed: ${error.message}`);
}

// 2. Create brand new room with fresh metadata
try {
  const metadataJson = JSON.stringify(metadata);
  
  console.log(`🏗️ Creating NEW LiveKit room: ${name}`);
  console.log(`📦 Full Metadata being sent to LiveKit:`);
  console.log(JSON.stringify(metadata, null, 2));
  
  const liveKitRoom = await roomService.createRoom({
    name: name,
    metadata: metadataJson,
    emptyTimeout: 10 * 60,
    maxParticipants: 10,
  });
  
  console.log(`✅ NEW LiveKit room created: ${liveKitRoom.name}`);
  console.log(`🔍 Room metadata stored: ${liveKitRoom.metadata?.substring(0, 200)}`);
} catch (error) {
  console.error(`❌ CRITICAL: LiveKit room creation FAILED: ${error.message}`);
}
```

## Metadata Structure

### Complete Metadata Fields
```typescript
{
  // Core fields (required by agent)
  candidateName: "John Doe",
  jobName: "Senior Developer",
  companyName: "Tech Corp",
  companySpelling: "Tech Corp", // For AI pronunciation
  interviewLanguage: "english",
  interviewPrompt: "Conduct a professional interview...",
  
  // CV Analysis (structured format)
  cvAnalysis: {
    score: 85,
    summary: "Strong candidate...",
    overallFit: "Excellent match...",
    strengths: ["5 years experience", "Leadership skills"],
    weaknesses: ["Limited cloud experience"]
  },
  
  // CV Summary (text format for agent)
  cv_summary: `CV Analysis Summary:

Overall: Strong candidate with 5 years...

Fit for Position: Excellent match...

Strengths:
1. 5 years experience in backend development
2. Leadership and team management skills

Areas for Improvement:
1. Limited experience with cloud platforms
`,
  
  // Alias for backward compatibility
  cv_analysis: { /* same as cvAnalysis */ }
}
```

## Benefits

### 1. **Fresh Metadata Every Time**
- Each room creation sends complete, up-to-date metadata
- No stale data from previous sessions

### 2. **Multiple Submissions Supported**
- User can submit multiple times
- Each time creates a completely fresh interview session
- No conflicts with existing rooms

### 3. **Agent Receives Complete Context**
- `candidateName` ✅
- `jobName` ✅  
- `companyName` ✅
- `companySpelling` ✅
- `interviewLanguage` ✅
- `interviewPrompt` ✅
- `cv_summary` ✅
- `cv_analysis` ✅

### 4. **Clear Logging**
- Logs when room is deleted
- Logs when new room is created
- Logs metadata being sent (first 200 chars)
- Clear error messages if something fails

## Testing

### Test GraphQL Query
```graphql
query {
  joinInterviewRoom(
    jobId: "YOUR_JOB_ID"
    phone: "YOUR_PHONE"
    participantName: "Test User"
  ) {
    success
    token
    roomName
    liveKitUrl
    error
  }
}
```

### Expected Backend Logs
```
🔍 Found existing room: interview_..., deleting it completely...
🗑️ Deleted existing room: interview_...
🏗️ Creating NEW LiveKit room: interview_...
📋 Metadata size: 1234 characters
📦 Full Metadata being sent to LiveKit:
{
  "candidateName": "John Doe",
  "jobName": "Senior Developer",
  ...
}
✅ NEW LiveKit room created: interview_... with fresh metadata
🔍 Room metadata stored on LiveKit server (1234 chars): {"candidateName":"John Doe",...
```

### Expected Agent Logs
```
🔍 RAW ROOM METADATA: {"candidateName":"John Doe","jobName":"Senior Developer",...}
🔍 EXTRACTED METADATA: {'candidateName': 'John Doe', 'jobName': 'Senior Developer', ...}
Candidate: John Doe
Job: Senior Developer
Company: Tech Corp
Language: english
Backend Prompt: Yes
```

## Important Notes

1. **500ms Wait**: Added delay after room deletion to ensure LiveKit fully processes the deletion before creating new room

2. **Error Handling**: If room deletion fails, continue anyway and try to create the room (might fail if room still exists)

3. **Database Update**: Still update our database with the metadata for consistency and future reference

4. **Token Duration**: 2 hours (7200 seconds) for interview sessions

## Troubleshooting

### If Agent Still Receives Empty Metadata

1. **Check Backend Logs**: Look for the logs above to confirm metadata is being sent

2. **Check LiveKit Dashboard**: Verify the room has metadata in the LiveKit Cloud dashboard

3. **Check Timing**: Ensure the agent connects AFTER the room is created with metadata

4. **Check Room Name**: Verify the agent is joining the correct room name

### If Room Creation Fails

1. **Check LiveKit Credentials**: Verify `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`

2. **Check Network**: Ensure backend can reach LiveKit server

3. **Check Logs**: Look for `❌ CRITICAL: LiveKit room creation FAILED` message

4. **Manual Cleanup**: If needed, manually delete stuck rooms from LiveKit dashboard

## Next Steps

- Monitor logs for successful metadata transmission
- Verify agent receives all expected fields
- Test multiple submission scenarios
- Consider adding retry logic for room deletion failures
