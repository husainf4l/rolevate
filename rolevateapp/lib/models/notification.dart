/// Notification type enumeration
enum NotificationType {
  info,
  success,
  warning,
  error;

  static NotificationType fromString(String value) {
    switch (value.toUpperCase()) {
      case 'INFO':
        return NotificationType.info;
      case 'SUCCESS':
        return NotificationType.success;
      case 'WARNING':
        return NotificationType.warning;
      case 'ERROR':
        return NotificationType.error;
      default:
        return NotificationType.info;
    }
  }

  String toJson() => name.toUpperCase();
}

/// Notification category enumeration
enum NotificationCategory {
  application,
  interview,
  job,
  system,
  message;

  static NotificationCategory fromString(String value) {
    switch (value.toUpperCase()) {
      case 'APPLICATION':
        return NotificationCategory.application;
      case 'INTERVIEW':
        return NotificationCategory.interview;
      case 'JOB':
        return NotificationCategory.job;
      case 'SYSTEM':
        return NotificationCategory.system;
      case 'MESSAGE':
        return NotificationCategory.message;
      default:
        return NotificationCategory.system;
    }
  }

  String toJson() => name.toUpperCase();
}

/// Notification model
class Notification {
  final String id;
  final String title;
  final String message;
  final NotificationType type;
  final NotificationCategory category;
  final bool read;
  final DateTime createdAt;
  final DateTime? readAt;
  final String userId;
  final Map<String, dynamic>? metadata;

  Notification({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.category,
    required this.read,
    required this.createdAt,
    this.readAt,
    required this.userId,
    this.metadata,
  });

  /// Create Notification from JSON
  factory Notification.fromJson(Map<String, dynamic> json) {
    return Notification(
      id: json['id'] as String,
      title: json['title'] as String,
      message: json['message'] as String,
      type: NotificationType.fromString(json['type'] as String),
      category: NotificationCategory.fromString(json['category'] as String),
      read: json['read'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
      readAt: json['readAt'] != null
          ? DateTime.parse(json['readAt'] as String)
          : null,
      userId: json['userId'] as String,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }

  /// Convert Notification to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'type': type.toJson(),
      'category': category.toJson(),
      'read': read,
      'createdAt': createdAt.toIso8601String(),
      'readAt': readAt?.toIso8601String(),
      'userId': userId,
      'metadata': metadata,
    };
  }

  /// Copy with read status
  Notification markAsRead() {
    return Notification(
      id: id,
      title: title,
      message: message,
      type: type,
      category: category,
      read: true,
      createdAt: createdAt,
      readAt: DateTime.now(),
      userId: userId,
      metadata: metadata,
    );
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
  String toString() => 'Notification($title, ${category.name}, $timeAgo)';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Notification && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
