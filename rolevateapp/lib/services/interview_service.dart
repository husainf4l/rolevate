import 'package:get_storage/get_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import '../models/interview.dart';
import 'package:uuid/uuid.dart';

/// Service for managing Rolevate AI-powered interviews
/// Supports both mock data (for offline) and real GraphQL API
class InterviewService {
  final _storage = GetStorage();
  static const _interviewsKey = 'mock_interviews';
  final _uuid = const Uuid();
  
  // GraphQL client - will be set when backend is available
  GraphQLClient? _client;
  bool _useBackend = false; // Toggle between mock and real API
  
  /// Initialize with GraphQL client for backend integration
  void initializeWithBackend(GraphQLClient client) {
    _client = client;
    _useBackend = true;
  }
  
  /// Switch to mock mode (offline)
  void useMockMode() {
    _useBackend = false;
  }

  /// Get all stored interviews (mock data)
  List<Map<String, dynamic>> get _storedInterviews {
    final interviews = _storage.read(_interviewsKey);
    if (interviews == null) return [];
    return List<Map<String, dynamic>>.from(interviews);
  }

  /// Save interviews to storage (mock data)
  void _saveInterviews(List<Map<String, dynamic>> interviews) {
    _storage.write(_interviewsKey, interviews);
  }

  /// Generate unique Rolevate interview link
  String _generateInterviewLink(String interviewId) {
    return 'https://rolevate.com/interview/$interviewId';
  }

  /// Generate AI agent ID
  String _generateAiAgentId() {
    return 'ai_agent_${_uuid.v4().substring(0, 8)}';
  }

  /// Schedule a new interview with Rolevate AI agent
  /// Uses backend API if available, falls back to mock data
  Future<Interview> scheduleInterview({
    required String applicationId,
    required String employerId,
    required DateTime scheduledAt,
    int duration = 45, // Default 45 minutes
    InterviewType type = InterviewType.video,
    String? notes,
  }) async {
    if (_useBackend && _client != null) {
      return _scheduleInterviewBackend(
        applicationId: applicationId,
        employerId: employerId,
        scheduledAt: scheduledAt,
        duration: duration,
        type: type,
        notes: notes,
      );
    } else {
      return _scheduleInterviewMock(
        applicationId: applicationId,
        employerId: employerId,
        scheduledAt: scheduledAt,
        duration: duration,
        type: type,
        notes: notes,
      );
    }
  }
  
  /// Schedule interview via GraphQL backend (matches web frontend)
  Future<Interview> _scheduleInterviewBackend({
    required String applicationId,
    required String employerId,
    required DateTime scheduledAt,
    int duration = 45,
    InterviewType type = InterviewType.video,
    String? notes,
  }) async {
    const mutation = r'''
      mutation CreateInterview($input: CreateInterviewInput!) {
        createInterview(input: $input) {
          id
          applicationId
          interviewerId
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
          createdAt
          updatedAt
        }
      }
    ''';
    
    final result = await _client!.mutate(
      MutationOptions(
        document: gql(mutation),
        variables: {
          'input': {
            'applicationId': applicationId,
            'interviewerId': employerId,
            'scheduledAt': scheduledAt.toIso8601String(),
            'duration': duration,
            'type': type.toJson(),
            'notes': notes,
          }
        },
      ),
    );
    
    if (result.hasException) {
      throw result.exception!;
    }
    
    final interviewData = result.data!['createInterview'] as Map<String, dynamic>;
    
    // Add Rolevate-specific fields not in backend yet
    interviewData['interviewLink'] = _generateInterviewLink(interviewData['id']);
    interviewData['aiAgentId'] = _generateAiAgentId();
    
    return Interview.fromJson(interviewData);
  }
  
  /// Schedule interview with mock data (offline mode)
  Future<Interview> _scheduleInterviewMock({
    required String applicationId,
    required String employerId,
    required DateTime scheduledAt,
    int duration = 45,
    InterviewType type = InterviewType.video,
    String? notes,
  }) async {
    // Simulate API delay
    await Future.delayed(const Duration(seconds: 2));

    final interviewId = _uuid.v4();
    final now = DateTime.now();

    final interview = Interview(
      id: interviewId,
      applicationId: applicationId,
      interviewerId: employerId,
      scheduledAt: scheduledAt,
      duration: duration,
      type: type,
      status: InterviewStatus.scheduled,
      notes: notes,
      feedback: null,
      rating: null,
      aiAnalysis: null,
      recordingUrl: null,
      roomId: 'room_${interviewId.substring(0, 8)}',
      // Rolevate AI fields
      interviewLink: _generateInterviewLink(interviewId),
      aiAgentId: _generateAiAgentId(),
      interviewQuestions: null, // Will be generated by AI before interview
      candidateResponses: null,
      aiScore: null,
      aiRecommendation: null,
      startedAt: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    );

    // Save to storage
    final interviews = _storedInterviews;
    interviews.add(interview.toJson());
    _saveInterviews(interviews);

    return interview;
  }

  /// Get interview by ID
  Future<Interview?> getInterviewById(String interviewId) async {
    if (_useBackend && _client != null) {
      return _getInterviewByIdBackend(interviewId);
    } else {
      return _getInterviewByIdMock(interviewId);
    }
  }
  
  /// Get interview from backend
  Future<Interview?> _getInterviewByIdBackend(String interviewId) async {
    const query = r'''
      query GetInterview($id: ID!) {
        interview(id: $id) {
          id
          applicationId
          interviewerId
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
          createdAt
          updatedAt
        }
      }
    ''';
    
    final result = await _client!.query(
      QueryOptions(
        document: gql(query),
        variables: {'id': interviewId},
        fetchPolicy: FetchPolicy.networkOnly,
      ),
    );
    
    if (result.hasException) {
      throw result.exception!;
    }
    
    final interviewData = result.data!['interview'];
    if (interviewData == null) return null;
    
    final interviewMap = interviewData as Map<String, dynamic>;
    interviewMap['interviewLink'] = _generateInterviewLink(interviewMap['id']);
    interviewMap['aiAgentId'] = _generateAiAgentId();
    
    return Interview.fromJson(interviewMap);
  }
  
  /// Get interview from mock storage
  Future<Interview?> _getInterviewByIdMock(String interviewId) async {
    await Future.delayed(const Duration(milliseconds: 500));

    final interviews = _storedInterviews;
    final interviewJson = interviews.firstWhere(
      (i) => i['id'] == interviewId,
      orElse: () => {},
    );

    if (interviewJson.isEmpty) return null;
    return Interview.fromJson(interviewJson);
  }
  
  /// Create LiveKit interview room (matches web frontend)
  /// This is called when candidate joins the interview
  Future<Map<String, String>> createInterviewRoom(String applicationId) async {
    if (_useBackend && _client != null) {
      return _createInterviewRoomBackend(applicationId);
    } else {
      return _createInterviewRoomMock(applicationId);
    }
  }
  
  /// Create interview room via backend (matches web implementation)
  Future<Map<String, String>> _createInterviewRoomBackend(String applicationId) async {
    const mutation = r'''
      mutation CreateInterviewRoom($createRoomInput: CreateRoomInput!) {
        createInterviewRoom(createRoomInput: $createRoomInput) {
          roomName
          token
          message
        }
      }
    ''';
    
    final result = await _client!.mutate(
      MutationOptions(
        document: gql(mutation),
        variables: {
          'createRoomInput': {
            'applicationId': applicationId,
          }
        },
      ),
    );
    
    if (result.hasException) {
      throw result.exception!;
    }
    
    final roomData = result.data!['createInterviewRoom'] as Map<String, dynamic>;
    
    return {
      'roomName': roomData['roomName'] as String,
      'token': roomData['token'] as String,
      'serverUrl': 'wss://rolvate-fi6h6rke.livekit.cloud',
      'message': roomData['message'] as String? ?? '',
    };
  }
  
  /// Create interview room mock
  Future<Map<String, String>> _createInterviewRoomMock(String applicationId) async {
    await Future.delayed(const Duration(seconds: 2));
    
    return {
      'roomName': 'room_${applicationId.substring(0, 8)}',
      'token': 'mock_token_${_uuid.v4()}',
      'serverUrl': 'wss://rolvate-fi6h6rke.livekit.cloud',
      'message': 'Mock room created (offline mode)',
    };
  }

  /// Get all interviews for an application
  Future<List<Interview>> getInterviewsForApplication(String applicationId) async {
    if (_useBackend && _client != null) {
      return _getInterviewsForApplicationBackend(applicationId);
    } else {
      return _getInterviewsForApplicationMock(applicationId);
    }
  }
  
  /// Get interviews from backend
  Future<List<Interview>> _getInterviewsForApplicationBackend(String applicationId) async {
    const query = r'''
      query GetInterviewsByApplication($applicationId: ID!) {
        interviewsByApplication(applicationId: $applicationId) {
          id
          applicationId
          interviewerId
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
          createdAt
          updatedAt
        }
      }
    ''';
    
    final result = await _client!.query(
      QueryOptions(
        document: gql(query),
        variables: {'applicationId': applicationId},
        fetchPolicy: FetchPolicy.networkOnly,
      ),
    );
    
    if (result.hasException) {
      throw result.exception!;
    }
    
    final interviewsData = result.data!['interviewsByApplication'] as List;
    final interviews = interviewsData.map((json) {
      final interviewMap = json as Map<String, dynamic>;
      // Add Rolevate-specific fields
      interviewMap['interviewLink'] = _generateInterviewLink(interviewMap['id']);
      interviewMap['aiAgentId'] = _generateAiAgentId();
      return Interview.fromJson(interviewMap);
    }).toList();
    
    // Sort by scheduled date (most recent first)
    interviews.sort((a, b) => b.scheduledAt.compareTo(a.scheduledAt));
    return interviews;
  }
  
  /// Get interviews from mock storage
  Future<List<Interview>> _getInterviewsForApplicationMock(String applicationId) async {
    await Future.delayed(const Duration(milliseconds: 500));

    final interviews = _storedInterviews;
    final applicationInterviews = interviews
        .where((i) => i['applicationId'] == applicationId)
        .map((json) => Interview.fromJson(json))
        .toList();

    // Sort by scheduled date (most recent first)
    applicationInterviews.sort((a, b) => b.scheduledAt.compareTo(a.scheduledAt));
    return applicationInterviews;
  }

  /// Get all interviews scheduled by employer
  Future<List<Interview>> getEmployerInterviews(String employerId) async {
    await Future.delayed(const Duration(milliseconds: 500));

    final interviews = _storedInterviews;
    final employerInterviews = interviews
        .where((i) => i['interviewerId'] == employerId)
        .map((json) => Interview.fromJson(json))
        .toList();

    // Sort by scheduled date (soonest first)
    employerInterviews.sort((a, b) => a.scheduledAt.compareTo(b.scheduledAt));
    return employerInterviews;
  }

  /// Update interview status
  Future<Interview> updateInterviewStatus(
    String interviewId,
    InterviewStatus newStatus, {
    DateTime? startedAt,
    DateTime? completedAt,
  }) async {
    if (_useBackend && _client != null) {
      return _updateInterviewStatusBackend(interviewId, newStatus, startedAt: startedAt, completedAt: completedAt);
    } else {
      return _updateInterviewStatusMock(interviewId, newStatus, startedAt: startedAt, completedAt: completedAt);
    }
  }
  
  /// Update status via backend
  Future<Interview> _updateInterviewStatusBackend(
    String interviewId,
    InterviewStatus newStatus, {
    DateTime? startedAt,
    DateTime? completedAt,
  }) async {
    String mutation;
    
    // Use specific mutations based on status
    switch (newStatus) {
      case InterviewStatus.completed:
        mutation = r'''
          mutation CompleteInterview($id: ID!) {
            completeInterview(id: $id) {
              id
              status
              updatedAt
            }
          }
        ''';
        break;
      case InterviewStatus.cancelled:
        mutation = r'''
          mutation CancelInterview($id: ID!, $reason: String) {
            cancelInterview(id: $id, reason: $reason) {
              id
              status
              notes
              updatedAt
            }
          }
        ''';
        break;
      case InterviewStatus.noShow:
        mutation = r'''
          mutation MarkNoShow($id: ID!) {
            markInterviewNoShow(id: $id) {
              id
              status
              updatedAt
            }
          }
        ''';
        break;
      default:
        // Generic update for other statuses
        mutation = r'''
          mutation UpdateInterview($id: ID!, $input: UpdateInterviewInput!) {
            updateInterview(id: $id, input: $input) {
              id
              status
              updatedAt
            }
          }
        ''';
    }
    
    final result = await _client!.mutate(
      MutationOptions(
        document: gql(mutation),
        variables: {
          'id': interviewId,
          if (newStatus != InterviewStatus.completed && 
              newStatus != InterviewStatus.noShow && 
              newStatus != InterviewStatus.cancelled)
            'input': {'status': newStatus.toJson()},
        },
      ),
    );
    
    if (result.hasException) {
      throw result.exception!;
    }
    
    // Fetch full interview data after update
    return (await _getInterviewByIdBackend(interviewId))!;
  }
  
  /// Update status in mock storage
  Future<Interview> _updateInterviewStatusMock(
    String interviewId,
    InterviewStatus newStatus, {
    DateTime? startedAt,
    DateTime? completedAt,
  }) async {
    await Future.delayed(const Duration(milliseconds: 500));

    final interviews = _storedInterviews;
    final index = interviews.indexWhere((i) => i['id'] == interviewId);

    if (index == -1) {
      throw Exception('Interview not found');
    }

    final interviewJson = interviews[index];
    interviewJson['status'] = newStatus.toJson();
    interviewJson['updatedAt'] = DateTime.now().toIso8601String();

    if (startedAt != null) {
      interviewJson['startedAt'] = startedAt.toIso8601String();
    }
    if (completedAt != null) {
      interviewJson['completedAt'] = completedAt.toIso8601String();
    }

    interviews[index] = interviewJson;
    _saveInterviews(interviews);

    return Interview.fromJson(interviewJson);
  }

  /// Add AI analysis to interview (after completion)
  Future<Interview> addAiAnalysis(
    String interviewId, {
    required Map<String, dynamic> aiAnalysis,
    required double aiScore,
    required String aiRecommendation,
    Map<String, dynamic>? candidateResponses,
  }) async {
    await Future.delayed(const Duration(milliseconds: 500));

    final interviews = _storedInterviews;
    final index = interviews.indexWhere((i) => i['id'] == interviewId);

    if (index == -1) {
      throw Exception('Interview not found');
    }

    final interviewJson = interviews[index];
    interviewJson['aiAnalysis'] = aiAnalysis;
    interviewJson['aiScore'] = aiScore;
    interviewJson['aiRecommendation'] = aiRecommendation;
    interviewJson['candidateResponses'] = candidateResponses;
    interviewJson['updatedAt'] = DateTime.now().toIso8601String();

    interviews[index] = interviewJson;
    _saveInterviews(interviews);

    return Interview.fromJson(interviewJson);
  }

  /// Cancel interview
  Future<Interview> cancelInterview(String interviewId, String reason) async {
    await Future.delayed(const Duration(milliseconds: 500));

    final interviews = _storedInterviews;
    final index = interviews.indexWhere((i) => i['id'] == interviewId);

    if (index == -1) {
      throw Exception('Interview not found');
    }

    final interviewJson = interviews[index];
    interviewJson['status'] = InterviewStatus.cancelled.toJson();
    interviewJson['notes'] = (interviewJson['notes'] ?? '') + '\nCancellation reason: $reason';
    interviewJson['updatedAt'] = DateTime.now().toIso8601String();

    interviews[index] = interviewJson;
    _saveInterviews(interviews);

    return Interview.fromJson(interviewJson);
  }

  /// Reschedule interview
  Future<Interview> rescheduleInterview(
    String interviewId,
    DateTime newScheduledAt,
  ) async {
    await Future.delayed(const Duration(milliseconds: 500));

    final interviews = _storedInterviews;
    final index = interviews.indexWhere((i) => i['id'] == interviewId);

    if (index == -1) {
      throw Exception('Interview not found');
    }

    final interviewJson = interviews[index];
    interviewJson['scheduledAt'] = newScheduledAt.toIso8601String();
    interviewJson['status'] = InterviewStatus.scheduled.toJson();
    interviewJson['updatedAt'] = DateTime.now().toIso8601String();

    interviews[index] = interviewJson;
    _saveInterviews(interviews);

    return Interview.fromJson(interviewJson);
  }

  /// Get upcoming interviews (next 7 days)
  Future<List<Interview>> getUpcomingInterviews(String employerId) async {
    await Future.delayed(const Duration(milliseconds: 500));

    final now = DateTime.now();
    final sevenDaysLater = now.add(const Duration(days: 7));

    final interviews = _storedInterviews;
    final upcomingInterviews = interviews
        .where((i) =>
            i['interviewerId'] == employerId &&
            i['status'] == 'SCHEDULED')
        .map((json) => Interview.fromJson(json))
        .where((interview) =>
            interview.scheduledAt.isAfter(now) &&
            interview.scheduledAt.isBefore(sevenDaysLater))
        .toList();

    // Sort by scheduled date (soonest first)
    upcomingInterviews.sort((a, b) => a.scheduledAt.compareTo(b.scheduledAt));
    return upcomingInterviews;
  }

  /// Check if candidate can join interview (5 minutes before scheduled time)
  bool canJoinInterview(Interview interview) {
    final now = DateTime.now();
    final fiveMinutesBefore = interview.scheduledAt.subtract(const Duration(minutes: 5));
    final fiveMinutesAfter = interview.scheduledAt.add(const Duration(minutes: 5));

    return now.isAfter(fiveMinutesBefore) &&
        now.isBefore(fiveMinutesAfter) &&
        interview.status == InterviewStatus.scheduled;
  }

  /// Get interview statistics for employer
  Future<Map<String, dynamic>> getInterviewStatistics(String employerId) async {
    await Future.delayed(const Duration(milliseconds: 500));

    final interviews = _storedInterviews
        .where((i) => i['interviewerId'] == employerId)
        .map((json) => Interview.fromJson(json))
        .toList();

    final scheduled = interviews.where((i) => i.status == InterviewStatus.scheduled).length;
    final completed = interviews.where((i) => i.status == InterviewStatus.completed).length;
    final cancelled = interviews.where((i) => i.status == InterviewStatus.cancelled).length;
    final noShow = interviews.where((i) => i.status == InterviewStatus.noShow).length;

    // Calculate average AI score
    final completedWithScore = interviews
        .where((i) => i.status == InterviewStatus.completed && i.aiScore != null)
        .toList();
    final avgScore = completedWithScore.isEmpty
        ? 0.0
        : completedWithScore.map((i) => i.aiScore!).reduce((a, b) => a + b) /
            completedWithScore.length;

    return {
      'total': interviews.length,
      'scheduled': scheduled,
      'completed': completed,
      'cancelled': cancelled,
      'noShow': noShow,
      'averageAiScore': avgScore,
    };
  }
}
