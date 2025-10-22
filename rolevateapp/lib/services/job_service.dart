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
    int? offset,
  }) async {
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
        if (offset != null) 'offset': offset,
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
      throw Exception(result.exception.toString());
    }

    final List<dynamic> jobsData = result.data?['jobs'] ?? [];
    return jobsData.map((json) => Job.fromJson(json)).toList();
  }

  /// Get a single job by ID
  Future<Job?> getJob(String id) async {
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

  /// Save a job to favorites
  Future<bool> saveJob(String jobId, {String? notes}) async {
    const String mutation = '''
      mutation SaveJob(\$jobId: ID!, \$notes: String) {
        saveJob(jobId: \$jobId, notes: \$notes)
      }
    ''';

    final result = await GraphQLService.client.mutate(
      MutationOptions(
        document: gql(mutation),
        variables: {
          'jobId': jobId,
          if (notes != null) 'notes': notes,
        },
      ),
    );

    if (result.hasException) {
      throw Exception(result.exception.toString());
    }

    return result.data?['saveJob'] ?? false;
  }

  /// Remove a job from favorites
  Future<bool> unsaveJob(String jobId) async {
    const String mutation = '''
      mutation UnsaveJob(\$jobId: ID!) {
        unsaveJob(jobId: \$jobId)
      }
    ''';

    final result = await GraphQLService.client.mutate(
      MutationOptions(
        document: gql(mutation),
        variables: {'jobId': jobId},
      ),
    );

    if (result.hasException) {
      throw Exception(result.exception.toString());
    }

    return result.data?['unsaveJob'] ?? false;
  }

  /// Check if a job is saved
  Future<bool> isJobSaved(String jobId) async {
    const String query = '''
      query IsJobSaved(\$jobId: ID!) {
        isJobSaved(jobId: \$jobId)
      }
    ''';

    final result = await GraphQLService.client.query(
      QueryOptions(
        document: gql(query),
        variables: {'jobId': jobId},
        fetchPolicy: FetchPolicy.networkOnly,
      ),
    );

    if (result.hasException) {
      throw Exception(result.exception.toString());
    }

    return result.data?['isJobSaved'] ?? false;
  }

  /// Get all saved jobs
  Future<List<SavedJob>> getSavedJobs() async {
    const String query = '''
      query GetSavedJobs {
        savedJobs {
          id
          userId
          jobId
          savedAt
          notes
          job {
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
            deadline
            featured
            company {
              id
              name
              logo
              location
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
    );

    if (result.hasException) {
      throw Exception(result.exception.toString());
    }

    final List<dynamic> savedJobsData = result.data?['savedJobs'] ?? [];
    return savedJobsData.map((json) => SavedJob.fromJson(json)).toList();
  }
}
