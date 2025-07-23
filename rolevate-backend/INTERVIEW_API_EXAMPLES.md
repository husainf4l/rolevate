# Interview API for Existing Rooms - Curl Examples

These endpoints work with rooms that are already created via the room controller.

## 🎥 Save Video Link to Existing Room

```bash
curl -X POST http://localhost:4005/api/interviews/room/interview_abc123/save-video \
  -H "Content-Type: application/json" \
  -d '{
    "videoLink": "https://meet.example.com/room123",
    "recordingUrl": "https://recordings.example.com/interview123.mp4",
    "jobId": "job_xyz789",
    "candidateId": "candidate_def456",
    "companyId": "company_ghi123",
    "title": "Frontend Developer Interview"
  }' \
  -v
```

## 📝 Add Single Transcript to Room

```bash
curl -X POST http://localhost:4005/api/interviews/room/interview_abc123/transcripts \
  -H "Content-Type: application/json" \
  -d '{
    "speakerType": "INTERVIEWER",
    "speakerName": "Jane Smith",
    "content": "Can you tell me about your experience with React?",
    "startTime": 30.5,
    "endTime": 35.2,
    "duration": 4.7,
    "sequenceNumber": 1,
    "confidence": 0.98,
    "sentiment": "NEUTRAL"
  }' \
  -v
```

## 📝 Add Bulk Transcripts to Room

```bash
curl -X POST http://localhost:4005/api/interviews/room/interview_abc123/transcripts/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "transcripts": [
      {
        "speakerType": "INTERVIEWER",
        "speakerName": "Jane Smith",
        "content": "Hello! Thank you for joining us today.",
        "startTime": 0.0,
        "endTime": 3.5,
        "duration": 3.5,
        "sequenceNumber": 1,
        "confidence": 0.99,
        "sentiment": "POSITIVE"
      },
      {
        "speakerType": "CANDIDATE",
        "speakerName": "John Doe",
        "content": "Thank you for having me. I am excited about this opportunity.",
        "startTime": 4.0,
        "endTime": 8.2,
        "duration": 4.2,
        "sequenceNumber": 2,
        "confidence": 0.96,
        "sentiment": "POSITIVE",
        "keywords": ["excited", "opportunity"]
      },
      {
        "speakerType": "INTERVIEWER",
        "speakerName": "Jane Smith",
        "content": "Can you walk me through your experience with JavaScript frameworks?",
        "startTime": 9.0,
        "endTime": 13.8,
        "duration": 4.8,
        "sequenceNumber": 3,
        "confidence": 0.97,
        "sentiment": "NEUTRAL",
        "keywords": ["JavaScript", "frameworks", "experience"]
      }
    ]
  }' \
  -v
```

## 🔍 Get Interview by Room ID

```bash
curl -X GET http://localhost:4005/api/interviews/room/interview_abc123 \
  -v
```

## 📋 Get All Transcripts for Room

```bash
curl -X GET http://localhost:4005/api/interviews/room/interview_abc123/transcripts \
  -v
```

## ✅ Complete Interview

```bash
curl -X POST http://localhost:4005/api/interviews/room/interview_abc123/complete \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 1800,
    "interviewerNotes": "Candidate demonstrated strong technical skills and good communication.",
    "overallRating": 4,
    "aiScore": 87.5,
    "aiRecommendation": "Recommend for next round. Strong technical background with React and Node.js."
  }' \
  -v
```

## 📊 Expected Response Format

### Interview Response:

```json
{
  "id": "interview_123",
  "jobId": "job_xyz789",
  "candidateId": "candidate_def456",
  "companyId": "company_ghi123",
  "title": "Frontend Developer Interview",
  "type": "FIRST_ROUND",
  "status": "COMPLETED",
  "scheduledAt": "2025-07-21T14:00:00Z",
  "startedAt": "2025-07-21T14:05:00Z",
  "endedAt": "2025-07-21T15:35:00Z",
  "duration": 1800,
  "roomId": "interview_abc123",
  "videoLink": "https://meet.example.com/room123",
  "recordingUrl": "https://recordings.example.com/interview123.mp4",
  "aiScore": 87.5,
  "overallRating": 4,
  "transcriptCount": 25
}
```

### Transcript Response:

```json
{
  "id": "transcript_456",
  "interviewId": "interview_123",
  "speakerType": "CANDIDATE",
  "speakerName": "John Doe",
  "content": "I have been working with React for over 3 years...",
  "startTime": 45.2,
  "endTime": 52.8,
  "duration": 7.6,
  "sequenceNumber": 5,
  "confidence": 0.96,
  "sentiment": "POSITIVE",
  "keywords": ["React", "3 years", "experience"],
  "importance": 3
}
```

## 🔄 Typical Workflow:

1. **Room Already Created** - Room exists from room controller
2. **Save Video Link** - POST `/room/{roomId}/save-video` with job/candidate info
3. **Add Transcripts** - POST `/room/{roomId}/transcripts` or `/transcripts/bulk`
4. **Complete Interview** - POST `/room/{roomId}/complete` with final notes
5. **Retrieve Data** - GET endpoints to fetch interview and transcripts

## 🚀 Perfect for FastAPI Integration:

- No authentication required
- Simple REST endpoints
- Works with existing room infrastructure
- Bulk operations for efficiency
- Real-time transcript storage
