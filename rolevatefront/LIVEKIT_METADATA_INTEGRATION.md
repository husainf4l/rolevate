# 🎯 LiveKit Room Metadata Integration

## ✅ **Metadata Flow Implementation**

### **1. Backend Response with Metadata:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "serverUrl": "wss://rolvate2-ckmk80qb.livekit.cloud",
  "participantToken": "eyJhbGciOiJIUzI1NiJ9...",
  "roomName": "interview_306BFCCD_1749695243750",
  "identity": "candidate_966509876543_1749695890181",
  "roomCode": "306BFCCD_3750",
  "participantName": "Candidate",
  "jobTitle": "Senior Backend Developer - Fintech",
  "companyName": "MENA Bank",
  "instructions": "Welcome to your interview...",
  "maxDuration": 1800,
  "interviewId": "c6aec8f5-592b-4b90-b7fd-a6a6404b31f9",
  "candidateId": "59faa4e3-4814-41ef-b830-a58c7ba7ae25",
  "applicationId": "1e526d64-f4e5-4353-a69f-9642959e8236",
  "jobPostId": "306bfccd-5030-46bb-b468-e5027a073b4a",
  "status": "READY_TO_JOIN"
}
```

### **2. Frontend Sends Metadata to LiveKit Room:**
When the user clicks "Start Interview", the frontend:

1. **Connects to LiveKit room** with the provided token
2. **Enables microphone** 
3. **Publishes metadata** to the room as a data message

```typescript
// Metadata sent to LiveKit room
const metadata = {
  interviewId: "c6aec8f5-592b-4b90-b7fd-a6a6404b31f9",
  candidateId: "59faa4e3-4814-41ef-b830-a58c7ba7ae25", 
  applicationId: "1e526d64-f4e5-4353-a69f-9642959e8236",
  jobPostId: "306bfccd-5030-46bb-b468-e5027a073b4a",
  jobTitle: "Senior Backend Developer - Fintech",
  companyName: "MENA Bank",
  participantName: "Candidate",
  instructions: "Welcome to your interview...",
  maxDuration: 1800,
  status: "READY_TO_JOIN"
};

// Published as data message with topic "interview-metadata"
await room.localParticipant.publishData(
  encoder.encode(JSON.stringify(metadata)), 
  { reliable: true, topic: "interview-metadata" }
);
```

## 🚀 **How AI Agent Receives Metadata**

### **LiveKit Data Message:**
- **Topic:** `"interview-metadata"`
- **Format:** JSON string
- **Delivery:** Reliable (guaranteed delivery)
- **Timing:** Sent immediately after room connection

### **AI Agent Implementation:**
Your AI agent should listen for data messages with the topic `"interview-metadata"`:

```python
# Python example for AI agent
async def on_data_received(data: rtc.DataPacket):
    if data.topic == "interview-metadata":
        metadata = json.loads(data.data.decode('utf-8'))
        
        # Now AI agent has access to:
        interview_id = metadata['interviewId']
        candidate_id = metadata['candidateId']
        application_id = metadata['applicationId']
        job_post_id = metadata['jobPostId']
        job_title = metadata['jobTitle']
        company_name = metadata['companyName']
        instructions = metadata['instructions']
        max_duration = metadata['maxDuration']
        
        # Use this data for personalized interview
        print(f"Starting interview for {job_title} at {company_name}")
        print(f"Instructions: {instructions}")
```

## 🎯 **Benefits for AI Agent**

### **Personalized Interview:**
- ✅ **Job-Specific Questions:** AI knows the exact job title and requirements
- ✅ **Company Context:** AI can reference the specific company
- ✅ **Custom Instructions:** AI follows the specific interview guidelines
- ✅ **Time Management:** AI knows the maximum duration allowed

### **Database Integration:**
- ✅ **Interview Tracking:** AI can update interview status using `interviewId`
- ✅ **Candidate Management:** AI can save responses using `candidateId`
- ✅ **Application Workflow:** AI can update application status using `applicationId`

### **Real-time Analytics:**
- ✅ **Session Monitoring:** Track interview progress in real-time
- ✅ **Performance Metrics:** Measure interview duration and completion rates
- ✅ **Quality Assurance:** Ensure interviews follow company guidelines

## 🔧 **Implementation Status**

### **✅ Frontend Complete:**
- Interview metadata extracted from backend response
- Metadata published to LiveKit room on interview start
- All database IDs and context available to AI agent

### **⭐ AI Agent Integration:**
Your AI agent should implement data message handling to receive:
- `interviewId` for database tracking
- `candidateId` for response storage  
- `applicationId` for workflow updates
- `jobPostId` for job-specific context
- `jobTitle`, `companyName`, `instructions` for personalization

## 🎉 **Perfect Integration!**

The frontend now provides complete context to your AI interviewer, enabling:
- **Personalized interviews** based on job requirements
- **Real-time database tracking** of interview progress
- **Company-specific** interview guidelines
- **Seamless integration** with your backend systems

Your AI agent will have all the context it needs to conduct effective, personalized interviews! 🚀
