import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:rolevateapp/models/models.dart';
import 'package:rolevateapp/services/graphql_service.dart';

class ApplicationService {
  ApplicationService();

  /// Create a new job application
  Future<Application> createApplication({
    required String jobId,
    String? candidateId,
    String? coverLetter,
    String? resumeUrl,
    String? expectedSalary,
    String? noticePeriod,
    String? source,
    String? notes,
    String? firstName,
    String? lastName,
    String? email,
    String? phone,
    String? linkedin,
    String? portfolioUrl,
  }) async {
    const String mutation = '''
      mutation CreateApplication(\$input: CreateApplicationInput!) {
        createApplication(input: \$input) {
          id
          jobId
          candidateId
          status
          coverLetter
          resumeUrl
          expectedSalary
          noticePeriod
          source
          notes
          appliedAt
          job {
            id
            title
            slug
            company {
              id
              name
              logo
            }
          }
        }
      }
    ''';

    final variables = {
      'input': {
        'jobId': jobId,
        if (candidateId != null) 'candidateId': candidateId,
        if (coverLetter != null) 'coverLetter': coverLetter,
        if (resumeUrl != null) 'resumeUrl': resumeUrl,
        if (expectedSalary != null) 'expectedSalary': expectedSalary,
        if (noticePeriod != null) 'noticePeriod': noticePeriod,
        if (source != null) 'source': source,
        if (notes != null) 'notes': notes,
        if (firstName != null) 'firstName': firstName,
        if (lastName != null) 'lastName': lastName,
        if (email != null) 'email': email,
        if (phone != null) 'phone': phone,
        if (linkedin != null) 'linkedin': linkedin,
        if (portfolioUrl != null) 'portfolioUrl': portfolioUrl,
      },
    };

    final result = await GraphQLService.client.mutate(
      MutationOptions(
        document: gql(mutation),
        variables: variables,
      ),
    );

    if (result.hasException) {
      throw Exception(result.exception.toString());
    }

    final applicationData = result.data?['createApplication'];
    if (applicationData == null) {
      throw Exception('Failed to create application');
    }

    return Application.fromJson(applicationData);
  }

  /// Get all applications for the current user
  Future<List<Application>> getMyApplications({
    ApplicationStatus? status,
    String? jobId,
    int? limit,
    int? offset,
  }) async {
    const String query = '''
      query GetApplications(\$filter: ApplicationFilterInput, \$pagination: ApplicationPaginationInput) {
        applications(filter: \$filter, pagination: \$pagination) {
          id
          jobId
          candidateId
          status
          coverLetter
          expectedSalary
          noticePeriod
          source
          cvAnalysisScore
          cvScore
          firstInterviewScore
          secondInterviewScore
          finalScore
          appliedAt
          reviewedAt
          interviewScheduledAt
          interviewedAt
          rejectedAt
          acceptedAt
          job {
            id
            title
            slug
            location
            salary
            type
            jobLevel
            workType
            deadline
            company {
              id
              name
              logo
              location
            }
          }
          candidate {
            id
            name
            email
            avatar
          }
        }
      }
    ''';

    final variables = {
      'filter': {
        if (status != null) 'status': status.toJson(),
        if (jobId != null) 'jobId': jobId,
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

    final List<dynamic> applicationsData = result.data?['applications'] ?? [];
    return applicationsData.map((json) => Application.fromJson(json)).toList();
  }

  /// Get a single application by ID
  Future<Application?> getApplication(String id) async {
    const String query = '''
      query GetApplication(\$id: ID!) {
        application(id: \$id) {
          id
          jobId
          candidateId
          status
          coverLetter
          resumeUrl
          expectedSalary
          noticePeriod
          source
          notes
          cvAnalysisScore
          cvScore
          firstInterviewScore
          secondInterviewScore
          finalScore
          cvAnalysisResults
          aiAnalysis
          aiCvRecommendations
          interviewScheduled
          interviewLanguage
          appliedAt
          reviewedAt
          interviewScheduledAt
          interviewedAt
          rejectedAt
          acceptedAt
          createdAt
          updatedAt
          job {
            id
            title
            slug
            description
            requirements
            responsibilities
            benefits
            location
            salary
            type
            jobLevel
            workType
            deadline
            company {
              id
              name
              logo
              website
              email
              phone
              location
              description
            }
            postedBy {
              id
              name
              email
              avatar
            }
          }
          candidate {
            id
            name
            email
            phone
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

    final applicationData = result.data?['application'];
    return applicationData != null ? Application.fromJson(applicationData) : null;
  }

  /// Get applications by job (for business users)
  Future<List<Application>> getApplicationsByJob(String jobId) async {
    const String query = '''
      query GetApplicationsByJob(\$jobId: ID!) {
        applicationsByJob(jobId: \$jobId) {
          id
          jobId
          candidateId
          status
          coverLetter
          expectedSalary
          noticePeriod
          cvAnalysisScore
          cvScore
          firstInterviewScore
          finalScore
          appliedAt
          reviewedAt
          candidate {
            id
            name
            email
            phone
            avatar
          }
        }
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

    final List<dynamic> applicationsData = result.data?['applicationsByJob'] ?? [];
    return applicationsData.map((json) => Application.fromJson(json)).toList();
  }

  /// Update an application
  Future<Application> updateApplication(
    String id, {
    ApplicationStatus? status,
    String? coverLetter,
    String? notes,
    double? cvScore,
    double? firstInterviewScore,
    double? secondInterviewScore,
    double? finalScore,
  }) async {
    const String mutation = '''
      mutation UpdateApplication(\$id: ID!, \$input: UpdateApplicationInput!) {
        updateApplication(id: \$id, input: \$input) {
          id
          status
          coverLetter
          notes
          cvScore
          firstInterviewScore
          secondInterviewScore
          finalScore
          updatedAt
        }
      }
    ''';

    final variables = {
      'id': id,
      'input': {
        if (status != null) 'status': status.toJson(),
        if (coverLetter != null) 'coverLetter': coverLetter,
        if (notes != null) 'notes': notes,
        if (cvScore != null) 'cvScore': cvScore,
        if (firstInterviewScore != null) 'firstInterviewScore': firstInterviewScore,
        if (secondInterviewScore != null) 'secondInterviewScore': secondInterviewScore,
        if (finalScore != null) 'finalScore': finalScore,
      },
    };

    final result = await GraphQLService.client.mutate(
      MutationOptions(
        document: gql(mutation),
        variables: variables,
      ),
    );

    if (result.hasException) {
      throw Exception(result.exception.toString());
    }

    final applicationData = result.data?['updateApplication'];
    if (applicationData == null) {
      throw Exception('Failed to update application');
    }

    return Application.fromJson(applicationData);
  }

  /// Withdraw an application
  Future<bool> withdrawApplication(String id) async {
    const String mutation = '''
      mutation RemoveApplication(\$id: ID!) {
        removeApplication(id: \$id)
      }
    ''';

    final result = await GraphQLService.client.mutate(
      MutationOptions(
        document: gql(mutation),
        variables: {'id': id},
      ),
    );

    if (result.hasException) {
      throw Exception(result.exception.toString());
    }

    return result.data?['removeApplication'] ?? false;
  }
}
