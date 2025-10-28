import 'package:flutter/foundation.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:rolevateapp/models/models.dart';
import 'package:rolevateapp/services/graphql_service.dart';

class JobService {
  JobService();

  /// Generate AI-powered job analysis and suggestions
  Future<Map<String, dynamic>> generateJobAnalysis({
    required String jobTitle,
    required String location,
    required String employeeType,
    String? department,
    String? industry,
    String? jobLevel,
    String? workType,
    String? country,
  }) async {
    debugPrint('🤖 JobService.generateJobAnalysis called for: $jobTitle');
    
    const String mutation = '''
      mutation GenerateJobAnalysis(\$input: JobAnalysisInput!) {
        generateJobAnalysis(input: \$input) {
          description
          shortDescription
          responsibilities
          requirements
          benefits
          skills
          suggestedSalary
          experienceLevel
          educationLevel
          __typename
        }
      }
    ''';

    final variables = {
      'input': {
        'jobTitle': jobTitle,
        'location': location,
        'employeeType': employeeType,
        if (department != null && department.isNotEmpty) 'department': department,
        if (industry != null && industry.isNotEmpty) 'industry': industry,
        if (jobLevel != null && jobLevel.isNotEmpty) 'jobLevel': jobLevel,
        if (workType != null && workType.isNotEmpty) 'workType': workType,
        if (country != null && country.isNotEmpty) 'country': country,
      },
    };

    debugPrint('🤖 Generating AI analysis with input: $variables');

    try {
      // AI generation can take 30-90 seconds
      // The GraphQLService now has a TimeoutLink with 120-second timeout
      print('📡 Sending GraphQL mutation...');
      final result = await GraphQLService.client.mutate(
        MutationOptions(
          document: gql(mutation),
          variables: variables,
          fetchPolicy: FetchPolicy.networkOnly,
        ),
      );
      print('📡 GraphQL mutation completed');

      if (result.hasException) {
        print('❌ HAS EXCEPTION!');
        print('❌ Full exception: ${result.exception}');
        print('❌ Exception type: ${result.exception.runtimeType}');
        print('❌ GraphQL errors: ${result.exception?.graphqlErrors}');
        print('❌ Link exception: ${result.exception?.linkException}');
        print('❌ Link exception type: ${result.exception?.linkException.runtimeType}');
        throw Exception('Failed to generate job details. Please try again or fill in manually.');
      }

      final analysisData = result.data?['generateJobAnalysis'];
      if (analysisData == null) {
        throw Exception('No data returned from AI service. Please try again.');
      }

      debugPrint('✅ AI analysis generated successfully');
      return Map<String, dynamic>.from(analysisData);
    } catch (e) {
      debugPrint('❌ Error in generateJobAnalysis: $e');
      rethrow;
    }
  }

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
    
    // REAL BACKEND - GraphQL Query
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
  }

  /// Get a single job by ID
  Future<Job?> getJob(String id) async {
    debugPrint('🔧 JobService.getJob called with id: $id');
    
    // REAL BACKEND - GraphQL Query
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

    // REAL BACKEND - GraphQL API
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
  }

  /// Check if a job is saved
  Future<bool> isJobSaved(String jobId) async {
    debugPrint('🔧 JobService.isJobSaved called with jobId: $jobId');

    try {
      const query = r'''
        query IsJobSaved($jobId: ID!) {
          isJobSaved(jobId: $jobId)
        }
      ''';

      final variables = {
        'jobId': jobId,
      };

      final result = await GraphQLService.client.query(
        QueryOptions(
          document: gql(query),
          variables: variables,
        ),
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('Check saved status timeout');
        },
      );

      if (result.hasException) {
        debugPrint('❌ Failed to check if job is saved: ${result.exception}');
        return false;
      }

      final isSaved = result.data?['isJobSaved'] as bool? ?? false;
      debugPrint('✅ Job saved status: $isSaved');
      return isSaved;
    } catch (e) {
      debugPrint('❌ Error checking if job is saved: $e');
      return false;
    }
  }

  /// Save a job to favorites
  Future<bool> saveJob(String jobId, {String? notes}) async {
    debugPrint('🔧 JobService.saveJob called with jobId: $jobId');

    // TEMPORARY: Mock implementation for testing
    debugPrint('🎭 Using mock implementation for saving job');
    await Future.delayed(const Duration(milliseconds: 500));
    debugPrint('✅ Mock job saved successfully');
    return true;

    /* REAL BACKEND - Uncomment when backend is ready
    try {
      const mutation = r'''
        mutation SaveJob($jobId: ID!, $notes: String) {
          saveJob(jobId: $jobId, notes: $notes)
        }
      ''';

      final variables = {
        'jobId': jobId,
        if (notes != null) 'notes': notes,
      };

      final result = await GraphQLService.client.mutate(
        MutationOptions(
          document: gql(mutation),
          variables: variables,
        ),
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('Save job timeout');
        },
      );

      if (result.hasException) {
        debugPrint('❌ Failed to save job: ${result.exception}');
        return false;
      }

      final success = result.data?['saveJob'] as bool? ?? false;
      debugPrint('✅ Job saved successfully: $success');
      return success;
    } catch (e) {
      debugPrint('❌ Error saving job: $e');
      return false;
    }
    */
  }

  /// Remove a job from favorites
  Future<bool> unsaveJob(String jobId) async {
    debugPrint('🔧 JobService.unsaveJob called with jobId: $jobId');

    // TEMPORARY: Mock implementation for testing
    debugPrint('🎭 Using mock implementation for unsaving job');
    await Future.delayed(const Duration(milliseconds: 500));
    debugPrint('✅ Mock job unsaved successfully');
    return true;

    /* REAL BACKEND - Uncomment when backend is ready
    try {
      const mutation = r'''
        mutation UnsaveJob($jobId: ID!) {
          unsaveJob(jobId: $jobId)
        }
      ''';

      final variables = {
        'jobId': jobId,
      };

      final result = await GraphQLService.client.mutate(
        MutationOptions(
          document: gql(mutation),
          variables: variables,
        ),
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('Unsave job timeout');
        },
      );

      if (result.hasException) {
        debugPrint('❌ Failed to unsave job: ${result.exception}');
        return false;
      }

      final success = result.data?['unsaveJob'] as bool? ?? false;
      debugPrint('✅ Job unsaved successfully: $success');
      return success;
    } catch (e) {
      debugPrint('❌ Error unsaving job: $e');
      return false;
    }
    */
  }

  /// Get all saved jobs
  Future<List<SavedJob>> getSavedJobs() async {
    debugPrint('🔧 JobService.getSavedJobs called');

    try {
      const query = r'''
        query GetMySavedJobs {
          mySavedJobs {
            id
            userId
            jobId
            savedAt
            notes
            job {
              id
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
              experience
              education
              industry
              companyDescription
              deadline
              featured
              applicants
              views
              createdAt
              updatedAt
              company {
                id
                name
                logo
                website
                industry
                size
              }
              postedBy {
                id
                name
                email
              }
            }
          }
        }
      ''';

      final result = await GraphQLService.client.query(
        QueryOptions(
          document: gql(query),
          fetchPolicy: FetchPolicy.networkOnly,
        ),
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('Get saved jobs timeout');
        },
      );

      if (result.hasException) {
        debugPrint('❌ Failed to fetch saved jobs: ${result.exception}');
        return [];
      }

      final savedJobsJson = result.data?['mySavedJobs'] as List<dynamic>?;
      
      if (savedJobsJson == null || savedJobsJson.isEmpty) {
        debugPrint('✅ No saved jobs found');
        return [];
      }

      final savedJobs = savedJobsJson
          .map((json) => SavedJob.fromJson(json as Map<String, dynamic>))
          .toList();

      debugPrint('✅ Fetched ${savedJobs.length} saved jobs');
      return savedJobs;
    } catch (e) {
      debugPrint('❌ Error fetching saved jobs: $e');
      return [];
    }
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
    String? experience,
    String? education,
    String? industry,
    String? companyDescription,
    required DateTime deadline,
  }) async {
    debugPrint('🔧 JobService.createJob called with title: $title');
    
    // REAL BACKEND - GraphQL Mutation
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
          featured
          applicants
          views
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
            email
            avatar
          }
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
        // Backend requires these fields - provide defaults if not specified
        'responsibilities': responsibilities ?? 'To be discussed during interview',
        'requirements': requirements ?? 'See job description for details',
        'benefits': benefits ?? 'Competitive package',
        'skills': skills != null && skills.isNotEmpty ? skills : ['General'],
        'experience': experience ?? 'As per job level',
        'education': education ?? 'As per job requirements',
        'industry': industry ?? 'Technology',
        'companyDescription': companyDescription ?? 'Growing company',
        'deadline': deadline.toIso8601String(),
      },
    };

    debugPrint('📡 Sending GraphQL mutation with variables: $variables');

    try {
      final result = await GraphQLService.client.mutate(
        MutationOptions(
          document: gql(mutation),
          variables: variables,
        ),
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          debugPrint('⏱️ GraphQL mutation timeout after 30 seconds');
          throw Exception('Request timeout: The server took too long to respond. Please check your connection and try again.');
        },
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
    } catch (e) {
      debugPrint('❌ Error in createJob: $e');
      rethrow;
    }
  }

  /// Update job (including status changes like publishing)
  Future<Job> updateJob({
    required String jobId,
    JobStatus? status,
    String? title,
    String? department,
    String? location,
    String? salary,
    JobType? type,
    JobLevel? jobLevel,
    WorkType? workType,
    String? description,
    String? shortDescription,
    String? responsibilities,
    String? requirements,
    String? benefits,
    List<String>? skills,
    String? experience,
    String? education,
    String? industry,
    String? companyDescription,
    DateTime? deadline,
    bool? featured,
  }) async {
    debugPrint('🔧 JobService.updateJob called for jobId: $jobId');
    
    const String mutation = '''
      mutation UpdateJob(\$input: UpdateJobInput!) {
        updateJob(input: \$input) {
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
          featured
          applicants
          views
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
            email
            avatar
          }
        }
      }
    ''';

    final variables = {
      'input': {
        'id': jobId,
        if (status != null) 'status': status.toJson(),
        if (title != null) 'title': title,
        if (department != null) 'department': department,
        if (location != null) 'location': location,
        if (salary != null) 'salary': salary,
        if (type != null) 'type': type.toJson(),
        if (jobLevel != null) 'jobLevel': jobLevel.toJson(),
        if (workType != null) 'workType': workType.toJson(),
        if (description != null) 'description': description,
        if (shortDescription != null) 'shortDescription': shortDescription,
        if (responsibilities != null) 'responsibilities': responsibilities,
        if (requirements != null) 'requirements': requirements,
        if (benefits != null) 'benefits': benefits,
        if (skills != null) 'skills': skills,
        if (experience != null) 'experience': experience,
        if (education != null) 'education': education,
        if (industry != null) 'industry': industry,
        if (companyDescription != null) 'companyDescription': companyDescription,
        if (deadline != null) 'deadline': deadline.toIso8601String(),
        if (featured != null) 'featured': featured,
      },
    };

    debugPrint('📡 Sending updateJob mutation with variables: $variables');

    try {
      final result = await GraphQLService.client.mutate(
        MutationOptions(
          document: gql(mutation),
          variables: variables,
        ),
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Request timeout: The server took too long to respond.');
        },
      );

      if (result.hasException) {
        debugPrint('❌ GraphQL exception: ${result.exception.toString()}');
        if (result.exception?.graphqlErrors.isNotEmpty ?? false) {
          for (var error in result.exception!.graphqlErrors) {
            debugPrint('  - GraphQL Error: ${error.message}');
          }
        }
        throw Exception(result.exception.toString());
      }

      final jobData = result.data?['updateJob'];
      if (jobData == null) {
        throw Exception('Failed to update job');
      }

      debugPrint('✅ Job updated successfully');
      return Job.fromJson(jobData);
    } catch (e) {
      debugPrint('❌ Error in updateJob: $e');
      rethrow;
    }
  }
}
