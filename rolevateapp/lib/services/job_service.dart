import 'package:flutter/foundation.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:rolevateapp/models/models.dart';
import 'package:rolevateapp/services/graphql_service.dart';

class JobService {
  JobService();

  /// Fetch jobs with optional filters and pagination
  Future<List<Job>> getJobs({
    JobType? type,
    JobLevel? jobLevel,
    WorkType? workType,
    JobStatus? status,
    String? industry,
    String? location,
    String? department,
    String? companyId,
    bool? featured,
    int? limit,
    int? page,
  }) async {
    debugPrint('🔧 JobService.getJobs called');

    /*
    // TEMPORARY: Mock implementation for testing
    debugPrint('🎭 Using mock implementation for job fetching');

    // Simulate API delay
    await Future.delayed(const Duration(seconds: 1));

    // Create mock jobs data
    final mockJobsData = [
      {
        'id': 'mock-job-1',
        'slug': 'senior-software-engineer',
        'title': 'Senior Software Engineer',
        'department': 'Engineering',
        'location': 'Dubai, UAE',
        'salary': 'AED 25,000 - 35,000',
        'type': 'FULL_TIME',
        'jobLevel': 'SENIOR',
        'workType': 'ONSITE',
        'status': 'ACTIVE',
        'shortDescription': 'We are looking for a Senior Software Engineer to join our team.',
        'applicants': 12.0,
        'views': 156.0,
        'featured': true,
        'deadline': DateTime.now().add(const Duration(days: 14)).toIso8601String(),
        'createdAt': DateTime.now().subtract(const Duration(days: 2)).toIso8601String(),
        'updatedAt': DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
        'company': {
          'id': 'mock-company-1',
          'name': 'TechCorp Solutions',
          'logo': null,
          'industry': 'Technology',
          'size': '201-500',
          'location': 'Dubai, UAE',
        },
        'postedBy': {
          'id': 'mock-user-1',
          'name': 'John Smith',
          'avatar': null,
        },
      },
      {
        'id': 'mock-job-2',
        'slug': 'product-manager',
        'title': 'Product Manager',
        'department': 'Product',
        'location': 'Abu Dhabi, UAE',
        'salary': 'AED 20,000 - 30,000',
        'type': 'FULL_TIME',
        'jobLevel': 'MID',
        'workType': 'HYBRID',
        'status': 'ACTIVE',
        'shortDescription': 'Join our product team to drive innovation and user experience.',
        'applicants': 8.0,
        'views': 89.0,
        'featured': false,
        'deadline': DateTime.now().add(const Duration(days: 21)).toIso8601String(),
        'createdAt': DateTime.now().subtract(const Duration(days: 5)).toIso8601String(),
        'updatedAt': DateTime.now().subtract(const Duration(days: 3)).toIso8601String(),
        'company': {
          'id': 'mock-company-2',
          'name': 'InnovateLabs',
          'logo': null,
          'industry': 'Technology',
          'size': '51-200',
          'location': 'Abu Dhabi, UAE',
        },
        'postedBy': {
          'id': 'mock-user-2',
          'name': 'Sarah Johnson',
          'avatar': null,
        },
      },
      {
        'id': 'mock-job-3',
        'slug': 'ux-designer',
        'title': 'UX Designer',
        'department': 'Design',
        'location': 'Dubai, UAE',
        'salary': 'AED 15,000 - 22,000',
        'type': 'FULL_TIME',
        'jobLevel': 'MID',
        'workType': 'REMOTE',
        'status': 'ACTIVE',
        'shortDescription': 'Create amazing user experiences for our digital products.',
        'applicants': 15.0,
        'views': 203.0,
        'featured': true,
        'deadline': DateTime.now().add(const Duration(days: 7)).toIso8601String(),
        'createdAt': DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
        'updatedAt': DateTime.now().toIso8601String(),
        'company': {
          'id': 'mock-company-3',
          'name': 'DesignStudio',
          'logo': null,
          'industry': 'Design',
          'size': '11-50',
          'location': 'Dubai, UAE',
        },
        'postedBy': {
          'id': 'mock-user-3',
          'name': 'Mike Chen',
          'avatar': null,
        },
      },
    ];

    // Add any newly created jobs to the list
    final allJobsData = [...mockJobsData, ..._mockCreatedJobs];

    debugPrint('✅ Mock jobs fetched successfully (${allJobsData.length} jobs)');
    debugPrint('📊 Mock jobs: ${mockJobsData.length}, Created jobs: ${_mockCreatedJobs.length}');
    if (_mockCreatedJobs.isNotEmpty) {
      debugPrint('🆕 Newly created jobs:');
      for (var job in _mockCreatedJobs) {
        debugPrint('   - ${job['title']} (ID: ${job['id']})');
      }
    }
    return allJobsData.map((json) => Job.fromJson(json)).toList();
    */
    // ORIGINAL CODE - Uncomment when backend is ready
    const String query = '''
      query GetJobs(\$filter: JobFilterInput, \$pagination: PaginationInput) {
        jobs(filter: \$filter, pagination: \$pagination) {
          id
          slug
          title
          department
          location
          salary
          type
          jobLevel
          workType
          status
          shortDescription
          applicants
          views
          featured
          deadline
          createdAt
          updatedAt
          company {
            id
            name
            logo
            industry
            size
            location
          }
          postedBy {
            id
            name
            avatar
          }
        }
      }
    ''';

    final variables = {
      'filter': {
        if (type != null) 'type': type.toJson(),
        if (jobLevel != null) 'jobLevel': jobLevel.toJson(),
        if (workType != null) 'workType': workType.toJson(),
        if (status != null) 'status': status.toJson(),
        if (industry != null) 'industry': industry,
        if (location != null) 'location': location,
        if (department != null) 'department': department,
        if (companyId != null) 'companyId': companyId,
        if (featured != null) 'featured': featured,
      },
      'pagination': {
        if (limit != null) 'limit': limit,
        if (page != null) 'page': page,
      },
    };

    final result = await GraphQLService.client.query(
      QueryOptions(
        document: gql(query),
        variables: variables,
        fetchPolicy: FetchPolicy.networkOnly,
      ),
    );

    if (result.hasException) {
      debugPrint('❌ GraphQL Exception in getJobs: ${result.exception.toString()}');

      // Extract more specific error information
      if (result.exception?.graphqlErrors.isNotEmpty ?? false) {
        for (var error in result.exception!.graphqlErrors) {
          debugPrint('  - GraphQL Error: ${error.message}');
          debugPrint('  - Extensions: ${error.extensions}');
        }
      }

      if (result.exception?.linkException != null) {
        debugPrint('  - Link Exception: ${result.exception!.linkException}');
      }

      throw Exception(result.exception.toString());
    }

    final List<dynamic> jobsData = result.data?['jobs'] ?? [];
    return jobsData.map((json) => Job.fromJson(json)).toList();
    /*
    // ORIGINAL CODE - Uncomment when backend is ready
    const String query = '''
      query GetJobs(\$filter: JobFilterInput, \$pagination: PaginationInput) {
        jobs(filter: \$filter, pagination: \$pagination) {
          id
          slug
          title
          department
          location
          salary
          type
          jobLevel
          workType
          status
          shortDescription
          applicants
          views
          featured
          deadline
          createdAt
          updatedAt
          company {
            id
            name
            logo
            industry
            size
            location
          }
          postedBy {
            id
            name
            avatar
          }
        }
      }
    ''';

    final variables = {
      'filter': {
        if (type != null) 'type': type.toJson(),
        if (jobLevel != null) 'jobLevel': jobLevel.toJson(),
        if (workType != null) 'workType': workType.toJson(),
        if (status != null) 'status': status.toJson(),
        if (industry != null) 'industry': industry,
        if (location != null) 'location': location,
        if (department != null) 'department': department,
        if (companyId != null) 'companyId': companyId,
        if (featured != null) 'featured': featured,
      },
      'pagination': {
        if (limit != null) 'limit': limit,
        if (page != null) 'page': page,
      },
    };

    final result = await GraphQLService.client.query(
      QueryOptions(
        document: gql(query),
        variables: variables,
        fetchPolicy: FetchPolicy.networkOnly,
      ),
    );

    if (result.hasException) {
      debugPrint('❌ GraphQL Exception in getJobs: ${result.exception.toString()}');

      // Extract more specific error information
      if (result.exception?.graphqlErrors.isNotEmpty ?? false) {
        for (var error in result.exception!.graphqlErrors) {
          debugPrint('  - GraphQL Error: ${error.message}');
          debugPrint('  - Extensions: ${error.extensions}');
        }
      }

      if (result.exception?.linkException != null) {
        debugPrint('  - Link Exception: ${result.exception!.linkException}');
      }

      throw Exception(result.exception.toString());
    }

    final List<dynamic> jobsData = result.data?['jobs'] ?? [];
    return jobsData.map((json) => Job.fromJson(json)).toList();
    */
  }

  /// Get a single job by ID
  Future<Job?> getJob(String id) async {
    debugPrint('🔧 JobService.getJob called with id: $id');

    /*
    // TEMPORARY: Mock implementation for testing
    debugPrint('🎭 Using mock implementation for single job fetch');
    debugPrint('📊 Total stored created jobs: ${_mockCreatedJobs.length}');

    // First check if it's a newly created job
    debugPrint('🔍 Checking for newly created job with ID: $id');
    for (var job in _mockCreatedJobs) {
      debugPrint('   - Stored job ID: ${job['id']}, Title: ${job['title']}');
      if (job['id'] == id) {
        debugPrint('✅ Found newly created job: ${job['title']}');
        return Job.fromJson(job);
      }
    }

    debugPrint('❌ Job not found in created jobs, checking mock data...');

    // Return mock job data for the requested ID (only for existing mock jobs)
    if (id == 'mock-job-1') {
      debugPrint('✅ Returning mock job: Senior Software Engineer');
      final mockJobData = {
        'id': id,
        'slug': 'senior-software-engineer',
        'title': 'Senior Software Engineer',
        'department': 'Engineering',
        'location': 'Dubai, UAE',
        'salary': 'AED 25,000 - 35,000',
        'type': 'FULL_TIME',
        'jobLevel': 'SENIOR',
        'workType': 'ONSITE',
        'status': 'ACTIVE',
        'description': 'We are looking for a Senior Software Engineer to join our dynamic team. You will be working on cutting-edge technologies and contributing to innovative projects that impact millions of users.',
        'shortDescription': 'We are looking for a Senior Software Engineer to join our team.',
        'responsibilities': '• Design and develop scalable software solutions\n• Collaborate with cross-functional teams\n• Mentor junior developers\n• Participate in code reviews',
        'requirements': '• 5+ years of software development experience\n• Strong knowledge of Flutter/Dart\n• Experience with GraphQL\n• Bachelor\'s degree in Computer Science',
        'benefits': '• Competitive salary\n• Health insurance\n• Flexible working hours\n• Professional development opportunities',
        'skills': ['Flutter', 'Dart', 'GraphQL', 'Firebase', 'Git'],
        'applicants': 12.0,
        'views': 156.0,
        'featured': true,
        'deadline': DateTime.now().add(const Duration(days: 14)).toIso8601String(),
        'cvAnalysisPrompt': 'Analyze the candidate\'s experience with mobile development',
        'interviewPrompt': 'Focus on technical skills and problem-solving abilities',
        'aiSecondInterviewPrompt': 'Evaluate cultural fit and long-term potential',
        'interviewLanguage': 'English',
        'createdAt': DateTime.now().subtract(const Duration(days: 2)).toIso8601String(),
        'updatedAt': DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
        'company': {
          'id': 'mock-company-1',
          'name': 'TechCorp Solutions',
          'description': 'Leading technology company specializing in mobile and web solutions',
          'website': 'https://techcorp.com',
          'email': 'careers@techcorp.com',
          'phone': '+971-4-123-4567',
          'logo': null,
          'industry': 'Technology',
          'size': '201-500',
          'location': 'Dubai, UAE',
          'founded': '2015',
        },
        'postedBy': {
          'id': 'mock-user-1',
          'name': 'John Smith',
          'email': 'john.smith@techcorp.com',
          'avatar': null,
        },
      };

      debugPrint('✅ Mock job fetched successfully');
      return Job.fromJson(mockJobData);
    }

    // Job not found
    debugPrint('❌ Job not found: $id');
    return null;
    */
    // ORIGINAL CODE - Uncomment when backend is ready
    const String query = '''
      query GetJob(\$id: ID!) {
        job(id: \$id) {
          id
          slug
          title
          department
          location
          salary
          type
          jobLevel
          workType
          status
          description
          shortDescription
          responsibilities
          requirements
          benefits
          skills
          applicants
          views
          featured
          deadline
          cvAnalysisPrompt
          interviewPrompt
          aiSecondInterviewPrompt
          interviewLanguage
          createdAt
          updatedAt
          company {
            id
            name
            logo
            website
            email
            phone
            industry
            size
            location
            description
            founded
          }
          postedBy {
            id
            name
            email
            avatar
          }
        }
      }
    ''';

    final result = await GraphQLService.client.query(
      QueryOptions(
        document: gql(query),
        variables: {'id': id},
        fetchPolicy: FetchPolicy.networkOnly,
      ),
    );

    if (result.hasException) {
      debugPrint('❌ GraphQL Exception in getJob: ${result.exception.toString()}');
      if (result.exception?.graphqlErrors.isNotEmpty ?? false) {
        for (var error in result.exception!.graphqlErrors) {
          debugPrint('  - GraphQL Error: ${error.message}');
          debugPrint('  - Extensions: ${error.extensions}');
        }
      }
      throw Exception(result.exception.toString());
    }

    final jobData = result.data?['job'];
    return jobData != null ? Job.fromJson(jobData) : null;
  }

  /// Get a single job by slug
  Future<Job?> getJobBySlug(String slug) async {
    const String query = '''
      query GetJobBySlug(\$slug: String!) {
        jobBySlug(slug: \$slug) {
          id
          slug
          title
          department
          location
          salary
          type
          jobLevel
          workType
          status
          description
          shortDescription
          responsibilities
          requirements
          benefits
          skills
          applicants
          views
          featured
          deadline
          cvAnalysisPrompt
          interviewPrompt
          aiSecondInterviewPrompt
          createdAt
          updatedAt
          company {
            id
            name
            logo
            website
            email
            phone
            industry
            size
            location
            description
            founded
          }
          postedBy {
            id
            name
            email
            avatar
          }
        }
      }
    ''';

    final result = await GraphQLService.client.query(
      QueryOptions(
        document: gql(query),
        variables: {'slug': slug},
        fetchPolicy: FetchPolicy.networkOnly,
      ),
    );

    if (result.hasException) {
      throw Exception(result.exception.toString());
    }

    final jobData = result.data?['jobBySlug'];
    return jobData != null ? Job.fromJson(jobData) : null;
  }

    /// Get jobs posted by the current user's company
  Future<List<Job>> getCompanyJobs() async {
    debugPrint('🔧 JobService.getCompanyJobs called');

    /*
    // TEMPORARY: Mock implementation for testing
    debugPrint('🎭 Using mock implementation for company jobs fetching');

    // Simulate API delay
    await Future.delayed(const Duration(seconds: 1));

    // Create mock jobs data (same as getJobs but filtered for company)
    final mockJobsData = [
      {
        'id': 'mock-job-1',
        'slug': 'senior-software-engineer',
        'title': 'Senior Software Engineer',
        'department': 'Engineering',
        'location': 'Dubai, UAE',
        'salary': 'AED 25,000 - 35,000',
        'type': 'FULL_TIME',
        'jobLevel': 'SENIOR',
        'workType': 'ONSITE',
        'status': 'ACTIVE',
        'shortDescription': 'We are looking for a Senior Software Engineer to join our team.',
        'applicants': 12.0,
        'views': 156.0,
        'featured': true,
        'deadline': DateTime.now().add(const Duration(days: 14)).toIso8601String(),
        'createdAt': DateTime.now().subtract(const Duration(days: 2)).toIso8601String(),
        'updatedAt': DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
        'company': {
          'id': 'mock-company-1',
          'name': 'TechCorp Solutions',
          'logo': null,
          'industry': 'Technology',
          'size': '201-500',
          'location': 'Dubai, UAE',
        },
        'postedBy': {
          'id': 'mock-user-1',
          'name': 'John Smith',
          'avatar': null,
        },
      },
      {
        'id': 'mock-job-2',
        'slug': 'product-manager',
        'title': 'Product Manager',
        'department': 'Product',
        'location': 'Abu Dhabi, UAE',
        'salary': 'AED 20,000 - 30,000',
        'type': 'FULL_TIME',
        'jobLevel': 'MID',
        'workType': 'HYBRID',
        'status': 'ACTIVE',
        'shortDescription': 'Join our product team to drive innovation and user experience.',
        'applicants': 8.0,
        'views': 89.0,
        'featured': false,
        'deadline': DateTime.now().add(const Duration(days: 21)).toIso8601String(),
        'createdAt': DateTime.now().subtract(const Duration(days: 5)).toIso8601String(),
        'updatedAt': DateTime.now().subtract(const Duration(days: 3)).toIso8601String(),
        'company': {
          'id': 'mock-company-2',
          'name': 'InnovateLabs',
          'logo': null,
          'industry': 'Technology',
          'size': '51-200',
          'location': 'Abu Dhabi, UAE',
        },
        'postedBy': {
          'id': 'mock-user-2',
          'name': 'Sarah Johnson',
          'avatar': null,
        },
      },
    ];

    // Add any newly created jobs to the list
    final allJobsData = [...mockJobsData, ..._mockCreatedJobs];

    debugPrint('✅ Mock company jobs fetched successfully (${allJobsData.length} jobs)');
    debugPrint('📊 Mock jobs: ${mockJobsData.length}, Created jobs: ${_mockCreatedJobs.length}');
    if (_mockCreatedJobs.isNotEmpty) {
      debugPrint('🆕 Newly created jobs:');
      for (var job in _mockCreatedJobs) {
        debugPrint('   - ${job['title']} (ID: ${job['id']})');
      }
    }
    return allJobsData.map((json) => Job.fromJson(json)).toList();
    */
    // ORIGINAL CODE - Uncomment when backend is ready
    const String query = '''
      query GetCompanyJobs {
        companyJobs {
          id
          slug
          title
          department
          location
          salary
          type
          jobLevel
          workType
          status
          applicants
          views
          featured
          deadline
          createdAt
          updatedAt
        }
      }
    ''';

    final result = await GraphQLService.client.query(
      QueryOptions(
        document: gql(query),
        fetchPolicy: FetchPolicy.networkOnly,
      ),
    );

    if (result.hasException) {
      throw Exception(result.exception.toString());
    }

    final List<dynamic> jobsData = result.data?['companyJobs'] ?? [];
    return jobsData.map((json) => Job.fromJson(json)).toList();

    /*
    // ORIGINAL CODE - Uncomment when backend is ready
    const String query = '''
      query GetCompanyJobs {
        companyJobs {
          id
          slug
          title
          department
          location
          salary
          type
          jobLevel
          workType
          status
          applicants
          views
          featured
          deadline
          createdAt
          updatedAt
        }
      }
    ''';

    final result = await GraphQLService.client.query(
      QueryOptions(
        document: gql(query),
        fetchPolicy: FetchPolicy.networkOnly,
      ),
    );

    if (result.hasException) {
      throw Exception(result.exception.toString());
    }

    final List<dynamic> jobsData = result.data?['companyJobs'] ?? [];
    return jobsData.map((json) => Job.fromJson(json)).toList();
    */
  }

  /// Check if a job is saved
  Future<bool> isJobSaved(String jobId) async {
    debugPrint('🔧 JobService.isJobSaved called with jobId: $jobId');

    // TEMPORARY: Mock implementation for testing
    debugPrint('🎭 Using mock implementation for job saved check');

    // Simulate API delay
    await Future.delayed(const Duration(milliseconds: 300));

    // Mock: randomly return true/false for testing
    final isSaved = jobId.hashCode % 2 == 0;
    debugPrint('✅ Job saved status: $isSaved');
    return isSaved;
  }

  /// Save a job to favorites
  Future<bool> saveJob(String jobId, {String? notes}) async {
    debugPrint('🔧 JobService.saveJob called with jobId: $jobId');

    // TEMPORARY: Mock implementation for testing
    debugPrint('🎭 Using mock implementation for job saving');

    // Simulate API delay
    await Future.delayed(const Duration(milliseconds: 500));

    debugPrint('✅ Job saved successfully');
    return true;
  }

  /// Remove a job from favorites
  Future<bool> unsaveJob(String jobId) async {
    debugPrint('🔧 JobService.unsaveJob called with jobId: $jobId');

    // TEMPORARY: Mock implementation for testing
    debugPrint('🎭 Using mock implementation for job unsaving');

    // Simulate API delay
    await Future.delayed(const Duration(milliseconds: 500));

    debugPrint('✅ Job unsaved successfully');
    return true;
  }

  /// Get all saved jobs
  Future<List<SavedJob>> getSavedJobs() async {
    // TEMPORARY: Mock implementation for testing
    debugPrint('🎭 Using mock implementation for getting saved jobs');

    // Simulate API delay
    await Future.delayed(const Duration(milliseconds: 300));

    // Return empty list initially - jobs will be saved as user interacts
    debugPrint('✅ Mock saved jobs fetched successfully (0 jobs)');
    return [];
  }

  /// Create a new job
  Future<Job> createJob({
    required String title,
    required String department,
    required String location,
    required String salary,
    required JobType type,
    required JobLevel jobLevel,
    required WorkType workType,
    required String description,
    required String shortDescription,
    String? responsibilities,
    String? requirements,
    String? benefits,
    List<String>? skills,
    required DateTime deadline,
  }) async {
    debugPrint('🔧 JobService.createJob called with title: $title');
    
    /*
    // TEMPORARY: Mock implementation for testing
    debugPrint('🎭 Using mock implementation for job creation');
    
    // Simulate API delay
    await Future.delayed(const Duration(seconds: 2));
    
    // Create a mock job response
    final mockJobData = {
      'id': 'mock-job-${DateTime.now().millisecondsSinceEpoch}',
      'slug': title.toLowerCase().replaceAll(' ', '-'),
      'title': title,
      'department': department,
      'location': location,
      'salary': salary,
      'type': type.toJson(),
      'jobLevel': jobLevel.toJson(),
      'workType': workType.toJson(),
      'status': 'ACTIVE',
      'description': description,
      'shortDescription': shortDescription,
      'responsibilities': responsibilities,
      'requirements': requirements,
      'benefits': benefits,
      'skills': skills,
      'deadline': deadline.toIso8601String(),
      'createdAt': DateTime.now().toIso8601String(),
      'updatedAt': DateTime.now().toIso8601String(),
      'featured': false,
      'applicants': 0.0,
      'views': 0.0,
      'company': {
        'id': 'mock-company-id',
        'name': 'Mock Company',
        'description': 'A mock company for testing',
        'website': 'https://mockcompany.com',
        'email': 'contact@mockcompany.com',
        'phone': '+971-50-123-4567',
        'logo': null,
        'industry': 'Technology',
        'size': '51-200',
        'location': 'Dubai, UAE',
        'createdAt': DateTime.now().toIso8601String(),
        'updatedAt': DateTime.now().toIso8601String(),
      },
      'postedBy': {
        'id': 'mock-user-id',
        'userType': 'BUSINESS',
        'email': 'business@mockcompany.com',
        'name': 'Mock Business User',
        'phone': '+971-50-123-4567',
        'avatar': null,
        'isActive': true,
        'createdAt': DateTime.now().toIso8601String(),
        'updatedAt': DateTime.now().toIso8601String(),
      },
    };
    
    // Store the created job for future retrieval
    _mockCreatedJobs.add(mockJobData);
    
    debugPrint('✅ Mock job created and stored successfully');
    debugPrint('📝 Created job: ${mockJobData['title']} (ID: ${mockJobData['id']})');
    debugPrint('📊 Total stored jobs: ${_mockCreatedJobs.length}');
    return Job.fromJson(mockJobData);
    */
    // ORIGINAL CODE - Uncomment when backend is ready
    const String mutation = '''
      mutation CreateJob(\$input: CreateJobInput!) {
        createJob(input: \$input) {
          id
          slug
          title
          department
          location
          salary
          type
          jobLevel
          workType
          status
          description
          shortDescription
          responsibilities
          requirements
          benefits
          skills
          deadline
          createdAt
          updatedAt
        }
      }
    ''';

    final variables = {
      'input': {
        'title': title,
        'department': department,
        'location': location,
        'salary': salary,
        'type': type.toJson(),
        'jobLevel': jobLevel.toJson(),
        'workType': workType.toJson(),
        'description': description,
        'shortDescription': shortDescription,
        'responsibilities': responsibilities,
        'requirements': requirements,
        'benefits': benefits,
        'skills': skills,
        'deadline': deadline.toIso8601String(),
      },
    };

    debugPrint('📡 Sending GraphQL mutation with variables: $variables');

    final result = await GraphQLService.client.mutate(
      MutationOptions(
        document: gql(mutation),
        variables: variables,
      ),
    );

    debugPrint('📡 GraphQL response received');
    
    if (result.hasException) {
      debugPrint('❌ GraphQL exception: ${result.exception.toString()}');
      if (result.exception?.graphqlErrors.isNotEmpty ?? false) {
        for (var error in result.exception!.graphqlErrors) {
          debugPrint('  - GraphQL Error: ${error.message}');
          debugPrint('  - Extensions: ${error.extensions}');
        }
      }
      throw Exception(result.exception.toString());
    }

    final jobData = result.data?['createJob'];
    debugPrint('📦 Job data received: $jobData');
    
    if (jobData == null) {
      debugPrint('❌ Job data is null');
      throw Exception('Failed to create job');
    }

    debugPrint('✅ Job created successfully');
    return Job.fromJson(jobData);
  }
}
