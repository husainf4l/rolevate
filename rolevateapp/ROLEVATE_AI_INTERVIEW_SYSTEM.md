# Rolevate AI Interview System

## Overview
The Rolevate AI Interview System is now integrated into the app, replacing external video conferencing links (Zoom, Teams, etc.) with an internal AI-powered interview platform.

## What Was Implemented

### 1. Enhanced Interview Model (`lib/models/interview.dart`)
Added Rolevate AI-specific fields to the Interview model:
- `interviewLink`: Unique Rolevate interview URL (e.g., `https://rolevate.com/interview/{id}`)
- `aiAgentId`: Identifier for the AI agent conducting the interview
- `interviewQuestions`: AI-generated interview questions
- `candidateResponses`: Candidate answers recorded during interview
- `aiScore`: AI-evaluated score (0-100)
- `aiRecommendation`: AI recommendation for the employer
- `startedAt`: When the interview actually started
- `completedAt`: When the interview was completed

### 2. Interview Service (`lib/services/interview_service.dart`)
Created a comprehensive service for managing AI interviews with:

#### Core Features:
- **Schedule Interview**: Create new AI-powered interviews with automatic link generation
- **Interview Management**: Get, update, cancel, and reschedule interviews
- **AI Analysis**: Add AI-generated analysis after interview completion
- **Access Control**: 5-minute window before scheduled time for candidates to join
- **Statistics**: Track interview metrics for employers

#### Key Methods:
```dart
// Schedule a new Rolevate AI interview
Future<Interview> scheduleInterview({
  required String applicationId,
  required String employerId,
  required DateTime scheduledAt,
  int duration = 45,
  InterviewType type = InterviewType.video,
  String? notes,
})

// Get interviews for an application
Future<List<Interview>> getInterviewsForApplication(String applicationId)

// Update interview status
Future<Interview> updateInterviewStatus(
  String interviewId,
  InterviewStatus newStatus,
  {DateTime? startedAt, DateTime? completedAt}
)

// Add AI analysis after completion
Future<Interview> addAiAnalysis(
  String interviewId, {
  required Map<String, dynamic> aiAnalysis,
  required double aiScore,
  required String aiRecommendation,
  Map<String, dynamic>? candidateResponses,
})

// Check if candidate can join (5 min before scheduled time)
bool canJoinInterview(Interview interview)

// Get interview statistics for employer
Future<Map<String, dynamic>> getInterviewStatistics(String employerId)
```

### 3. Enhanced Schedule Interview Screen (`lib/screens/business/schedule_interview_screen.dart`)
Updated the UI to reflect the Rolevate AI system:

#### New Features:
- **Rolevate AI Badge**: Prominent display showing interview is AI-powered
- **Interview Type Selector**: Choose between Video, Technical, or HR interviews
- **Duration Picker**: Select interview duration (15, 30, 45, 60, 90, or 120 minutes)
- **Date & Time Pickers**: Select when the interview should occur
- **Notes Field**: Add special instructions for the AI agent
- **Auto-generated Links**: No manual link entry - system generates Rolevate links automatically

#### User Experience:
1. Employer selects candidate from applications list
2. Chooses interview type, date, time, and duration
3. Adds optional notes for the AI agent
4. Clicks "Schedule Interview"
5. System generates unique Rolevate interview link
6. Candidate receives email with link automatically
7. Success message shows the generated interview link

### 4. Persistent Storage
Interviews are stored using GetStorage with key: `'mock_interviews'`
- Survives app restarts
- Mock data simulates backend functionality
- Ready for backend integration

## Interview Workflow

### For Employers:
1. **View Applications**: Browse submitted applications
2. **Select Candidate**: Choose a candidate to interview
3. **Schedule Interview**: Pick date, time, type, and duration
4. **Automatic Notification**: Candidate receives Rolevate interview link via email
5. **View Upcoming**: See all scheduled interviews
6. **Review Analysis**: After interview, view AI-generated analysis and scores
7. **Make Decision**: Use AI insights to make hiring decisions

### For Candidates:
1. **Apply for Job**: Submit application
2. **Receive Invitation**: Get email with Rolevate interview link
3. **Join Interview**: Click link 5 minutes before scheduled time
4. **AI Interview**: AI agent conducts the interview
5. **Automatic Analysis**: AI evaluates responses in real-time
6. **Wait for Decision**: Employer reviews AI analysis and decides

## Interview Types

### Video Interview
Standard video interview with AI agent
- Visual and audio interaction
- Screen sharing capabilities
- Real-time question generation

### Technical Interview
Code-focused technical assessment
- Coding challenges
- Algorithm questions
- Technical problem-solving

### HR Interview
Behavioral and culture-fit assessment
- Situational questions
- Team compatibility
- Company values alignment

## Data Persistence

All interviews are saved to device storage using GetStorage:
- **Key**: `'mock_interviews'`
- **Format**: JSON array of interview objects
- **Persistence**: Survives app restarts and hot reloads

## Integration Points

### Current Integration:
- ✅ Applications Screen: "Schedule Interview" button navigates to scheduling screen
- ✅ Interview Model: Complete with AI-specific fields
- ✅ Interview Service: Full CRUD operations for interviews
- ✅ Schedule Screen: Enhanced UI for Rolevate AI interviews
- ✅ GetStorage: Persistent local storage

### Future Backend Integration:
When backend API is available, update these methods in `InterviewService`:
1. `scheduleInterview()` - POST to `/api/interviews`
2. `getInterviewById()` - GET from `/api/interviews/{id}`
3. `updateInterviewStatus()` - PATCH to `/api/interviews/{id}/status`
4. `addAiAnalysis()` - POST to `/api/interviews/{id}/analysis`
5. Email notifications - Trigger backend email service

## Configuration

### Dependencies Added:
```yaml
uuid: ^4.5.1  # For generating unique interview IDs
```

### Required Packages (Already Present):
- `get_storage`: ^2.1.1
- `get`: ^4.6.6
- Flutter Cupertino widgets

## Interview Link Format

Generated interview links follow this pattern:
```
https://rolevate.com/interview/{interview_id}
```

Example:
```
https://rolevate.com/interview/a3f2c5b7-8d9e-4f1a-b2c3-d4e5f6a7b8c9
```

## AI Agent Integration

Each interview is assigned a unique AI agent:
- **Agent ID Format**: `ai_agent_{8_char_uuid}`
- **Example**: `ai_agent_a3f2c5b7`

The AI agent:
1. Generates interview questions based on job requirements
2. Conducts the interview via video
3. Records and analyzes responses
4. Calculates competency scores
5. Provides hiring recommendations

## Statistics & Analytics

Employers can track:
- Total interviews conducted
- Scheduled vs completed interviews
- Cancellation rates
- No-show rates
- Average AI scores
- Interview success metrics

## Security Features

- Interview links are unique and non-guessable (UUID-based)
- 5-minute join window prevents early/late access
- Interview status tracking prevents unauthorized access
- Candidate can only join their own interviews

## Testing

To test the system:
1. Create a job posting
2. Add mock applications
3. Navigate to Applications → Select candidate
4. Click "Schedule Interview"
5. Fill in interview details
6. Submit and verify:
   - Interview link generated
   - Success message displayed
   - Interview saved to storage

## Next Steps

To complete the interview system:
1. **Candidate Interview View**: Create screen for candidates to join interviews
2. **Interview Room**: Build real-time video interview interface
3. **AI Agent Integration**: Connect to AI service for question generation
4. **Recording**: Implement interview recording functionality
5. **Analysis Dashboard**: Display AI analysis to employers
6. **Email Notifications**: Integrate email service for candidate notifications
7. **Backend API**: Replace mock service with real API calls

## Benefits

### For Employers:
- ✅ No external platforms needed (no Zoom accounts)
- ✅ Consistent interview experience
- ✅ AI-powered candidate evaluation
- ✅ Automated scheduling and notifications
- ✅ Detailed analytics and insights
- ✅ Time savings with automated analysis

### For Candidates:
- ✅ Simple one-click join process
- ✅ No account creation required
- ✅ Consistent interview format
- ✅ Fair AI-based evaluation
- ✅ Professional interview experience

## Architecture Notes

The system is designed with clean architecture principles:
- **Models**: Define data structures (Interview model)
- **Services**: Handle business logic (InterviewService)
- **Screens**: Present UI and handle user interaction
- **Storage**: GetStorage for persistence (ready for backend swap)

This separation makes it easy to:
- Replace mock data with real API calls
- Add new interview features
- Test individual components
- Scale the system as needed
