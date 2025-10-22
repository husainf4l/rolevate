/// Education model
class Education {
  final String id;
  final String? institution;
  final String? degree;
  final String? fieldOfStudy;
  final DateTime? startDate;
  final DateTime? endDate;
  final String? grade;
  final String? description;
  final DateTime createdAt;
  final DateTime updatedAt;

  Education({
    required this.id,
    this.institution,
    this.degree,
    this.fieldOfStudy,
    this.startDate,
    this.endDate,
    this.grade,
    this.description,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Create Education from JSON
  factory Education.fromJson(Map<String, dynamic> json) {
    return Education(
      id: json['id'] as String,
      institution: json['institution'] as String?,
      degree: json['degree'] as String?,
      fieldOfStudy: json['fieldOfStudy'] as String?,
      startDate: json['startDate'] != null
          ? DateTime.parse(json['startDate'] as String)
          : null,
      endDate: json['endDate'] != null
          ? DateTime.parse(json['endDate'] as String)
          : null,
      grade: json['grade'] as String?,
      description: json['description'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  /// Convert Education to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'institution': institution,
      'degree': degree,
      'fieldOfStudy': fieldOfStudy,
      'startDate': startDate?.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
      'grade': grade,
      'description': description,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  /// Get date range string
  String get dateRange {
    if (startDate == null) return 'Unknown';
    final start = startDate!.year.toString();
    final end = endDate?.year.toString() ?? 'Present';
    return '$start - $end';
  }

  /// Get full degree title
  String get fullDegree {
    if (degree == null && fieldOfStudy == null) return 'Degree';
    if (degree != null && fieldOfStudy != null) return '$degree in $fieldOfStudy';
    return degree ?? fieldOfStudy ?? 'Degree';
  }

  @override
  String toString() => 'Education($fullDegree from $institution, $dateRange)';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Education && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
