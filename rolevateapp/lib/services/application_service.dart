import 'dart:convert';
import 'dart:io';
import 'dart:math' show min;
import 'package:flutter/foundation.dart';
import 'package:get_storage/get_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:rolevateapp/models/models.dart';
import 'package:rolevateapp/services/graphql_service.dart';

class ApplicationService {
  ApplicationService();

  /// Upload CV/Resume to S3 and return the URL
  Future<String> uploadCVToS3({
    required String filePath,
    required String filename,
    String? candidateId,
  }) async {
    debugPrint('📤 Uploading CV to S3: $filename');
    
    try {
      // Read file as bytes
      final file = File(filePath);
      if (!await file.exists()) {
        throw Exception('File not found: $filePath');
      }
      
      final bytes = await file.readAsBytes();
      final base64File = base64Encode(bytes);
      
      // Determine MIME type based on file extension
      final extension = filename.toLowerCase().split('.').last;
      String mimetype;
      switch (extension) {
        case 'pdf':
          mimetype = 'application/pdf';
          break;
        case 'doc':
          mimetype = 'application/msword';
          break;
        case 'docx':
          mimetype = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        default:
          mimetype = 'application/octet-stream';
      }
      
      debugPrint('📄 File size: ${bytes.length} bytes, MIME: $mimetype');
      
      const String mutation = '''
        mutation UploadFileToS3(\$base64File: String!, \$filename: String!, \$mimetype: String!, \$candidateId: String) {
          uploadFileToS3(base64File: \$base64File, filename: \$filename, mimetype: \$mimetype, candidateId: \$candidateId) {
            url
            key
            bucket
          }
        }
      ''';

      final variables = {
        'base64File': base64File,
        'filename': filename,
        'mimetype': mimetype,
        if (candidateId != null) 'candidateId': candidateId,
      };

      final result = await GraphQLService.client.mutate(
        MutationOptions(
          document: gql(mutation),
          variables: variables,
          fetchPolicy: FetchPolicy.networkOnly,
        ),
      );

      if (result.hasException) {
        debugPrint('❌ Upload Exception: ${result.exception}');
        throw Exception('Failed to upload CV: ${result.exception}');
      }

      final uploadData = result.data?['uploadFileToS3'];
      if (uploadData == null || uploadData['url'] == null) {
        debugPrint('❌ No URL in upload response');
        throw Exception('Failed to upload CV - no URL returned');
      }

      final url = uploadData['url'] as String;
      debugPrint('✅ CV uploaded successfully: $url');
      return url;
    } catch (e) {
      debugPrint('❌ CV upload error: $e');
      rethrow;
    }
  }

  /// Create a new job application
  Future<Application> createApplication({
    required String jobId,
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
    debugPrint('📤 Creating application for job: $jobId');
    
    const String mutation = '''
      mutation CreateApplication(\$input: CreateApplicationInput!) {
        createApplication(input: \$input) {
          application {
            id
            status
            coverLetter
            resumeUrl
            expectedSalary
            noticePeriod
            source
            notes
            appliedAt
            candidate {
              id
              name
              email
            }
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
          message
        }
      }
    ''';

    final variables = {
      'input': {
        'jobId': jobId,
        if (coverLetter != null && coverLetter.isNotEmpty) 'coverLetter': coverLetter,
        // Include resumeUrl if provided and valid, or omit it entirely if null
        if (resumeUrl != null) 'resumeUrl': resumeUrl,
        if (expectedSalary != null && expectedSalary.isNotEmpty) 'expectedSalary': expectedSalary,
        if (noticePeriod != null && noticePeriod.isNotEmpty) 'noticePeriod': noticePeriod,
        if (source != null && source.isNotEmpty) 'source': source,
        if (notes != null && notes.isNotEmpty) 'notes': notes,
        if (firstName != null && firstName.isNotEmpty) 'firstName': firstName,
        if (lastName != null && lastName.isNotEmpty) 'lastName': lastName,
        if (email != null && email.isNotEmpty) 'email': email,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
        if (linkedin != null && linkedin.isNotEmpty) 'linkedin': linkedin,
        if (portfolioUrl != null && portfolioUrl.isNotEmpty) 'portfolioUrl': portfolioUrl,
      },
    };

    debugPrint('📝 Application variables: ${jsonEncode(variables['input'])}');
    debugPrint('🔐 Checking authentication token...');
    
    // Check if we have an auth token
    try {
      final storage = GetStorage();
      final token = storage.read('access_token') ?? storage.read('token');
      debugPrint('🔑 Token present: ${token != null ? 'YES (length: ${token.toString().length})' : 'NO - THIS WILL FAIL!'}');
      if (token != null) {
        debugPrint('🔑 Token starts with: ${token.toString().substring(0, min(20, token.toString().length))}...');
      }
    } catch (e) {
      debugPrint('⚠️ Could not check token: $e');
    }

    try {
      debugPrint('🌐 Sending GraphQL mutation to backend...');
      final result = await GraphQLService.client.mutate(
        MutationOptions(
          document: gql(mutation),
          variables: variables,
          fetchPolicy: FetchPolicy.networkOnly,
        ),
      );

      debugPrint('📥 Received response from backend');
      debugPrint('📊 Has exception: ${result.hasException}');
      debugPrint('📊 Has data: ${result.data != null}');

      if (result.hasException) {
        debugPrint('❌ GraphQL Exception: ${result.exception}');
        
        // Extract more detailed error information
        final errors = result.exception?.graphqlErrors;
        if (errors != null && errors.isNotEmpty) {
          final errorMessage = errors.first.message;
          debugPrint('❌ Error message: $errorMessage');
          debugPrint('❌ Error extensions: ${errors.first.extensions}');
          
          // Check for specific error types
          if (errorMessage.toLowerCase().contains('forbidden') || 
              errorMessage.toLowerCase().contains('unauthorized')) {
            throw Exception('Authentication required. Please login to submit an application.');
          } else if (errorMessage.toLowerCase().contains('already applied')) {
            throw Exception('You have already applied for this job.');
          } else if (errorMessage.toLowerCase().contains('not found')) {
            throw Exception('Job not found or no longer available.');
          } else if (errorMessage.toLowerCase().contains('must be a valid url')) {
            throw Exception('Invalid resume URL format. Please try uploading your resume again.');
          }
          
          throw Exception(errorMessage);
        }
        
        // Check for network/link errors
        final linkException = result.exception?.linkException;
        if (linkException != null) {
          debugPrint('❌ Link exception: $linkException');
          
          if (linkException.toString().contains('Failed host lookup') ||
              linkException.toString().contains('SocketException')) {
            throw Exception('Network error. Please check your internet connection.');
          } else if (linkException.toString().contains('403') || 
                     linkException.toString().contains('Forbidden')) {
            throw Exception('Authentication required. Please login to submit an application.');
          } else if (linkException.toString().contains('401') || 
                     linkException.toString().contains('Unauthorized')) {
            throw Exception('Session expired. Please login again.');
          }
        }
        
        throw Exception(result.exception.toString());
      }

      final responseData = result.data?['createApplication'];
      if (responseData == null) {
        debugPrint('❌ No response data received');
        throw Exception('Failed to create application - no response from server');
      }

      final applicationData = responseData['application'];
      if (applicationData == null) {
        debugPrint('❌ No application data in response');
        throw Exception('Failed to create application - invalid response format');
      }

      debugPrint('✅ Application created successfully: ${applicationData['id']}');
      return Application.fromJson(applicationData);
    } catch (e) {
      debugPrint('❌ Application creation error: $e');
      rethrow;
    }
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
          candidate {
            id
            name
            email
            avatar
          }
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
          candidate {
            id
            name
            email
            phone
            avatar
          }
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

  /// Schedule an interview for an application
  Future<Application> scheduleInterview({
    required String applicationId,
    required DateTime interviewDateTime,
    String? meetingLink,
    String? notes,
  }) async {
    debugPrint('🔧 ApplicationService.scheduleInterview called with applicationId: $applicationId');

    // TEMPORARY: Mock implementation for testing
    debugPrint('🎭 Using mock implementation for interview scheduling');

    // Simulate API delay
    await Future.delayed(const Duration(milliseconds: 800));

    // For mock implementation, we'll return a mock updated application
    // In a real implementation, this would update the application with interview details
    final mockUpdatedApplication = {
      'id': applicationId,
      'status': 'UNDER_REVIEW',
      'interviewScheduled': true,
      'interviewScheduledAt': interviewDateTime.toIso8601String(),
      'companyNotes': notes,
      'appliedAt': DateTime.now().subtract(const Duration(days: 3)).toIso8601String(),
      'interviewLanguage': 'English',
      'createdAt': DateTime.now().subtract(const Duration(days: 3)).toIso8601String(),
      'updatedAt': DateTime.now().toIso8601String(),
      'job': {
        'id': 'mock-job-1',
        'title': 'Senior Software Engineer',
        'slug': 'senior-software-engineer',
        'department': 'Engineering',
        'location': 'Dubai, UAE',
        'salary': 'AED 25,000 - 35,000',
        'type': 'FULL_TIME',
        'jobLevel': 'SENIOR',
        'workType': 'ONSITE',
        'status': 'ACTIVE',
        'company': {
          'id': 'mock-company-1',
          'name': 'TechCorp Solutions',
          'logo': null,
        },
      },
      'candidate': {
        'id': 'mock-user-1',
        'name': 'Ahmed Hassan',
        'email': 'ahmed.hassan@email.com',
      },
    };

    debugPrint('✅ Interview scheduled successfully');
    return Application.fromJson(mockUpdatedApplication);
  }
}
