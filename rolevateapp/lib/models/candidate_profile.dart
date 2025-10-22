import 'package:rolevateapp/models/work_experience.dart';
import 'package:rolevateapp/models/education.dart';
import 'package:rolevateapp/models/cv.dart';

/// Availability status enumeration
enum AvailabilityStatus {
  available,
  notAvailable,
  openToOffers;

  static AvailabilityStatus fromString(String value) {
    switch (value.toUpperCase()) {
      case 'AVAILABLE':
        return AvailabilityStatus.available;
      case 'NOT_AVAILABLE':
        return AvailabilityStatus.notAvailable;
      case 'OPEN_TO_OFFERS':
        return AvailabilityStatus.openToOffers;
      default:
        return AvailabilityStatus.available;
    }
  }

  String toJson() {
    switch (this) {
      case AvailabilityStatus.available:
        return 'AVAILABLE';
      case AvailabilityStatus.notAvailable:
        return 'NOT_AVAILABLE';
      case AvailabilityStatus.openToOffers:
        return 'OPEN_TO_OFFERS';
    }
  }

  String get displayName {
    switch (this) {
      case AvailabilityStatus.available:
        return 'Available';
      case AvailabilityStatus.notAvailable:
        return 'Not Available';
      case AvailabilityStatus.openToOffers:
        return 'Open to Offers';
    }
  }
}

/// Candidate profile model
class CandidateProfile {
  final String id;
  final String? firstName;
  final String? lastName;
  final String? phone;
  final String? location;
  final String? bio;
  final List<String> skills;
  final String? experience;
  final String? education;
  final String? linkedinUrl;
  final String? githubUrl;
  final String? portfolioUrl;
  final String? resumeUrl;
  final AvailabilityStatus? availability;
  final String? salaryExpectation;
  final String? preferredWorkType;
  final List<WorkExperience> workExperiences;
  final List<Education> educations;
  final List<CV> cvs;
  final DateTime createdAt;
  final DateTime updatedAt;

  CandidateProfile({
    required this.id,
    this.firstName,
    this.lastName,
    this.phone,
    this.location,
    this.bio,
    this.skills = const [],
    this.experience,
    this.education,
    this.linkedinUrl,
    this.githubUrl,
    this.portfolioUrl,
    this.resumeUrl,
    this.availability,
    this.salaryExpectation,
    this.preferredWorkType,
    this.workExperiences = const [],
    this.educations = const [],
    this.cvs = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  /// Create CandidateProfile from JSON
  factory CandidateProfile.fromJson(Map<String, dynamic> json) {
    return CandidateProfile(
      id: json['id'] as String,
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      phone: json['phone'] as String?,
      location: json['location'] as String?,
      bio: json['bio'] as String?,
      skills: json['skills'] != null
          ? (json['skills'] as List<dynamic>).map((e) => e as String).toList()
          : [],
      experience: json['experience'] as String?,
      education: json['education'] as String?,
      linkedinUrl: json['linkedinUrl'] as String?,
      githubUrl: json['githubUrl'] as String?,
      portfolioUrl: json['portfolioUrl'] as String?,
      resumeUrl: json['resumeUrl'] as String?,
      availability: json['availability'] != null
          ? AvailabilityStatus.fromString(json['availability'] as String)
          : null,
      salaryExpectation: json['salaryExpectation'] as String?,
      preferredWorkType: json['preferredWorkType'] as String?,
      workExperiences: json['workExperiences'] != null
          ? (json['workExperiences'] as List<dynamic>)
              .map((e) => WorkExperience.fromJson(e as Map<String, dynamic>))
              .toList()
          : [],
      educations: json['educations'] != null
          ? (json['educations'] as List<dynamic>)
              .map((e) => Education.fromJson(e as Map<String, dynamic>))
              .toList()
          : [],
      cvs: json['cvs'] != null
          ? (json['cvs'] as List<dynamic>)
              .map((e) => CV.fromJson(e as Map<String, dynamic>))
              .toList()
          : [],
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  /// Convert CandidateProfile to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'firstName': firstName,
      'lastName': lastName,
      'phone': phone,
      'location': location,
      'bio': bio,
      'skills': skills,
      'experience': experience,
      'education': education,
      'linkedinUrl': linkedinUrl,
      'githubUrl': githubUrl,
      'portfolioUrl': portfolioUrl,
      'resumeUrl': resumeUrl,
      'availability': availability?.toJson(),
      'salaryExpectation': salaryExpectation,
      'preferredWorkType': preferredWorkType,
      'workExperiences': workExperiences.map((e) => e.toJson()).toList(),
      'educations': educations.map((e) => e.toJson()).toList(),
      'cvs': cvs.map((e) => e.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  /// Get full name
  String get fullName {
    if (firstName == null && lastName == null) return 'Candidate';
    if (firstName != null && lastName != null) return '$firstName $lastName';
    return firstName ?? lastName ?? 'Candidate';
  }

  /// Get primary CV
  CV? get primaryCV {
    try {
      return cvs.firstWhere((cv) => cv.isPrimary);
    } catch (e) {
      return cvs.isNotEmpty ? cvs.first : null;
    }
  }

  /// Get total years of experience
  int get totalYearsOfExperience {
    if (workExperiences.isEmpty) return 0;
    final totalMonths = workExperiences.fold<int>(
      0,
      (sum, exp) => sum + exp.durationInMonths,
    );
    return totalMonths ~/ 12;
  }

  /// Get latest education
  Education? get latestEducation {
    if (educations.isEmpty) return null;
    final sorted = [...educations]..sort((a, b) {
        if (a.endDate == null) return -1;
        if (b.endDate == null) return 1;
        return b.endDate!.compareTo(a.endDate!);
      });
    return sorted.first;
  }

  /// Check if profile is complete
  bool get isComplete {
    return firstName != null &&
        lastName != null &&
        phone != null &&
        location != null &&
        bio != null &&
        skills.isNotEmpty &&
        cvs.isNotEmpty;
  }

  /// Get profile completion percentage
  int get completionPercentage {
    int completed = 0;
    const int total = 10;

    if (firstName != null) completed++;
    if (lastName != null) completed++;
    if (phone != null) completed++;
    if (location != null) completed++;
    if (bio != null) completed++;
    if (skills.isNotEmpty) completed++;
    if (workExperiences.isNotEmpty) completed++;
    if (educations.isNotEmpty) completed++;
    if (cvs.isNotEmpty) completed++;
    if (portfolioUrl != null || linkedinUrl != null || githubUrl != null) {
      completed++;
    }

    return ((completed / total) * 100).round();
  }

  @override
  String toString() => 'CandidateProfile($fullName, $location)';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is CandidateProfile && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
