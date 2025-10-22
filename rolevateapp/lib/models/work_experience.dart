/// Work experience model
class WorkExperience {
  final String id;
  final String? company;
  final String? position;
  final DateTime? startDate;
  final DateTime? endDate;
  final String? description;
  final bool isCurrent;
  final DateTime createdAt;
  final DateTime updatedAt;

  WorkExperience({
    required this.id,
    this.company,
    this.position,
    this.startDate,
    this.endDate,
    this.description,
    required this.isCurrent,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Create WorkExperience from JSON
  factory WorkExperience.fromJson(Map<String, dynamic> json) {
    return WorkExperience(
      id: json['id'] as String,
      company: json['company'] as String?,
      position: json['position'] as String?,
      startDate: json['startDate'] != null
          ? DateTime.parse(json['startDate'] as String)
          : null,
      endDate: json['endDate'] != null
          ? DateTime.parse(json['endDate'] as String)
          : null,
      description: json['description'] as String?,
      isCurrent: json['isCurrent'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  /// Convert WorkExperience to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'company': company,
      'position': position,
      'startDate': startDate?.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
      'description': description,
      'isCurrent': isCurrent,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  /// Get duration in months
  int get durationInMonths {
    final end = endDate ?? DateTime.now();
    if (startDate == null) return 0;
    return ((end.year - startDate!.year) * 12) + (end.month - startDate!.month);
  }

  /// Get formatted duration
  String get formattedDuration {
    final months = durationInMonths;
    if (months < 12) return '$months month${months != 1 ? 's' : ''}';
    final years = months ~/ 12;
    final remainingMonths = months % 12;
    if (remainingMonths == 0) return '$years year${years != 1 ? 's' : ''}';
    return '$years year${years != 1 ? 's' : ''}, $remainingMonths month${remainingMonths != 1 ? 's' : ''}';
  }

  /// Get date range string
  String get dateRange {
    if (startDate == null) return 'Unknown';
    final start = '${startDate!.month}/${startDate!.year}';
    final end = isCurrent ? 'Present' : (endDate != null ? '${endDate!.month}/${endDate!.year}' : 'Unknown');
    return '$start - $end';
  }

  @override
  String toString() => 'WorkExperience($position at $company, $dateRange)';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is WorkExperience && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
