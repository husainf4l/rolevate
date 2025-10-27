/// Interview type enumeration
enum InterviewType {
  phone,
  video,
  inPerson,
  technical,
  hr;

  static InterviewType fromString(String value) {
    switch (value.toUpperCase()) {
      case 'PHONE':
        return InterviewType.phone;
      case 'VIDEO':
        return InterviewType.video;
      case 'IN_PERSON':
        return InterviewType.inPerson;
      case 'TECHNICAL':
        return InterviewType.technical;
      case 'HR':
        return InterviewType.hr;
      default:
        return InterviewType.video;
    }
  }

  String toJson() {
    switch (this) {
      case InterviewType.phone:
        return 'PHONE';
      case InterviewType.video:
        return 'VIDEO';
      case InterviewType.inPerson:
        return 'IN_PERSON';
      case InterviewType.technical:
        return 'TECHNICAL';
      case InterviewType.hr:
        return 'HR';
    }
  }

  String get displayName {
    switch (this) {
      case InterviewType.phone:
        return 'Phone Interview';
      case InterviewType.video:
        return 'Video Interview';
      case InterviewType.inPerson:
        return 'In-Person Interview';
      case InterviewType.technical:
        return 'Technical Interview';
      case InterviewType.hr:
        return 'HR Interview';
    }
  }
}

/// Interview status enumeration
enum InterviewStatus {
  scheduled,
  inProgress,
  completed,
  cancelled,
  noShow;

  static InterviewStatus fromString(String value) {
    switch (value.toUpperCase()) {
      case 'SCHEDULED':
        return InterviewStatus.scheduled;
      case 'IN_PROGRESS':
        return InterviewStatus.inProgress;
      case 'COMPLETED':
        return InterviewStatus.completed;
      case 'CANCELLED':
        return InterviewStatus.cancelled;
      case 'NO_SHOW':
        return InterviewStatus.noShow;
      default:
        return InterviewStatus.scheduled;
    }
  }

  String toJson() {
    switch (this) {
      case InterviewStatus.scheduled:
        return 'SCHEDULED';
      case InterviewStatus.inProgress:
        return 'IN_PROGRESS';
      case InterviewStatus.completed:
        return 'COMPLETED';
      case InterviewStatus.cancelled:
        return 'CANCELLED';
      case InterviewStatus.noShow:
        return 'NO_SHOW';
    }
  }

  String get displayName {
    switch (this) {
      case InterviewStatus.scheduled:
        return 'Scheduled';
      case InterviewStatus.inProgress:
        return 'In Progress';
      case InterviewStatus.completed:
        return 'Completed';
      case InterviewStatus.cancelled:
        return 'Cancelled';
      case InterviewStatus.noShow:
        return 'No Show';
    }
  }
}

/// Interview model
class Interview {
  final String id;
  final String applicationId;
  final String? interviewerId;
  final DateTime scheduledAt;
  final int? duration; // in minutes
  final InterviewType type;
  final InterviewStatus status;
  final String? notes;
  final String? feedback;
  final double? rating;
  final Map<String, dynamic>? aiAnalysis;
  final String? recordingUrl;
  final String? roomId;
  
  // Rolevate AI Interview System
  final String? interviewLink; // Unique Rolevate interview link
  final String? aiAgentId; // AI agent conducting the interview
  final Map<String, dynamic>? interviewQuestions; // AI-generated questions
  final Map<String, dynamic>? candidateResponses; // Candidate answers
  final double? aiScore; // AI-evaluated score
  final String? aiRecommendation; // AI recommendation for employer
  final DateTime? startedAt; // When interview actually started
  final DateTime? completedAt; // When interview was completed
  
  final DateTime createdAt;
  final DateTime updatedAt;

  Interview({
    required this.id,
    required this.applicationId,
    this.interviewerId,
    required this.scheduledAt,
    this.duration,
    required this.type,
    required this.status,
    this.notes,
    this.feedback,
    this.rating,
    this.aiAnalysis,
    this.recordingUrl,
    this.roomId,
    this.interviewLink,
    this.aiAgentId,
    this.interviewQuestions,
    this.candidateResponses,
    this.aiScore,
    this.aiRecommendation,
    this.startedAt,
    this.completedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Create Interview from JSON
  factory Interview.fromJson(Map<String, dynamic> json) {
    return Interview(
      id: json['id'] as String,
      applicationId: json['applicationId'] as String? ?? json['application']?['id'] as String,
      interviewerId: json['interviewerId'] as String? ?? json['interviewer']?['id'] as String?,
      scheduledAt: DateTime.parse(json['scheduledAt'] as String),
      duration: json['duration'] as int?,
      type: InterviewType.fromString(json['type'] as String),
      status: InterviewStatus.fromString(json['status'] as String),
      notes: json['notes'] as String?,
      feedback: json['feedback'] as String?,
      rating: json['rating'] as double?,
      aiAnalysis: json['aiAnalysis'] as Map<String, dynamic>?,
      recordingUrl: json['recordingUrl'] as String?,
      roomId: json['roomId'] as String?,
      interviewLink: json['interviewLink'] as String?,
      aiAgentId: json['aiAgentId'] as String?,
      interviewQuestions: json['interviewQuestions'] as Map<String, dynamic>?,
      candidateResponses: json['candidateResponses'] as Map<String, dynamic>?,
      aiScore: json['aiScore'] as double?,
      aiRecommendation: json['aiRecommendation'] as String?,
      startedAt: json['startedAt'] != null ? DateTime.parse(json['startedAt'] as String) : null,
      completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt'] as String) : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  /// Convert Interview to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'applicationId': applicationId,
      'interviewerId': interviewerId,
      'scheduledAt': scheduledAt.toIso8601String(),
      'duration': duration,
      'type': type.toJson(),
      'status': status.toJson(),
      'notes': notes,
      'feedback': feedback,
      'rating': rating,
      'aiAnalysis': aiAnalysis,
      'recordingUrl': recordingUrl,
      'roomId': roomId,
      'interviewLink': interviewLink,
      'aiAgentId': aiAgentId,
      'interviewQuestions': interviewQuestions,
      'candidateResponses': candidateResponses,
      'aiScore': aiScore,
      'aiRecommendation': aiRecommendation,
      'startedAt': startedAt?.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  /// Check if interview is upcoming
  bool get isUpcoming =>
      status == InterviewStatus.scheduled &&
      scheduledAt.isAfter(DateTime.now());

  /// Check if interview is past
  bool get isPast => scheduledAt.isBefore(DateTime.now());

  /// Check if interview is today
  bool get isToday {
    final now = DateTime.now();
    return scheduledAt.year == now.year &&
        scheduledAt.month == now.month &&
        scheduledAt.day == now.day;
  }

  /// Get time until interview
  Duration get timeUntil => scheduledAt.difference(DateTime.now());

  /// Get formatted time until
  String get formattedTimeUntil {
    final diff = timeUntil;
    if (diff.isNegative) return 'Started';
    
    if (diff.inDays > 0) return 'In ${diff.inDays} day${diff.inDays > 1 ? 's' : ''}';
    if (diff.inHours > 0) return 'In ${diff.inHours} hour${diff.inHours > 1 ? 's' : ''}';
    if (diff.inMinutes > 0) return 'In ${diff.inMinutes} minute${diff.inMinutes > 1 ? 's' : ''}';
    return 'Starting soon';
  }

  /// Get formatted duration
  String get formattedDuration {
    if (duration == null) return 'Duration not set';
    if (duration! < 60) return '$duration minutes';
    final hours = duration! ~/ 60;
    final mins = duration! % 60;
    if (mins == 0) return '$hours hour${hours > 1 ? 's' : ''}';
    return '$hours hour${hours > 1 ? 's' : ''} $mins min';
  }

  @override
  String toString() => 'Interview(${type.displayName}, ${status.displayName}, $formattedTimeUntil)';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Interview && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
