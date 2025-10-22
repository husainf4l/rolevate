import 'package:rolevateapp/models/job.dart';

/// Saved job model
class SavedJob {
  final String id;
  final String userId;
  final String jobId;
  final Job? job;
  final DateTime savedAt;
  final String? notes;

  SavedJob({
    required this.id,
    required this.userId,
    required this.jobId,
    this.job,
    required this.savedAt,
    this.notes,
  });

  /// Create SavedJob from JSON
  factory SavedJob.fromJson(Map<String, dynamic> json) {
    return SavedJob(
      id: json['id'] as String,
      userId: json['userId'] as String,
      jobId: json['jobId'] as String,
      job: json['job'] != null
          ? Job.fromJson(json['job'] as Map<String, dynamic>)
          : null,
      savedAt: DateTime.parse(json['savedAt'] as String),
      notes: json['notes'] as String?,
    );
  }

  /// Convert SavedJob to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'jobId': jobId,
      'job': job?.toJson(),
      'savedAt': savedAt.toIso8601String(),
      'notes': notes,
    };
  }

  /// Get time ago string
  String get savedTimeAgo {
    final now = DateTime.now();
    final diff = now.difference(savedAt);

    if (diff.inDays > 30) {
      final months = (diff.inDays / 30).floor();
      return 'Saved $months month${months > 1 ? 's' : ''} ago';
    }
    if (diff.inDays > 0) return 'Saved ${diff.inDays} day${diff.inDays > 1 ? 's' : ''} ago';
    if (diff.inHours > 0) return 'Saved ${diff.inHours} hour${diff.inHours > 1 ? 's' : ''} ago';
    return 'Saved recently';
  }

  @override
  String toString() => 'SavedJob(${job?.title ?? jobId}, $savedTimeAgo)';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is SavedJob && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
