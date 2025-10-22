import 'package:rolevateapp/models/application.dart';
import 'package:rolevateapp/models/user.dart';

/// Application note model
class ApplicationNote {
  final String id;
  final Application application;
  final User user;
  final String note;
  final bool isPrivate;
  final DateTime createdAt;
  final DateTime updatedAt;

  ApplicationNote({
    required this.id,
    required this.application,
    required this.user,
    required this.note,
    required this.isPrivate,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Create ApplicationNote from JSON
  factory ApplicationNote.fromJson(Map<String, dynamic> json) {
    return ApplicationNote(
      id: json['id'] as String,
      application: Application.fromJson(json['application'] as Map<String, dynamic>),
      user: User.fromJson(json['user'] as Map<String, dynamic>),
      note: json['note'] as String,
      isPrivate: json['isPrivate'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  /// Convert ApplicationNote to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'application': application.toJson(),
      'user': user.toJson(),
      'note': note,
      'isPrivate': isPrivate,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  /// Get time ago string
  String get timeAgo {
    final now = DateTime.now();
    final diff = now.difference(createdAt);

    if (diff.inDays > 365) {
      final years = (diff.inDays / 365).floor();
      return '$years year${years > 1 ? 's' : ''} ago';
    }
    if (diff.inDays > 30) {
      final months = (diff.inDays / 30).floor();
      return '$months month${months > 1 ? 's' : ''} ago';
    }
    if (diff.inDays > 0) return '${diff.inDays} day${diff.inDays > 1 ? 's' : ''} ago';
    if (diff.inHours > 0) return '${diff.inHours} hour${diff.inHours > 1 ? 's' : ''} ago';
    if (diff.inMinutes > 0) return '${diff.inMinutes} minute${diff.inMinutes > 1 ? 's' : ''} ago';
    return 'Just now';
  }

  @override
  String toString() => 'ApplicationNote(by ${user.name}, $timeAgo)';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ApplicationNote && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
