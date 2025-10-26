import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/models/job.dart';
import 'package:rolevateapp/models/user.dart';
import 'package:rolevateapp/models/application.dart';
import 'package:rolevateapp/models/company.dart';
import 'package:rolevateapp/models/enums.dart';

/// Mock Data Service for Offline Development and Testing
///
/// This service provides mock data when the backend is not available
/// or for testing purposes. It simulates the GraphQL API responses.
///
class MockDataService {
  static final MockDataService _instance = MockDataService._internal();
  factory MockDataService() => _instance;
  MockDataService._internal();

  // Mock data storage
  final List<User> _users = [];
  final List<Job> _jobs = [];
  final List<Application> _applications = [];
  final List<Company> _companies = [];

  // Initialize with sample data
  void initialize() {
    if (_users.isNotEmpty) return; // Already initialized

    _createMockUsers();
    _createMockCompanies();
    _createMockJobs();
    _createMockApplications();

    debugPrint('🎭 Mock data service initialized with:');
    debugPrint('  👥 ${_users.length} users');
    debugPrint('  🏢 ${_companies.length} companies');
    debugPrint('  💼 ${_jobs.length} jobs');
    debugPrint('  📝 ${_applications.length} applications');
  }

  // Mock data creation methods

  void _createMockUsers() {
    _users.addAll([
      User(
        id: 'user_1',
        name: 'John Candidate',
        email: 'john.candidate@email.com',
        userType: UserType.candidate,
        phone: '+1234567890',
        isActive: true,
        createdAt: DateTime.now().subtract(const Duration(days: 30)),
        updatedAt: DateTime.now(),
      ),
      User(
        id: 'user_2',
        name: 'Sarah Business',
        email: 'sarah.business@email.com',
        userType: UserType.business,
        phone: '+1234567891',
        isActive: true,
        createdAt: DateTime.now().subtract(const Duration(days: 25)),
        updatedAt: DateTime.now(),
      ),
      User(
        id: 'user_3',
        name: 'Mike Developer',
        email: 'mike.dev@email.com',
        userType: UserType.candidate,
        phone: '+1234567892',
        isActive: true,
        createdAt: DateTime.now().subtract(const Duration(days: 20)),
        updatedAt: DateTime.now(),
      ),
      User(
        id: 'user_4',
        name: 'TechCorp Inc',
        email: 'hr@techcorp.com',
        userType: UserType.business,
        phone: '+1234567893',
        isActive: true,
        createdAt: DateTime.now().subtract(const Duration(days: 15)),
        updatedAt: DateTime.now(),
      ),
    ]);
  }

  void _createMockCompanies() {
    _companies.addAll([
      Company(
        id: 'company_1',
        name: 'TechCorp Solutions',
        description: 'Leading technology company specializing in innovative software solutions.',
        website: 'https://techcorp.com',
        location: 'San Francisco, CA',
        industry: 'Technology',
        createdAt: DateTime.now().subtract(const Duration(days: 365)),
        updatedAt: DateTime.now(),
      ),
      Company(
        id: 'company_2',
        name: 'InnovateLabs Inc',
        description: 'Cutting-edge research and development company.',
        website: 'https://innovatelabs.com',
        location: 'Austin, TX',
        industry: 'Technology',
        createdAt: DateTime.now().subtract(const Duration(days: 200)),
        updatedAt: DateTime.now(),
      ),
      Company(
        id: 'company_3',
        name: 'Digital Dynamics',
        description: 'Digital transformation and software development experts.',
        website: 'https://digitaldynamics.com',
        location: 'New York, NY',
        industry: 'Technology',
        createdAt: DateTime.now().subtract(const Duration(days: 150)),
        updatedAt: DateTime.now(),
      ),
    ]);
  }

  void _createMockJobs() {
    final businessUsers = _users.where((u) => u.userType == UserType.business).toList();

    _jobs.addAll([
      Job(
        id: 'job_1',
        title: 'Senior Flutter Developer',
        slug: 'senior-flutter-developer',
        department: 'Engineering',
        location: 'San Francisco, CA',
        salary: '120000',
        type: JobType.fullTime,
        jobLevel: JobLevel.senior,
        workType: WorkType.remote,
        description: 'We are looking for an experienced Flutter developer to join our mobile team. You will be responsible for developing and maintaining cross-platform mobile applications using Flutter.',
        shortDescription: 'Join our team as a Senior Flutter Developer and build amazing mobile experiences.',
        responsibilities: '• Develop and maintain Flutter applications\n• Collaborate with design and backend teams\n• Write clean, maintainable code\n• Participate in code reviews',
        requirements: '• 3+ years Flutter experience\n• Strong Dart knowledge\n• Experience with state management\n• Git version control',
        benefits: '• Competitive salary\n• Health insurance\n• Remote work\n• Professional development',
        skills: ['Flutter', 'Dart', 'Firebase', 'Mobile Development'],
        deadline: DateTime.now().add(const Duration(days: 30)),
        status: JobStatus.active,
        featured: true,
        company: _companies[0],
        postedBy: businessUsers[0],
        applicants: 0.0,
        views: 0.0,
        createdAt: DateTime.now().subtract(const Duration(days: 7)),
        updatedAt: DateTime.now(),
      ),
      Job(
        id: 'job_2',
        title: 'Full Stack Developer',
        slug: 'full-stack-developer',
        department: 'Engineering',
        location: 'Austin, TX',
        salary: '95000',
        type: JobType.fullTime,
        jobLevel: JobLevel.mid,
        workType: WorkType.hybrid,
        description: 'Join our development team as a Full Stack Developer. You will work on both frontend and backend technologies to deliver end-to-end solutions.',
        shortDescription: 'Full Stack Developer opportunity with modern tech stack.',
        responsibilities: '• Develop frontend and backend features\n• Design and implement APIs\n• Database design and optimization\n• Code reviews and mentoring',
        requirements: '• 2+ years full stack experience\n• React/Vue and Node.js\n• Database experience\n• RESTful API design',
        benefits: '• Competitive compensation\n• Flexible hours\n• Learning budget\n• Team events',
        skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'REST APIs'],
        deadline: DateTime.now().add(const Duration(days: 21)),
        status: JobStatus.active,
        featured: false,
        company: _companies[1],
        postedBy: businessUsers[1],
        applicants: 0.0,
        views: 0.0,
        createdAt: DateTime.now().subtract(const Duration(days: 3)),
        updatedAt: DateTime.now(),
      ),
      Job(
        id: 'job_3',
        title: 'UI/UX Designer',
        slug: 'ui-ux-designer',
        department: 'Design',
        location: 'New York, NY',
        salary: '85000',
        type: JobType.fullTime,
        jobLevel: JobLevel.mid,
        workType: WorkType.onsite,
        description: 'We are seeking a talented UI/UX Designer to create beautiful and intuitive user experiences for our products.',
        shortDescription: 'Create amazing user experiences for our growing platform.',
        responsibilities: '• Design user interfaces and experiences\n• Create wireframes and prototypes\n• Collaborate with development team\n• User research and testing',
        requirements: '• 3+ years UI/UX design experience\n• Proficiency in Figma/Sketch\n• Portfolio showcasing design work\n• Understanding of design systems',
        benefits: '• Creative work environment\n• Design tools budget\n• Health benefits\n• Professional growth',
        skills: ['UI/UX Design', 'Figma', 'Prototyping', 'User Research'],
        deadline: DateTime.now().add(const Duration(days: 14)),
        status: JobStatus.active,
        featured: true,
        company: _companies[0],
        postedBy: businessUsers[1],
        applicants: 0.0,
        views: 0.0,
        createdAt: DateTime.now().subtract(const Duration(days: 10)),
        updatedAt: DateTime.now(),
      ),
      Job(
        id: 'job_4',
        title: 'DevOps Engineer',
        slug: 'devops-engineer',
        department: 'Engineering',
        location: 'Remote',
        salary: '110000',
        type: JobType.fullTime,
        jobLevel: JobLevel.senior,
        workType: WorkType.remote,
        description: 'Looking for an experienced DevOps Engineer to help scale our infrastructure and improve our deployment processes.',
        shortDescription: 'Scale our infrastructure and automate deployments.',
        responsibilities: '• Manage cloud infrastructure\n• Automate deployment pipelines\n• Monitor system performance\n• Implement security best practices',
        requirements: '• 4+ years DevOps experience\n• AWS/Azure/GCP expertise\n• Docker and Kubernetes\n• CI/CD pipeline experience',
        benefits: '• Remote work\n• Competitive salary\n• Tech conferences\n• Learning opportunities',
        skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
        deadline: DateTime.now().add(const Duration(days: 45)),
        status: JobStatus.active,
        featured: false,
        company: _companies[1],
        postedBy: businessUsers[1],
        applicants: 0.0,
        views: 0.0,
        createdAt: DateTime.now().subtract(const Duration(days: 3)),
        updatedAt: DateTime.now(),
      ),
    ]);
  }

  void _createMockApplications() {
    final candidateUsers = _users.where((u) => u.userType == UserType.candidate).toList();

    _applications.addAll([
      Application(
        id: 'application_1',
        job: _jobs[0],
        candidate: candidateUsers[0],
        status: ApplicationStatus.pending,
        coverLetter: 'I am very interested in this position and believe my skills would be a great fit.',
        expectedSalary: '115000',
        noticePeriod: '30',
        resumeUrl: 'https://example.com/resume1.pdf',
        appliedAt: DateTime.now().subtract(const Duration(days: 2)),
        interviewScheduled: false,
        interviewLanguage: 'en',
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
        updatedAt: DateTime.now(),
      ),
      Application(
        id: 'application_2',
        job: _jobs[1],
        candidate: candidateUsers[1],
        status: ApplicationStatus.reviewed,
        coverLetter: 'I would love to contribute to your innovative projects.',
        expectedSalary: '90000',
        noticePeriod: '14',
        resumeUrl: 'https://example.com/resume2.pdf',
        appliedAt: DateTime.now().subtract(const Duration(days: 5)),
        interviewScheduled: false,
        interviewLanguage: 'en',
        createdAt: DateTime.now().subtract(const Duration(days: 5)),
        updatedAt: DateTime.now(),
      ),
      Application(
        id: 'application_3',
        job: _jobs[2],
        candidate: candidateUsers[0],
        status: ApplicationStatus.shortlisted,
        coverLetter: 'My design background would be perfect for this role.',
        expectedSalary: '80000',
        noticePeriod: '21',
        resumeUrl: 'https://example.com/resume3.pdf',
        appliedAt: DateTime.now().subtract(const Duration(days: 1)),
        interviewScheduled: false,
        interviewLanguage: 'en',
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        updatedAt: DateTime.now(),
      ),
    ]);
  }

  // Mock API methods that simulate GraphQL responses

  Future<List<Job>> getJobs({
    int? limit,
    int? offset,
    String? department,
    String? location,
    JobType? type,
    JobLevel? jobLevel,
    WorkType? workType,
    bool? featured,
  }) async {
    await _simulateNetworkDelay();

    var filteredJobs = _jobs.where((job) => job.status == JobStatus.active).toList();

    if (department != null) {
      filteredJobs = filteredJobs.where((job) => job.department == department).toList();
    }
    if (location != null) {
      filteredJobs = filteredJobs.where((job) =>
        job.location.toLowerCase().contains(location.toLowerCase())).toList();
    }
    if (type != null) {
      filteredJobs = filteredJobs.where((job) => job.type == type).toList();
    }
    if (jobLevel != null) {
      filteredJobs = filteredJobs.where((job) => job.jobLevel == jobLevel).toList();
    }
    if (workType != null) {
      filteredJobs = filteredJobs.where((job) => job.workType == workType).toList();
    }
    if (featured != null && featured) {
      filteredJobs = filteredJobs.where((job) => job.featured).toList();
    }

    // Apply pagination
    final start = offset ?? 0;
    final end = limit != null ? start + limit : filteredJobs.length;
    final paginatedJobs = filteredJobs.sublist(
      start,
      end > filteredJobs.length ? filteredJobs.length : end,
    );

    return paginatedJobs;
  }

  Future<Job?> getJob(String id) async {
    await _simulateNetworkDelay();
    return _jobs.firstWhereOrNull((job) => job.id == id);
  }

  Future<List<Application>> getMyApplications() async {
    await _simulateNetworkDelay();
    // Return applications for the first candidate user (simulating current user)
    final currentUser = _users.firstWhereOrNull((u) => u.userType == UserType.candidate);
    if (currentUser == null) return [];

    return _applications.where((app) => app.candidate?.id == currentUser.id).toList();
  }

  Future<List<Job>> getSavedJobs() async {
    await _simulateNetworkDelay();
    // Return first 2 jobs as "saved" for demo purposes
    return _jobs.take(2).toList();
  }

  Future<bool> isJobSaved(String jobId) async {
    await _simulateNetworkDelay();
    // Simulate that first 2 jobs are saved
    final savedJobIds = _jobs.take(2).map((job) => job.id).toList();
    return savedJobIds.contains(jobId);
  }

  Future<void> saveJob(String jobId) async {
    await _simulateNetworkDelay();
    // In a real implementation, this would update the backend
    debugPrint('🎭 Mock: Saved job $jobId');
  }

  Future<void> unsaveJob(String jobId) async {
    await _simulateNetworkDelay();
    // In a real implementation, this would update the backend
    debugPrint('🎭 Mock: Unsaved job $jobId');
  }

  Future<User?> login(String email, String password) async {
    await _simulateNetworkDelay();

    final user = _users.firstWhereOrNull((u) => u.email == email);
    if (user != null && password == 'password123') {
      return user;
    }
    return null;
  }

  Future<User?> createUser({
    required String name,
    required String email,
    required String password,
    required UserType userType,
    String? phone,
  }) async {
    await _simulateNetworkDelay();

    final newUser = User(
      id: 'user_${_users.length + 1}',
      name: name,
      email: email,
      userType: userType,
      phone: phone,
      isActive: true,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    _users.add(newUser);
    return newUser;
  }

  Future<Application?> createApplication({
    required String jobId,
    required String candidateId,
    String? coverLetter,
    int? expectedSalary,
    int? noticePeriod,
    String? resumeUrl,
  }) async {
    await _simulateNetworkDelay();

    final job = _jobs.firstWhereOrNull((j) => j.id == jobId);
    final candidate = _users.firstWhereOrNull((u) => u.id == candidateId);

    if (job == null || candidate == null) return null;

    final newApplication = Application(
      id: 'application_${_applications.length + 1}',
      job: job,
      candidate: candidate,
      status: ApplicationStatus.pending,
      coverLetter: coverLetter,
      expectedSalary: expectedSalary?.toString(),
      noticePeriod: noticePeriod?.toString(),
      resumeUrl: resumeUrl,
      appliedAt: DateTime.now(),
      interviewScheduled: false,
      interviewLanguage: 'en',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    _applications.add(newApplication);
    return newApplication;
  }

  // Utility methods

  Future<void> _simulateNetworkDelay() async {
    // Simulate network latency
    await Future.delayed(const Duration(milliseconds: 500));
  }

  // Export mock data as JSON (useful for debugging)
  String exportData() {
    final data = {
      'users': _users.map((u) => u.toJson()).toList(),
      'companies': _companies.map((c) => c.toJson()).toList(),
      'jobs': _jobs.map((j) => j.toJson()).toList(),
      'applications': _applications.map((a) => a.toJson()).toList(),
    };
    return JsonEncoder.withIndent('  ').convert(data);
  }

  // Clear all mock data
  void clearData() {
    _users.clear();
    _companies.clear();
    _jobs.clear();
    _applications.clear();
  }
}