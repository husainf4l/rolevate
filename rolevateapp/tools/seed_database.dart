import 'package:flutter/foundation.dart';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

/// Database Seeding Script for RoleVate
///
/// This script populates the RoleVate backend with comprehensive test data
/// for development and testing purposes.
///
/// Usage:
///   dart run tools/seed_database.dart [options]
///
/// Options:
///   --api-url=url     GraphQL API URL (default: https://rolevate.com/api/graphql)
///   --clear           Clear existing data before seeding
///   --users=count     Number of users to create (default: 50)
///   --jobs=count      Number of jobs to create (default: 100)
///   --applications=count Number of applications to create (default: 200)

class DatabaseSeeder {
  final String apiUrl;
  final bool clearExisting;
  final int userCount;
  final int jobCount;
  final int applicationCount;

  DatabaseSeeder({
    required this.apiUrl,
    required this.clearExisting,
    required this.userCount,
    required this.jobCount,
    required this.applicationCount,
  });

  /// Run the seeding process
  Future<void> seed() async {
    debugPrint('🚀 Starting RoleVate Database Seeding');
    debugPrint('API URL: $apiUrl');
    debugPrint('Clear existing: $clearExisting');
    debugPrint('Users to create: $userCount');
    debugPrint('Jobs to create: $jobCount');
    debugPrint('Applications to create: $applicationCount');
    debugPrint('');

    if (clearExisting) {
      await _clearExistingData();
    }

    final users = await _seedUsers();
    final companies = await _seedCompanies();
    final jobs = await _seedJobs(users, companies);
    await _seedApplications(users, jobs);

    debugPrint('✅ Database seeding completed successfully!');
  }

  /// Clear existing data
  Future<void> _clearExistingData() async {
    debugPrint('🧹 Clearing existing data...');

    // Note: This would require admin mutations to clear data
    // For now, we'll skip this step as it's backend-specific
    debugPrint('⚠️  Clear existing data not implemented (requires admin permissions)');
  }

  /// Seed users (both business and candidate types)
  Future<List<Map<String, dynamic>>> _seedUsers() async {
    debugPrint('👥 Seeding users...');

    final users = <Map<String, dynamic>>[];
    final businessUsers = userCount ~/ 2;
    final candidateUsers = userCount - businessUsers;

    // Create business users
    for (int i = 1; i <= businessUsers; i++) {
      final user = await _createUser(
        name: 'Business User $i',
        email: 'business$i@rolevate.test',
        password: 'password123',
        userType: 'BUSINESS',
        phone: '+1${_randomPhone()}',
      );
      if (user != null) {
        users.add(user);
        debugPrint('  ✅ Created business user: ${user['name']}');
      }
    }

    // Create candidate users
    for (int i = 1; i <= candidateUsers; i++) {
      final user = await _createUser(
        name: 'Candidate User $i',
        email: 'candidate$i@rolevate.test',
        password: 'password123',
        userType: 'CANDIDATE',
        phone: '+1${_randomPhone()}',
      );
      if (user != null) {
        users.add(user);
        debugPrint('  ✅ Created candidate user: ${user['name']}');
      }
    }

    debugPrint('✅ Created ${users.length} users');
    return users;
  }

  /// Seed companies
  Future<List<Map<String, dynamic>>> _seedCompanies() async {
    debugPrint('🏢 Seeding companies...');

    final companies = <Map<String, dynamic>>[];
    final companyNames = [
      'TechCorp Solutions',
      'InnovateLabs Inc',
      'Digital Dynamics',
      'Future Systems LLC',
      'SmartTech Industries',
      'CodeMasters Corp',
      'DataDriven Solutions',
      'CloudNine Technologies',
      'NextGen Software',
      'AgileWorks Inc',
      'ByteSize Technologies',
      'Quantum Computing Co',
      'AI Solutions Group',
      'MobileFirst Apps',
      'WebWorks Studio',
    ];

    for (final name in companyNames) {
      final company = await _createCompany(
        name: name,
        description: 'Leading technology company specializing in innovative solutions.',
        website: 'https://${name.toLowerCase().replaceAll(' ', '').replaceAll(',', '')}.com',
        location: _randomLocation(),
        industry: 'Technology',
      );
      if (company != null) {
        companies.add(company);
        debugPrint('  ✅ Created company: ${company['name']}');
      }
    }

    debugPrint('✅ Created ${companies.length} companies');
    return companies;
  }

  /// Seed jobs
  Future<List<Map<String, dynamic>>> _seedJobs(
    List<Map<String, dynamic>> users,
    List<Map<String, dynamic>> companies,
  ) async {
    debugPrint('💼 Seeding jobs...');

    final jobs = <Map<String, dynamic>>[];
    final businessUsers = users.where((u) => u['userType'] == 'BUSINESS').toList();

    final jobTitles = [
      'Senior Flutter Developer',
      'Full Stack Developer',
      'Mobile App Developer',
      'Frontend Developer',
      'Backend Developer',
      'DevOps Engineer',
      'Software Architect',
      'Product Manager',
      'UI/UX Designer',
      'Data Scientist',
      'Machine Learning Engineer',
      'QA Engineer',
      'Technical Lead',
      'Software Engineer',
      'Junior Developer',
    ];

    final departments = [
      'Engineering',
      'Product',
      'Design',
      'Data Science',
      'DevOps',
      'Quality Assurance',
    ];

    final locations = [
      'San Francisco, CA',
      'New York, NY',
      'Austin, TX',
      'Seattle, WA',
      'Boston, MA',
      'Los Angeles, CA',
      'Chicago, IL',
      'Denver, CO',
      'Remote',
      'Hybrid',
    ];

    for (int i = 1; i <= jobCount; i++) {
      final businessUser = businessUsers[i % businessUsers.length];
      final company = companies[i % companies.length];

      final job = await _createJob(
        title: jobTitles[i % jobTitles.length],
        department: departments[i % departments.length],
        location: locations[i % locations.length],
        salary: _randomSalary(),
        type: _randomJobType(),
        jobLevel: _randomJobLevel(),
        workType: _randomWorkType(),
        description: _generateJobDescription(),
        shortDescription: 'Exciting opportunity for a skilled developer to join our team.',
        responsibilities: _generateResponsibilities(),
        requirements: _generateRequirements(),
        benefits: _generateBenefits(),
        skills: _generateSkills(),
        deadline: DateTime.now().add(Duration(days: _randomInt(7, 90))),
        postedById: businessUser['id'],
        companyId: company['id'],
      );

      if (job != null) {
        jobs.add(job);
        debugPrint('  ✅ Created job: ${job['title']} at ${company['name']}');
      }
    }

    debugPrint('✅ Created ${jobs.length} jobs');
    return jobs;
  }

  /// Seed applications
  Future<void> _seedApplications(
    List<Map<String, dynamic>> users,
    List<Map<String, dynamic>> jobs,
  ) async {
    debugPrint('📝 Seeding applications...');

    final candidateUsers = users.where((u) => u['userType'] == 'CANDIDATE').toList();
    int createdCount = 0;

    for (int i = 1; i <= applicationCount; i++) {
      final candidate = candidateUsers[i % candidateUsers.length];
      final job = jobs[i % jobs.length];

      // Skip if this candidate already applied to this job
      final existingApplication = await _checkExistingApplication(candidate['id'], job['id']);
      if (existingApplication) continue;

      final application = await _createApplication(
        jobId: job['id'],
        candidateId: candidate['id'],
        coverLetter: _generateCoverLetter(),
        expectedSalary: _randomSalary(),
        noticePeriod: _randomInt(0, 90),
        resumeUrl: 'https://example.com/resume.pdf',
        linkedinUrl: 'https://linkedin.com/in/${candidate['name'].toLowerCase().replaceAll(' ', '')}',
        portfolioUrl: 'https://portfolio.com/${candidate['name'].toLowerCase().replaceAll(' ', '')}',
      );

      if (application != null) {
        createdCount++;
        debugPrint('  ✅ Created application: ${candidate['name']} → ${job['title']}');

        // Randomly update some applications with different statuses
        if (_randomInt(0, 10) < 3) { // 30% chance
          await _updateApplicationStatus(
            application['id'],
            _randomApplicationStatus(),
          );
        }
      }
    }

    debugPrint('✅ Created $createdCount applications');
  }

  // Helper methods for creating entities

  Future<Map<String, dynamic>?> _createUser({
    required String name,
    required String email,
    required String password,
    required String userType,
    String? phone,
  }) async {
    final mutation = '''
      mutation CreateUser(\$input: CreateUserInput!) {
        createUser(input: \$input) {
          id
          name
          email
          userType
          phone
        }
      }
    ''';

    final variables = {
      'input': {
        'name': name,
        'email': email,
        'password': password,
        'userType': userType,
        if (phone != null) 'phone': phone,
      }
    };

    final response = await _graphqlRequest(mutation, variables);
    return response?['createUser'];
  }

  Future<Map<String, dynamic>?> _createCompany({
    required String name,
    required String description,
    required String website,
    required String location,
    required String industry,
  }) async {
    // Note: This would require a createCompany mutation
    // For now, return mock data
    return {
      'id': 'company_${name.hashCode}',
      'name': name,
      'description': description,
      'website': website,
      'location': location,
      'industry': industry,
    };
  }

  Future<Map<String, dynamic>?> _createJob({
    required String title,
    required String department,
    required String location,
    required int salary,
    required String type,
    required String jobLevel,
    required String workType,
    required String description,
    required String shortDescription,
    String? responsibilities,
    String? requirements,
    String? benefits,
    String? skills,
    required DateTime deadline,
    required String postedById,
    required String companyId,
  }) async {
    final mutation = '''
      mutation CreateJob(\$input: CreateJobInput!) {
        createJob(input: \$input) {
          id
          title
          department
          location
          salary
          type
          jobLevel
          workType
          description
          shortDescription
          responsibilities
          requirements
          benefits
          skills
          deadline
          createdAt
        }
      }
    ''';

    final variables = {
      'input': {
        'title': title,
        'department': department,
        'location': location,
        'salary': salary,
        'type': type,
        'jobLevel': jobLevel,
        'workType': workType,
        'description': description,
        'shortDescription': shortDescription,
        if (responsibilities != null) 'responsibilities': responsibilities,
        if (requirements != null) 'requirements': requirements,
        if (benefits != null) 'benefits': benefits,
        if (skills != null) 'skills': skills,
        'deadline': deadline.toIso8601String(),
        'postedById': postedById,
        'companyId': companyId,
      }
    };

    final response = await _graphqlRequest(mutation, variables);
    return response?['createJob'];
  }

  Future<Map<String, dynamic>?> _createApplication({
    required String jobId,
    required String candidateId,
    String? coverLetter,
    int? expectedSalary,
    int? noticePeriod,
    String? resumeUrl,
    String? linkedinUrl,
    String? portfolioUrl,
  }) async {
    final mutation = '''
      mutation CreateApplication(\$input: CreateApplicationInput!) {
        createApplication(input: \$input) {
          id
          jobId
          candidateId
          status
          appliedAt
        }
      }
    ''';

    final variables = {
      'input': {
        'jobId': jobId,
        'candidateId': candidateId,
        if (coverLetter != null) 'coverLetter': coverLetter,
        if (expectedSalary != null) 'expectedSalary': expectedSalary,
        if (noticePeriod != null) 'noticePeriod': noticePeriod,
        if (resumeUrl != null) 'resumeUrl': resumeUrl,
        if (linkedinUrl != null) 'linkedinUrl': linkedinUrl,
        if (portfolioUrl != null) 'portfolioUrl': portfolioUrl,
      }
    };

    final response = await _graphqlRequest(mutation, variables);
    return response?['createApplication'];
  }

  Future<bool> _checkExistingApplication(String candidateId, String jobId) async {
    // This would check if an application already exists
    // For simplicity, we'll assume no duplicates in seeding
    return false;
  }

  Future<void> _updateApplicationStatus(String applicationId, String status) async {
    final mutation = '''
      mutation UpdateApplication(\$id: ID!, \$input: UpdateApplicationInput!) {
        updateApplication(id: \$id, input: \$input) {
          id
          status
        }
      }
    ''';

    final variables = {
      'id': applicationId,
      'input': {'status': status}
    };

    await _graphqlRequest(mutation, variables);
  }

  // Utility methods

  Future<Map<String, dynamic>?> _graphqlRequest(String query, Map<String, dynamic> variables) async {
    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'query': query,
          'variables': variables,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['errors'] != null) {
          debugPrint('❌ GraphQL Error: ${data['errors']}');
          return null;
        }
        return data['data'];
      } else {
        debugPrint('❌ HTTP Error: ${response.statusCode} - ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('❌ Request Error: $e');
      return null;
    }
  }

  // Data generation helpers

  String _randomPhone() {
    final area = _randomInt(200, 999);
    final exchange = _randomInt(200, 999);
    final number = _randomInt(1000, 9999);
    return '$area$exchange$number';
  }

  String _randomLocation() {
    final locations = [
      'San Francisco, CA',
      'New York, NY',
      'Austin, TX',
      'Seattle, WA',
      'Boston, MA',
      'Los Angeles, CA',
    ];
    return locations[_randomInt(0, locations.length - 1)];
  }

  int _randomSalary() {
    // Salary between $50k and $200k
    return _randomInt(50000, 200000);
  }

  String _randomJobType() {
    final types = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'];
    return types[_randomInt(0, types.length - 1)];
  }

  String _randomJobLevel() {
    final levels = ['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'];
    return levels[_randomInt(0, levels.length - 1)];
  }

  String _randomWorkType() {
    final types = ['REMOTE', 'ONSITE', 'HYBRID'];
    return types[_randomInt(0, types.length - 1)];
  }

  String _randomApplicationStatus() {
    final statuses = [
      'PENDING',
      'REVIEWED',
      'ANALYZED',
      'SHORTLISTED',
      'INTERVIEWED',
      'OFFERED',
      'REJECTED',
    ];
    return statuses[_randomInt(0, statuses.length - 1)];
  }

  int _randomInt(int min, int max) {
    return min + (DateTime.now().millisecondsSinceEpoch % (max - min + 1));
  }

  String _generateJobDescription() {
    return '''
We are looking for a talented developer to join our team and contribute to exciting projects.

As part of our development team, you will work on cutting-edge technologies and collaborate with a diverse group of professionals. You will have the opportunity to learn new skills, take ownership of features, and make a significant impact on our products.

We offer competitive compensation, excellent benefits, and a supportive work environment that encourages growth and innovation.
    '''.trim();
  }

  String _generateResponsibilities() {
    return '''
• Design, develop, and maintain high-quality software applications
• Collaborate with cross-functional teams to deliver features on time
• Write clean, maintainable, and well-documented code
• Participate in code reviews and provide constructive feedback
• Troubleshoot and resolve complex technical issues
• Stay up-to-date with industry trends and best practices
    '''.trim();
  }

  String _generateRequirements() {
    return '''
• Bachelor's degree in Computer Science or related field
• 3+ years of experience in software development
• Proficiency in relevant programming languages and frameworks
• Strong problem-solving and analytical skills
• Experience with version control systems (Git)
• Excellent communication and teamwork abilities
• Knowledge of software development best practices
    '''.trim();
  }

  String _generateBenefits() {
    return '''
• Competitive salary and equity package
• Comprehensive health, dental, and vision insurance
• Flexible work arrangements and remote work options
• Professional development budget
• Unlimited PTO policy
• Modern office with amenities
• Team building events and company retreats
    '''.trim();
  }

  String _generateSkills() {
    return 'Flutter,Dart,Firebase,REST APIs,GraphQL,Git,Agile,Scrum';
  }

  String _generateCoverLetter() {
    return '''
Dear Hiring Manager,

I am excited to apply for the position at your company. With my background in software development and passion for creating innovative solutions, I am confident that I would be a valuable addition to your team.

Throughout my career, I have developed strong skills in various technologies and frameworks, and I am always eager to learn new tools and approaches. I am particularly drawn to your company's mission and the opportunity to work on challenging projects that make a real impact.

I would welcome the opportunity to discuss how my skills and experience align with your needs. Thank you for considering my application.

Best regards,
[Candidate Name]
    '''.trim();
  }
}

void main(List<String> args) async {
  // Parse command line arguments
  String apiUrl = 'https://rolevate.com/api/graphql';
  bool clearExisting = false;
  int userCount = 50;
  int jobCount = 100;
  int applicationCount = 200;

  for (final arg in args) {
    if (arg.startsWith('--api-url=')) {
      apiUrl = arg.substring('--api-url='.length);
    } else if (arg == '--clear') {
      clearExisting = true;
    } else if (arg.startsWith('--users=')) {
      userCount = int.tryParse(arg.substring('--users='.length)) ?? userCount;
    } else if (arg.startsWith('--jobs=')) {
      jobCount = int.tryParse(arg.substring('--jobs='.length)) ?? jobCount;
    } else if (arg.startsWith('--applications=')) {
      applicationCount = int.tryParse(arg.substring('--applications='.length)) ?? applicationCount;
    }
  }

  final seeder = DatabaseSeeder(
    apiUrl: apiUrl,
    clearExisting: clearExisting,
    userCount: userCount,
    jobCount: jobCount,
    applicationCount: applicationCount,
  );

  try {
    await seeder.seed();
    exit(0);
  } catch (e) {
    debugPrint('❌ Seeding failed: $e');
    exit(1);
  }
}