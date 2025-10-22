import 'package:rolevateapp/models/enums.dart';
import 'package:rolevateapp/models/job.dart';
import 'package:rolevateapp/models/user.dart';

/// Application model
class Application {
  final String id;
  final Job job;
  final User candidate;
  final ApplicationStatus status;
  final DateTime appliedAt;
  final String? coverLetter;
  final String? resumeUrl;
  final String? expectedSalary;
  final String? noticePeriod;
  final double? cvAnalysisScore;
  final double? cvScore;
  final double? firstInterviewScore;
  final double? secondInterviewScore;
  final double? finalScore;
  final Map<String, dynamic>? cvAnalysisResults;
  final DateTime? analyzedAt;
  final String? aiCvRecommendations;
  final String? aiInterviewRecommendations;
  final String? aiSecondInterviewRecommendations;
  final DateTime? recommendationsGeneratedAt;
  final String? companyNotes;
  final String? source;
  final String? notes;
  final Map<String, dynamic>? aiAnalysis;
  final bool interviewScheduled;
  final DateTime? reviewedAt;
  final DateTime? interviewScheduledAt;
  final DateTime? interviewedAt;
  final DateTime? rejectedAt;
  final DateTime? acceptedAt;
  final String interviewLanguage;
  final DateTime createdAt;
  final DateTime updatedAt;

  Application({
    required this.id,
    required this.job,
    required this.candidate,
    required this.status,
    required this.appliedAt,
    this.coverLetter,
    this.resumeUrl,
    this.expectedSalary,
    this.noticePeriod,
    this.cvAnalysisScore,
    this.cvScore,
    this.firstInterviewScore,
    this.secondInterviewScore,
    this.finalScore,
    this.cvAnalysisResults,
    this.analyzedAt,
    this.aiCvRecommendations,
    this.aiInterviewRecommendations,
    this.aiSecondInterviewRecommendations,
    this.recommendationsGeneratedAt,
    this.companyNotes,
    this.source,
    this.notes,
    this.aiAnalysis,
    required this.interviewScheduled,
    this.reviewedAt,
    this.interviewScheduledAt,
    this.interviewedAt,
    this.rejectedAt,
    this.acceptedAt,
    required this.interviewLanguage,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Create Application from JSON
  factory Application.fromJson(Map<String, dynamic> json) {
    return Application(
      id: json['id'] as String,
      job: Job.fromJson(json['job'] as Map<String, dynamic>),
      candidate: User.fromJson(json['candidate'] as Map<String, dynamic>),
      status: ApplicationStatus.fromString(json['status'] as String),
      appliedAt: DateTime.parse(json['appliedAt'] as String),
      coverLetter: json['coverLetter'] as String?,
      resumeUrl: json['resumeUrl'] as String?,
      expectedSalary: json['expectedSalary'] as String?,
      noticePeriod: json['noticePeriod'] as String?,
      cvAnalysisScore: json['cvAnalysisScore'] as double?,
      cvScore: json['cvScore'] as double?,
      firstInterviewScore: json['firstInterviewScore'] as double?,
      secondInterviewScore: json['secondInterviewScore'] as double?,
      finalScore: json['finalScore'] as double?,
      cvAnalysisResults: json['cvAnalysisResults'] as Map<String, dynamic>?,
      analyzedAt: json['analyzedAt'] != null
          ? DateTime.parse(json['analyzedAt'] as String)
          : null,
      aiCvRecommendations: json['aiCvRecommendations'] as String?,
      aiInterviewRecommendations: json['aiInterviewRecommendations'] as String?,
      aiSecondInterviewRecommendations:
          json['aiSecondInterviewRecommendations'] as String?,
      recommendationsGeneratedAt: json['recommendationsGeneratedAt'] != null
          ? DateTime.parse(json['recommendationsGeneratedAt'] as String)
          : null,
      companyNotes: json['companyNotes'] as String?,
      source: json['source'] as String?,
      notes: json['notes'] as String?,
      aiAnalysis: json['aiAnalysis'] as Map<String, dynamic>?,
      interviewScheduled: json['interviewScheduled'] as bool,
      reviewedAt: json['reviewedAt'] != null
          ? DateTime.parse(json['reviewedAt'] as String)
          : null,
      interviewScheduledAt: json['interviewScheduledAt'] != null
          ? DateTime.parse(json['interviewScheduledAt'] as String)
          : null,
      interviewedAt: json['interviewedAt'] != null
          ? DateTime.parse(json['interviewedAt'] as String)
          : null,
      rejectedAt: json['rejectedAt'] != null
          ? DateTime.parse(json['rejectedAt'] as String)
          : null,
      acceptedAt: json['acceptedAt'] != null
          ? DateTime.parse(json['acceptedAt'] as String)
          : null,
      interviewLanguage: json['interviewLanguage'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  /// Convert Application to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'job': job.toJson(),
      'candidate': candidate.toJson(),
      'status': status.toJson(),
      'appliedAt': appliedAt.toIso8601String(),
      'coverLetter': coverLetter,
      'resumeUrl': resumeUrl,
      'expectedSalary': expectedSalary,
      'noticePeriod': noticePeriod,
      'cvAnalysisScore': cvAnalysisScore,
      'cvScore': cvScore,
      'firstInterviewScore': firstInterviewScore,
      'secondInterviewScore': secondInterviewScore,
      'finalScore': finalScore,
      'cvAnalysisResults': cvAnalysisResults,
      'analyzedAt': analyzedAt?.toIso8601String(),
      'aiCvRecommendations': aiCvRecommendations,
      'aiInterviewRecommendations': aiInterviewRecommendations,
      'aiSecondInterviewRecommendations': aiSecondInterviewRecommendations,
      'recommendationsGeneratedAt': recommendationsGeneratedAt?.toIso8601String(),
      'companyNotes': companyNotes,
      'source': source,
      'notes': notes,
      'aiAnalysis': aiAnalysis,
      'interviewScheduled': interviewScheduled,
      'reviewedAt': reviewedAt?.toIso8601String(),
      'interviewScheduledAt': interviewScheduledAt?.toIso8601String(),
      'interviewedAt': interviewedAt?.toIso8601String(),
      'rejectedAt': rejectedAt?.toIso8601String(),
      'acceptedAt': acceptedAt?.toIso8601String(),
      'interviewLanguage': interviewLanguage,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  /// Get overall score (average of all scores)
  double? get overallScore {
    final scores = [
      cvAnalysisScore,
      cvScore,
      firstInterviewScore,
      secondInterviewScore,
    ].whereType<double>().toList();

    if (scores.isEmpty) return null;
    return scores.reduce((a, b) => a + b) / scores.length;
  }

  /// Check if application is pending action
  bool get isPending => status == ApplicationStatus.pending;

  /// Check if application is in progress
  bool get isInProgress =>
      status == ApplicationStatus.reviewed ||
      status == ApplicationStatus.shortlisted ||
      status == ApplicationStatus.interviewed;

  /// Check if application is successful
  bool get isSuccessful =>
      status == ApplicationStatus.offered || status == ApplicationStatus.hired;

  /// Check if application is closed
  bool get isClosed =>
      status == ApplicationStatus.rejected || status == ApplicationStatus.withdrawn;

  /// Get days since application
  int get daysSinceApplied {
    return DateTime.now().difference(appliedAt).inDays;
  }

  @override
  String toString() {
    return 'Application(id: $id, job: ${job.title}, candidate: ${candidate.name}, status: ${status.name})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Application && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
