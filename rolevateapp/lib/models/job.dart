import 'package:rolevateapp/models/enums.dart';
import 'package:rolevateapp/models/company.dart';
import 'package:rolevateapp/models/user.dart';

/// Job model
class Job {
  final String id;
  final String slug;
  final String title;
  final String department;
  final String location;
  final String salary;
  final JobType type;
  final DateTime deadline;
  final String description;
  final String shortDescription;
  final String responsibilities;
  final String requirements;
  final String benefits;
  final List<String> skills;
  final String experience;
  final String education;
  final JobLevel jobLevel;
  final WorkType workType;
  final String industry;
  final String companyDescription;
  final JobStatus status;
  final Company company;
  final String? cvAnalysisPrompt;
  final String? interviewPrompt;
  final String? aiSecondInterviewPrompt;
  final String interviewLanguage;
  final bool featured;
  final double applicants;
  final double views;
  final bool featuredJobs;
  final DateTime createdAt;
  final DateTime updatedAt;
  final User postedBy;

  Job({
    required this.id,
    required this.slug,
    required this.title,
    required this.department,
    required this.location,
    required this.salary,
    required this.type,
    required this.deadline,
    required this.description,
    required this.shortDescription,
    required this.responsibilities,
    required this.requirements,
    required this.benefits,
    required this.skills,
    required this.experience,
    required this.education,
    required this.jobLevel,
    required this.workType,
    required this.industry,
    required this.companyDescription,
    required this.status,
    required this.company,
    this.cvAnalysisPrompt,
    this.interviewPrompt,
    this.aiSecondInterviewPrompt,
    required this.interviewLanguage,
    required this.featured,
    required this.applicants,
    required this.views,
    required this.featuredJobs,
    required this.createdAt,
    required this.updatedAt,
    required this.postedBy,
  });

  /// Create Job from JSON
  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['id'] as String,
      slug: json['slug'] as String,
      title: json['title'] as String,
      department: json['department'] as String,
      location: json['location'] as String,
      salary: json['salary'] as String,
      type: JobType.fromString(json['type'] as String),
      deadline: DateTime.parse(json['deadline'] as String),
      description: json['description'] as String,
      shortDescription: json['shortDescription'] as String,
      responsibilities: json['responsibilities'] as String,
      requirements: json['requirements'] as String,
      benefits: json['benefits'] as String,
      skills: (json['skills'] as List<dynamic>).map((e) => e as String).toList(),
      experience: json['experience'] as String,
      education: json['education'] as String,
      jobLevel: JobLevel.fromString(json['jobLevel'] as String),
      workType: WorkType.fromString(json['workType'] as String),
      industry: json['industry'] as String,
      companyDescription: json['companyDescription'] as String,
      status: JobStatus.fromString(json['status'] as String),
      company: Company.fromJson(json['company'] as Map<String, dynamic>),
      cvAnalysisPrompt: json['cvAnalysisPrompt'] as String?,
      interviewPrompt: json['interviewPrompt'] as String?,
      aiSecondInterviewPrompt: json['aiSecondInterviewPrompt'] as String?,
      interviewLanguage: json['interviewLanguage'] as String,
      featured: json['featured'] as bool,
      applicants: (json['applicants'] as num).toDouble(),
      views: (json['views'] as num).toDouble(),
      featuredJobs: json['featuredJobs'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      postedBy: User.fromJson(json['postedBy'] as Map<String, dynamic>),
    );
  }

  /// Convert Job to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'slug': slug,
      'title': title,
      'department': department,
      'location': location,
      'salary': salary,
      'type': type.toJson(),
      'deadline': deadline.toIso8601String(),
      'description': description,
      'shortDescription': shortDescription,
      'responsibilities': responsibilities,
      'requirements': requirements,
      'benefits': benefits,
      'skills': skills,
      'experience': experience,
      'education': education,
      'jobLevel': jobLevel.toJson(),
      'workType': workType.toJson(),
      'industry': industry,
      'companyDescription': companyDescription,
      'status': status.toJson(),
      'company': company.toJson(),
      'cvAnalysisPrompt': cvAnalysisPrompt,
      'interviewPrompt': interviewPrompt,
      'aiSecondInterviewPrompt': aiSecondInterviewPrompt,
      'interviewLanguage': interviewLanguage,
      'featured': featured,
      'applicants': applicants,
      'views': views,
      'featuredJobs': featuredJobs,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'postedBy': postedBy.toJson(),
    };
  }

  /// Check if job is expired
  bool get isExpired => deadline.isBefore(DateTime.now());

  /// Check if job is active
  bool get isActive => status == JobStatus.active && !isExpired;

  /// Get days remaining until deadline
  int get daysRemaining {
    final diff = deadline.difference(DateTime.now());
    return diff.inDays;
  }

  /// Get formatted deadline
  String get formattedDeadline {
    final days = daysRemaining;
    if (days < 0) return 'Expired';
    if (days == 0) return 'Expires today';
    if (days == 1) return 'Expires tomorrow';
    if (days < 7) return 'Expires in $days days';
    if (days < 30) return 'Expires in ${(days / 7).ceil()} weeks';
    return 'Expires in ${(days / 30).ceil()} months';
  }

  @override
  String toString() {
    return 'Job(id: $id, title: $title, company: ${company.name}, status: ${status.name})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Job && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
