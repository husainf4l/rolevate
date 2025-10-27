# Rolevate Architecture Analysis

## Overview
Based on analysis of the **rolevatev6** (Next.js frontend) and **rolevateapp** (Flutter mobile app), here's the comprehensive architecture and integration strategy.

---

## 🏗️ Architecture Components

### 1. Frontend Web (rolevatev6)
- **Framework**: Next.js 15.5.5 with React 19
- **Styling**: Tailwind CSS 4
- **State Management**: React hooks (useState, useEffect)
- **Data Fetching**: Apollo Client for GraphQL
- **Video Interviews**: LiveKit integration
- **UI Components**: Radix UI, Heroicons, Lucide React

### 2. Mobile App (rolevateapp)
- **Framework**: Flutter/Dart
- **State Management**: GetX
- **UI Design**: Cupertino (iOS-style)
- **Local Storage**: GetStorage
- **Data**: Currently using mock data with plans for GraphQL integration

### 3. Backend (rolevate-backendgql)
- **GraphQL API**: Located at `/api/graphql`
- **Authentication**: JWT tokens stored in localStorage
- **Endpoints**: 
  - GraphQL: `${API_BASE_URL}/graphql`
  - Uploads: `http://localhost:4005/api/uploads`

---

## 🔗 API Integration Points

### Current Web Frontend (rolevatev6)

#### GraphQL Endpoint
```typescript
// src/lib/apollo.ts
const httpLink = new HttpLink({
  uri: `${API_CONFIG.API_BASE_URL}/graphql`,
  credentials: 'include',
});
```

#### Interview System
The web uses **LiveKit** for real-time video interviews:

```typescript
// Room creation mutation
mutation CreateInterviewRoom($createRoomInput: CreateRoomInput!) {
  createInterviewRoom(createRoomInput: $createRoomInput) {
    roomName
    token
    message
  }
}
```

**Interview Flow (Web)**:
1. Candidate clicks interview link with `?applicationId={id}`
2. Frontend calls `createInterviewRoom` mutation
3. Backend returns LiveKit room token
4. Frontend connects to LiveKit server: `wss://rolvate-fi6h6rke.livekit.cloud`
5. AI agent joins room and conducts interview
6. Transcripts stored in database

---

## 📊 Data Models Comparison

### Interview Model

#### Web Frontend (rolevatev6)
```typescript
interface Interview {
  id: string;
  application: {
    id: string;
    candidate: { id, name, email };
    job: { id, title, company: { name } };
  };
  interviewer: { id, name, email };
  scheduledAt: string;
  duration?: number;
  type: string;
  status: string;
  notes?: string;
  feedback?: string;
  rating?: number;
  aiAnalysis?: any;
  recordingUrl?: string;
  roomId?: string;
  transcripts: InterviewTranscript[];
  createdAt: string;
  updatedAt: string;
}
```

#### Flutter App (Current Implementation)
```dart
class Interview {
  final String id;
  final String applicationId;
  final String? interviewerId;
  final DateTime scheduledAt;
  final int? duration;
  final InterviewType type;
  final InterviewStatus status;
  final String? notes;
  final String? feedback;
  final double? rating;
  final Map<String, dynamic>? aiAnalysis;
  final String? recordingUrl;
  final String? roomId;
  
  // Rolevate AI specific
  final String? interviewLink;
  final String? aiAgentId;
  final Map<String, dynamic>? interviewQuestions;
  final Map<String, dynamic>? candidateResponses;
  final double? aiScore;
  final String? aiRecommendation;
  final DateTime? startedAt;
  final DateTime? completedAt;
  
  final DateTime createdAt;
  final DateTime updatedAt;
}
```

**Key Differences**:
- Web uses LiveKit for real-time video
- Web stores transcripts separately
- Flutter adds AI-specific fields (aiAgentId, interviewLink)
- Both track similar core fields

---

## 🎯 Interview System Comparison

### Web Frontend (Next.js)

**Features**:
- ✅ Real-time video interviews via LiveKit
- ✅ AI agent joins as participant
- ✅ Transcript recording and storage
- ✅ Pre-room setup (camera/mic test)
- ✅ Audio visualization
- ✅ Chat transcript display
- ✅ Connection management with retry logic

**Key Components**:
- `src/app/room/page.tsx` - Main interview room
- `src/app/room/components/SessionView.tsx` - Interview UI
- `src/app/room/components/PreRoomSetup.tsx` - Pre-join setup
- `src/app/room/components/VideoPanel.tsx` - Video display
- `src/app/room/components/AudioVisualization.tsx` - Audio feedback

**Integration**:
```typescript
// Join interview with applicationId
const url = `/room?applicationId={applicationId}`

// Backend creates room and returns token
const { data } = await apolloClient.mutate({
  mutation: CREATE_INTERVIEW_ROOM,
  variables: { createRoomInput: { applicationId } }
});

// Connect to LiveKit
<LiveKitRoom
  token={roomToken}
  serverUrl="wss://rolvate-fi6h6rke.livekit.cloud"
  connect={true}
  audio={true}
  video={true}
/>
```

### Flutter App (Current)

**Features**:
- ✅ Interview scheduling UI
- ✅ Interview type selection (Video, Technical, HR)
- ✅ Date/time picker
- ✅ Duration selection (15-120 minutes)
- ✅ Notes field
- ✅ Persistent storage (GetStorage)
- ❌ No video implementation yet
- ❌ Mock data only (no backend integration)

**What's Missing**:
- LiveKit integration
- Video interview UI
- Real-time communication
- Backend API calls
- Transcript recording

---

## 🔄 Integration Strategy for Flutter App

### Phase 1: GraphQL Integration ✅ READY

Replace mock InterviewService with real GraphQL calls:

```dart
// lib/services/interview_service.dart
import 'package:graphql_flutter/graphql_flutter.dart';

class InterviewService {
  final GraphQLClient _client;
  
  // Schedule interview mutation
  Future<Interview> scheduleInterview({
    required String applicationId,
    required DateTime scheduledAt,
    int duration = 45,
    InterviewType type = InterviewType.video,
    String? notes,
  }) async {
    const mutation = '''
      mutation ScheduleInterview(\$input: ScheduleInterviewInput!) {
        scheduleInterview(input: \$input) {
          id
          applicationId
          scheduledAt
          duration
          type
          status
          notes
          interviewLink
          roomId
          createdAt
          updatedAt
        }
      }
    ''';
    
    final result = await _client.mutate(
      MutationOptions(
        document: gql(mutation),
        variables: {
          'input': {
            'applicationId': applicationId,
            'scheduledAt': scheduledAt.toIso8601String(),
            'duration': duration,
            'type': type.name.toUpperCase(),
            'notes': notes,
          }
        },
      ),
    );
    
    if (result.hasException) throw result.exception!;
    return Interview.fromJson(result.data!['scheduleInterview']);
  }
  
  // Get interviews for application
  Future<List<Interview>> getInterviewsForApplication(String applicationId) async {
    const query = '''
      query GetInterviews(\$applicationId: ID!) {
        interviewsByApplication(applicationId: \$applicationId) {
          id
          scheduledAt
          duration
          type
          status
          notes
          feedback
          rating
          aiAnalysis
          recordingUrl
          roomId
          interviewLink
          createdAt
          updatedAt
        }
      }
    ''';
    
    final result = await _client.query(
      QueryOptions(
        document: gql(query),
        variables: {'applicationId': applicationId},
      ),
    );
    
    if (result.hasException) throw result.exception!;
    final interviews = result.data!['interviewsByApplication'] as List;
    return interviews.map((json) => Interview.fromJson(json)).toList();
  }
}
```

### Phase 2: LiveKit Integration for Mobile

Add LiveKit SDK to Flutter:

```yaml
# pubspec.yaml
dependencies:
  livekit_client: ^2.2.0
```

**Create Interview Room Screen**:
```dart
// lib/screens/interview/interview_room_screen.dart
import 'package:flutter/cupertino.dart';
import 'package:livekit_client/livekit_client.dart';

class InterviewRoomScreen extends StatefulWidget {
  final String applicationId;
  
  @override
  State<InterviewRoomScreen> createState() => _InterviewRoomScreenState();
}

class _InterviewRoomScreenState extends State<InterviewRoomScreen> {
  Room? _room;
  bool _isConnecting = false;
  String? _error;
  
  @override
  void initState() {
    super.initState();
    _connectToRoom();
  }
  
  Future<void> _connectToRoom() async {
    setState(() => _isConnecting = true);
    
    try {
      // Call GraphQL mutation to create room
      final roomData = await _createInterviewRoom(widget.applicationId);
      
      // Connect to LiveKit
      _room = await LiveKitClient.connect(
        roomData.serverUrl,
        roomData.token,
        roomOptions: RoomOptions(
          defaultVideoPublishOptions: VideoPublishOptions(
            encoding: VideoEncoding.h540,
          ),
        ),
      );
      
      setState(() => _isConnecting = false);
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isConnecting = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (_isConnecting) {
      return CupertinoPageScaffold(
        child: Center(child: CupertinoActivityIndicator()),
      );
    }
    
    if (_error != null) {
      return CupertinoPageScaffold(
        child: Center(child: Text('Error: $_error')),
      );
    }
    
    // Build video interview UI
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: Text('Interview'),
      ),
      child: Stack(
        children: [
          // Remote participant video (AI agent)
          _buildRemoteVideo(),
          
          // Local participant video (candidate)
          Positioned(
            top: 16,
            right: 16,
            child: _buildLocalVideo(),
          ),
          
          // Controls
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: _buildControls(),
          ),
        ],
      ),
    );
  }
}
```

### Phase 3: Interview Link Flow

**Candidate Journey**:
1. Apply for job via Flutter app
2. Employer schedules interview (creates room via GraphQL)
3. Backend returns interview link: `https://rolevate.com/interview/{id}`
4. Candidate receives push notification
5. Opens link → Deep link to Flutter app
6. App navigates to `/room?applicationId={id}`
7. Calls `createInterviewRoom` mutation
8. Receives LiveKit token
9. Connects to room and starts interview

**Deep Link Configuration**:
```yaml
# android/app/src/main/AndroidManifest.xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data
    android:scheme="https"
    android:host="rolevate.com"
    android:pathPrefix="/interview" />
</intent-filter>
```

```dart
// lib/main.dart
void main() {
  runApp(MyApp());
  
  // Handle deep links
  getInitialLink().then((String? link) {
    if (link != null) _handleDeepLink(link);
  });
}

void _handleDeepLink(String link) {
  final uri = Uri.parse(link);
  if (uri.path.startsWith('/interview/')) {
    final interviewId = uri.pathSegments.last;
    Get.toNamed('/interview-room', parameters: {'id': interviewId});
  }
}
```

---

## 🎨 UI/UX Consistency

### Design Patterns

**Web (Next.js)**:
- Tailwind CSS utility classes
- Radix UI components
- Shadcn/ui design system
- Modern, clean interface
- Blue primary color (#0fc4b5)

**Mobile (Flutter)**:
- Cupertino design (iOS-style)
- Custom blue theme (CupertinoColors.systemBlue)
- GetX navigation
- Cards and sections
- White text on blue buttons

**Recommendations**:
- Keep Cupertino design for iOS feel
- Match color scheme: Use #0fc4b5 as primary
- Maintain similar card layouts
- Use consistent terminology

---

## 🔐 Authentication Flow

### Web Frontend
```typescript
// src/lib/apollo.ts
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('access_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});
```

### Flutter App (To Implement)
```dart
// lib/services/auth_service.dart
class AuthService {
  Future<String?> getAccessToken() async {
    return await _storage.read('access_token');
  }
  
  Future<void> setAccessToken(String token) async {
    await _storage.write('access_token', token);
  }
}

// lib/services/graphql_client.dart
final HttpLink httpLink = HttpLink('https://rolevate.com/api/graphql');

final AuthLink authLink = AuthLink(
  getToken: () async => 'Bearer ${await AuthService().getAccessToken()}',
);

final Link link = authLink.concat(httpLink);

final GraphQLClient client = GraphQLClient(
  cache: GraphQLCache(),
  link: link,
);
```

---

## 📝 Backend GraphQL Schema (Expected)

Based on web implementation, the backend likely has:

```graphql
type Interview {
  id: ID!
  application: Application!
  interviewer: User!
  scheduledAt: DateTime!
  duration: Int
  type: InterviewType!
  status: InterviewStatus!
  notes: String
  feedback: String
  rating: Float
  aiAnalysis: JSON
  recordingUrl: String
  roomId: String
  transcripts: [InterviewTranscript!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum InterviewType {
  VIDEO
  PHONE
  IN_PERSON
  TECHNICAL
  HR
}

enum InterviewStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

input ScheduleInterviewInput {
  applicationId: ID!
  scheduledAt: DateTime!
  duration: Int
  type: InterviewType!
  notes: String
}

input CreateRoomInput {
  applicationId: ID!
}

type CreateRoomResponse {
  roomName: String!
  token: String!
  message: String
}

type Mutation {
  scheduleInterview(input: ScheduleInterviewInput!): Interview!
  createInterviewRoom(createRoomInput: CreateRoomInput!): CreateRoomResponse!
  updateInterviewStatus(id: ID!, status: InterviewStatus!): Interview!
  addInterviewFeedback(id: ID!, feedback: String!, rating: Float): Interview!
}

type Query {
  interviewsByApplication(applicationId: ID!): [Interview!]!
  interview(id: ID!): Interview!
}
```

---

## 🚀 Implementation Roadmap for Flutter App

### ✅ Phase 1: Complete (Current State)
- Interview model with AI fields
- Interview service with mock data
- Schedule interview UI
- Interview type selection
- Date/time pickers
- GetStorage persistence

### 🔄 Phase 2: Backend Integration (NEXT)
**Priority: HIGH**
1. Add GraphQL client to Flutter app
2. Replace mock InterviewService with real API calls
3. Implement authentication headers
4. Test interview scheduling flow
5. Handle API errors gracefully

**Files to Update**:
- `lib/services/interview_service.dart` - Add GraphQL mutations/queries
- `lib/core/graphql_client.dart` - Create GraphQL client
- `lib/services/auth_service.dart` - Handle token management

### 📹 Phase 3: Video Interview UI
**Priority: MEDIUM**
1. Add LiveKit SDK dependency
2. Create InterviewRoomScreen
3. Implement video rendering
4. Add audio/video controls
5. Handle connection states
6. Add reconnection logic

**New Files**:
- `lib/screens/interview/interview_room_screen.dart`
- `lib/widgets/interview/video_participant.dart`
- `lib/widgets/interview/interview_controls.dart`
- `lib/services/livekit_service.dart`

### 🔗 Phase 4: Deep Linking
**Priority: MEDIUM**
1. Configure Android/iOS deep links
2. Handle `rolevate.com/interview/{id}` URLs
3. Parse interview ID from URL
4. Navigate to interview room
5. Test deep link flow

### 📱 Phase 5: Notifications
**Priority: LOW**
1. Implement push notifications
2. Send interview reminders
3. Notify when interview starts
4. Handle notification taps

---

## 🔍 Key Insights

### What Works Well in Web
1. **LiveKit Integration**: Seamless real-time video
2. **Pre-room Setup**: Candidates test audio/video before joining
3. **Error Handling**: Retry logic for rate limiting
4. **Transcript Storage**: AI agent generates and stores transcripts
5. **GraphQL Architecture**: Clean separation of concerns

### What to Adopt in Mobile
1. **LiveKit SDK**: Use same video infrastructure
2. **GraphQL Client**: Direct backend communication
3. **Error Handling**: Implement retry logic
4. **Transcript Access**: Show interview transcripts to candidates
5. **Pre-join UI**: Test camera/mic before interview

### What's Different in Mobile
1. **UI Framework**: Cupertino vs Material/Tailwind
2. **State Management**: GetX vs React hooks
3. **Storage**: GetStorage vs localStorage
4. **Navigation**: GetX routing vs Next.js routing
5. **Permissions**: Need camera/mic permissions on mobile

---

## 📊 Data Flow Diagram

```
[Flutter App]
     ↓
     ↓ GraphQL Mutation: scheduleInterview
     ↓
[Backend GraphQL API]
     ↓
     ↓ Creates interview record
     ↓
[PostgreSQL Database]
     ↓
     ↓ Returns interview data with roomId
     ↓
[Flutter App]
     ↓
     ↓ Candidate clicks "Join Interview"
     ↓ GraphQL Mutation: createInterviewRoom(applicationId)
     ↓
[Backend]
     ↓
     ↓ Creates LiveKit room
     ↓ Generates access token
     ↓
[LiveKit Server]
     ↓
     ↓ Returns room token
     ↓
[Flutter App]
     ↓
     ↓ Connects to LiveKit with token
     ↓
[LiveKit Room]
     ├── Candidate (Flutter app)
     └── AI Agent (Backend Python service)
          ↓
          ↓ Conducts interview
          ↓ Records responses
          ↓
     [Database]
          ↓ Stores transcripts
          ↓ Stores AI analysis
          ↓
     [Employer Dashboard]
          └── Reviews interview results
```

---

## 🎯 Immediate Next Steps

1. **Set up GraphQL Client in Flutter**
   ```bash
   flutter pub add graphql_flutter
   ```

2. **Create GraphQL Client Service**
   ```dart
   // lib/core/graphql_client.dart
   ```

3. **Update InterviewService**
   - Replace mock methods with real GraphQL calls
   - Keep the same method signatures
   - Add error handling

4. **Test Interview Scheduling**
   - Schedule interview from Flutter app
   - Verify it appears in web dashboard
   - Check database record

5. **Add LiveKit for Video**
   ```bash
   flutter pub add livekit_client
   ```

6. **Create Interview Room Screen**
   - Video display
   - Audio controls
   - Connection management

---

## 📚 Resources

### Documentation
- LiveKit Flutter SDK: https://docs.livekit.io/client-sdk/flutter/
- GraphQL Flutter: https://pub.dev/packages/graphql_flutter
- Deep Linking: https://docs.flutter.dev/ui/navigation/deep-linking

### Example Code
- Web interview room: `rolevatev6/src/app/room/`
- Web services: `rolevatev6/src/services/interview.service.ts`
- Backend GraphQL: `rolevate-backendgql/`

### Testing
- LiveKit Cloud: `wss://rolvate-fi6h6rke.livekit.cloud`
- GraphQL Endpoint: `https://rolevate.com/api/graphql`
- Local Backend: `http://localhost:4005/api/graphql`

---

## ✅ Conclusion

The Flutter app has a solid foundation with:
- ✅ UI/UX designed and implemented
- ✅ Mock data system working
- ✅ Interview scheduling flow complete
- ✅ Models matching backend schema

**Next priority**: Replace mock data with real GraphQL calls to match the web frontend's functionality. The web implementation provides a clear blueprint for how the mobile app should interact with the backend.
