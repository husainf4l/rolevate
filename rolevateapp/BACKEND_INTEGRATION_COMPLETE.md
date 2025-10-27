# Backend Integration Guide

## Overview
The Flutter app now supports both **mock mode** (offline) and **real backend** (GraphQL API) for interview management. The implementation matches the web frontend architecture.

---

## 🔧 Current Status

### ✅ Implemented
- **Dual-mode support**: Automatically falls back to mock data if backend unavailable
- **GraphQL queries/mutations**: Match the backend schema exactly
- **Interview scheduling**: Compatible with backend `createInterview` mutation
- **LiveKit room creation**: Supports `createInterviewRoom` mutation for video interviews
- **Status updates**: Complete/Cancel/NoShow operations
- **Authentication ready**: JWT token support in headers

### 🎯 Backend Endpoints Integrated

#### Mutations
```graphql
# Schedule interview
createInterview(input: CreateInterviewInput!): Interview!

# Create LiveKit room for video interview
createInterviewRoom(createRoomInput: CreateRoomInput!): CreateRoomResponse!

# Status updates
completeInterview(id: ID!): Interview!
cancelInterview(id: ID!, reason: String): Interview!
markInterviewNoShow(id: ID!): Interview!
updateInterview(id: ID!, input: UpdateInterviewInput!): Interview!
```

#### Queries
```graphql
# Get all interviews for an application
interviewsByApplication(applicationId: ID!): [Interview!]!

# Get single interview
interview(id: ID!): Interview

# Get interviews by interviewer
interviewsByInterviewer(interviewerId: ID!): [Interview!]!
```

---

## 🚀 How to Enable Backend

### Step 1: Ensure GraphQL Package is Added
Already added in `pubspec.yaml`:
```yaml
dependencies:
  graphql_flutter: ^5.1.2
```

### Step 2: Initialize GraphQL in main.dart

```dart
import 'package:rolevateapp/core/graphql_client.dart';
import 'package:rolevateapp/services/interview_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize GetStorage
  await GetStorage.init();
  
  // Initialize GraphQL with Hive
  await GraphQLClientConfig.initializeGraphQL();
  
  // Create GraphQL client
  final graphqlClient = GraphQLClientConfig.createClient();
  
  // Initialize InterviewService with backend
  final interviewService = InterviewService();
  interviewService.initializeWithBackend(graphqlClient);
  
  runApp(MyApp());
}
```

### Step 3: Configure Backend Endpoint

**For Development (Local Backend)**:
```dart
// In main.dart or a config file
GraphQLClientConfig.useLocalEndpoint();
// Uses: http://localhost:4005/api/graphql
```

**For Production**:
```dart
GraphQLClientConfig.useProductionEndpoint();
// Uses: https://rolevate.com/api/graphql
```

### Step 4: Authentication

The GraphQL client automatically includes JWT tokens from storage:

```dart
// After successful login, store token
final storage = GetStorage();
await storage.write('access_token', jwtToken);

// Token is automatically included in all GraphQL requests
// Header: Authorization: Bearer {token}
```

---

## 📊 Data Flow Comparison

### Web Frontend (Next.js)
```
User Action
    ↓
Apollo Client (GraphQL)
    ↓
Backend GraphQL API
    ↓
PostgreSQL Database
```

### Flutter App (Now)
```
User Action
    ↓
InterviewService
    ├─→ Mock Mode (GetStorage)
    └─→ Backend Mode (GraphQL)
            ↓
        Backend GraphQL API
            ↓
        PostgreSQL Database
```

---

## 🔄 Switching Between Mock and Backend

### Option 1: Manual Toggle
```dart
final interviewService = InterviewService();

// Use backend
interviewService.initializeWithBackend(graphqlClient);

// Switch to mock mode
interviewService.useMockMode();
```

### Option 2: Automatic Fallback (Recommended)
The service automatically tries backend first and falls back to mock if:
- Backend is unreachable
- Network error occurs
- Authentication fails

---

## 🎬 Interview Scheduling Flow

### Current Implementation (Matches Web)

**Employer Schedules Interview**:
```dart
final interview = await interviewService.scheduleInterview(
  applicationId: 'app-123',
  employerId: 'employer-456',
  scheduledAt: DateTime(2025, 10, 30, 10, 0),
  duration: 45,
  type: InterviewType.video,
  notes: 'Technical round - React focus',
);

// Backend creates:
// 1. Interview record in database
// 2. Returns interview with roomId
// 3. Generates interview link
```

**Candidate Joins Interview**:
```dart
// When candidate clicks "Join Interview"
final roomData = await interviewService.createInterviewRoom(applicationId);

// Backend returns:
// {
//   'roomName': 'room_abc123',
//   'token': 'livekit_token_xyz...',
//   'serverUrl': 'wss://rolvate-fi6h6rke.livekit.cloud',
//   'message': 'Room created successfully'
// }

// Use token to connect to LiveKit
// (LiveKit integration coming in Phase 3)
```

---

## 🔍 Backend Schema Validation

### Interview Type Enum
Backend expects uppercase:
```dart
// Flutter
InterviewType.video → 'VIDEO'
InterviewType.technical → 'TECHNICAL'
InterviewType.hr → 'HR'

// Already handled in Interview model toJson()
```

### Interview Status Enum
```dart
// Flutter
InterviewStatus.scheduled → 'SCHEDULED'
InterviewStatus.completed → 'COMPLETED'
InterviewStatus.cancelled → 'CANCELLED'
InterviewStatus.noShow → 'NO_SHOW'
```

### Date Format
```dart
// Backend expects ISO 8601
scheduledAt.toIso8601String()
// Example: "2025-10-30T10:00:00.000Z"
```

---

## 🧪 Testing Backend Integration

### 1. Test Connection
```dart
void testBackendConnection() async {
  final client = GraphQLClientConfig.createClient();
  final interviewService = InterviewService();
  interviewService.initializeWithBackend(client);
  
  try {
    // Try to fetch interviews
    final interviews = await interviewService.getInterviewsForApplication('test-app-id');
    print('Backend connected! Found ${interviews.length} interviews');
  } catch (e) {
    print('Backend error: $e');
    print('Falling back to mock mode');
    interviewService.useMockMode();
  }
}
```

### 2. Test Interview Scheduling
```dart
void testScheduleInterview() async {
  final interview = await interviewService.scheduleInterview(
    applicationId: 'real-app-id-from-backend',
    employerId: 'real-employer-id',
    scheduledAt: DateTime.now().add(Duration(days: 2)),
    duration: 45,
    type: InterviewType.video,
  );
  
  print('Interview created: ${interview.id}');
  print('Interview link: ${interview.interviewLink}');
  print('Room ID: ${interview.roomId}');
}
```

### 3. Test Room Creation
```dart
void testCreateRoom() async {
  final roomData = await interviewService.createInterviewRoom('app-id');
  
  print('Room: ${roomData['roomName']}');
  print('Token: ${roomData['token']}');
  print('Server: ${roomData['serverUrl']}');
}
```

---

## 🐛 Error Handling

### Network Errors
```dart
try {
  final interview = await interviewService.scheduleInterview(...);
} catch (e) {
  if (e is OperationException) {
    // GraphQL error
    print('GraphQL Error: ${e.graphqlErrors}');
  } else if (e is NetworkException) {
    // Network error - use mock mode
    interviewService.useMockMode();
    print('Network error, using offline mode');
  }
}
```

### Authentication Errors
```dart
// 401/403 errors mean token is invalid
// Show login screen and refresh token
if (error.message?.contains('Unauthorized') ?? false) {
  Get.offAllNamed('/login');
}
```

---

## 📝 Backend Requirements

### Environment Variables (Backend)
```env
# LiveKit configuration
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_WS_URL=wss://rolvate-fi6h6rke.livekit.cloud

# Database
DATABASE_URL=postgresql://user:pass@host:5432/rolevate

# JWT
JWT_SECRET=your_secret_key
```

### Database Tables
- `interview` - Interview records
- `transcript` - Interview transcripts
- `application` - Job applications
- `user` - Users (candidates and employers)

---

## 🎯 Next Steps

### Phase 1: Enable Backend (Current)
- ✅ GraphQL client configured
- ✅ Interview service supports backend
- ✅ Mutations and queries implemented
- ✅ Authentication ready

### Phase 2: Test Integration
1. Start backend server locally
2. Test interview scheduling
3. Verify data appears in database
4. Test from web dashboard

### Phase 3: Add LiveKit
1. Install `livekit_client` package
2. Create InterviewRoomScreen
3. Use room token from backend
4. Connect to LiveKit server
5. Display video streams

### Phase 4: Production
1. Deploy backend to production
2. Configure production endpoint
3. Test end-to-end flow
4. Enable push notifications

---

## 📚 Code Examples

### Complete Integration Example
```dart
// main.dart
import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'core/graphql_client.dart';
import 'services/interview_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize storage
  await GetStorage.init();
  
  // Initialize GraphQL
  await GraphQLClientConfig.initializeGraphQL();
  
  // For development
  GraphQLClientConfig.useLocalEndpoint();
  
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // Initialize services
    final graphqlClient = GraphQLClientConfig.createClient();
    final interviewService = InterviewService();
    
    // Enable backend mode
    interviewService.initializeWithBackend(graphqlClient);
    
    return GetCupertinoApp(
      title: 'Rolevate',
      home: HomeScreen(),
    );
  }
}
```

### Schedule Interview with Backend
```dart
// In your screen/controller
final interviewService = InterviewService();

Future<void> scheduleInterview() async {
  try {
    final interview = await interviewService.scheduleInterview(
      applicationId: widget.application.id,
      employerId: currentUser.id,
      scheduledAt: selectedDateTime,
      duration: selectedDuration,
      type: selectedType,
      notes: notesController.text,
    );
    
    // Success - show confirmation
    Get.snackbar(
      'Interview Scheduled',
      'Link: ${interview.interviewLink}',
      backgroundColor: CupertinoColors.systemGreen,
      colorText: CupertinoColors.white,
    );
    
    Get.back();
  } catch (e) {
    // Error - show message
    Get.snackbar(
      'Error',
      'Failed to schedule interview: $e',
      backgroundColor: CupertinoColors.destructiveRed,
      colorText: CupertinoColors.white,
    );
  }
}
```

---

## 🔐 Security Considerations

1. **JWT Tokens**: Stored securely in GetStorage
2. **HTTPS Only**: Production endpoint uses HTTPS
3. **Token Refresh**: Implement automatic token refresh
4. **Sensitive Data**: Never log tokens or sensitive info

---

## 📊 Monitoring

### Log Backend Calls
```dart
// In GraphQLClientConfig
final Link link = Link.from([
  LoggingLink(),
  authLink.concat(httpLink),
]);
```

### Track Success Rate
```dart
int backendCallsSucceeded = 0;
int backendCallsFailed = 0;
int mockCallsUsed = 0;

// In InterviewService
void _logSuccess() {
  if (_useBackend) {
    backendCallsSucceeded++;
  } else {
    mockCallsUsed++;
  }
}
```

---

## ✅ Verification Checklist

- [ ] GraphQL client created
- [ ] Interview service initialized with backend
- [ ] Backend endpoint configured
- [ ] JWT token stored after login
- [ ] Schedule interview works
- [ ] Get interviews works
- [ ] Room creation works
- [ ] Data persists in database
- [ ] Appears in web dashboard
- [ ] Error handling works
- [ ] Falls back to mock mode gracefully

---

## 🆘 Troubleshooting

### "Network Error"
- Check backend is running
- Verify endpoint URL
- Check network connectivity

### "Unauthorized"
- JWT token missing or invalid
- Re-login to get fresh token
- Check token expiration

### "GraphQL Error"
- Check mutation/query syntax
- Verify variable types
- Check backend logs

### "Mock Mode Always Used"
- Verify `initializeWithBackend()` called
- Check `_useBackend` flag
- Ensure client not null

---

## 🎉 Summary

The Flutter app is now **backend-ready** with:
- ✅ GraphQL integration matching web frontend
- ✅ All interview operations supported
- ✅ Automatic fallback to mock mode
- ✅ Authentication configured
- ✅ LiveKit room creation ready

**To enable**: Just call `initializeWithBackend()` in `main.dart` and the app will start using the real backend!
