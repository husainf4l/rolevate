import 'package:flutter/foundation.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:get_storage/get_storage.dart';

class GraphQLService {
  static GraphQLClient? _client;
  static String? _apiUrl;

  static void initialize(String apiUrl) {
    _apiUrl = apiUrl;
    _client = _createClient();
  }

  static GraphQLClient _createClient() {
    debugPrint('🔧 Creating GraphQL client with URL: $_apiUrl');
    
    final HttpLink httpLink = HttpLink(
      _apiUrl!,
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
    );
    
    // Add authentication link that adds token to every request
    final AuthLink authLink = AuthLink(
      getToken: () {
        try {
          final storage = GetStorage();
          // Try both 'access_token' and 'token' for backward compatibility
          final token = storage.read('access_token') ?? storage.read('token');
          debugPrint('🔑 Token from storage: ${token != null ? 'Present' : 'Null'}');
          return token != null ? 'Bearer $token' : null;
        } catch (e) {
          debugPrint('❌ Error reading token: $e');
          return null;
        }
      },
    );

    // Combine auth link with http link
    final Link link = authLink.concat(httpLink);

    return GraphQLClient(
      link: link,
      cache: GraphQLCache(store: HiveStore()),
      defaultPolicies: DefaultPolicies(
        query: Policies(
          fetch: FetchPolicy.networkOnly,
          error: ErrorPolicy.all,
          cacheReread: CacheRereadPolicy.ignoreAll,
        ),
        mutate: Policies(
          fetch: FetchPolicy.networkOnly,
          error: ErrorPolicy.all,
        ),
      ),
    );
  }

  static GraphQLClient get client {
    if (_client == null) {
      throw Exception('GraphQL client not initialized. Call initialize() first.');
    }
    return _client!;
  }

  // Update the client when token changes
  static void updateClient() {
    if (_apiUrl != null) {
      _client = _createClient();
    }
  }

  // Jobs queries
  static const String jobsQuery = '''
    query GetJobs {
      jobs {
        id
        title
        slug
        company {
          id
          name
        }
        location
        salary
        type
        department
        shortDescription
        deadline
        createdAt
      }
    }
  ''';

  static const String jobByIdQuery = '''
    query GetJob(\$id: ID!) {
      job(id: \$id) {
        id
        title
        slug
        department
        location
        salary
        type
        deadline
        description
        shortDescription
        responsibilities
        requirements
        benefits
        skills
        experience
        education
        jobLevel
        workType
        industry
        companyDescription
        status
        company {
          id
          name
        }
        createdAt
        updatedAt
      }
    }
  ''';

  // Auth mutations
  static const String loginMutation = '''
    mutation Login(\$email: String!, \$password: String!) {
      login(input: { email: \$email, password: \$password }) {
        user {
          id
          email
          name
          userType
        }
        access_token
      }
    }
  ''';

  static const String createUserMutation = '''
    mutation CreateUser(\$input: CreateUserInput!) {
      createUser(input: \$input) {
        id
        email
        name
        userType
      }
    }
  ''';

  // Job mutations
  static const String createJobMutation = '''
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

  // Profile mutations
  static const String updateProfileMutation = '''
    mutation UpdateProfile(\$input: UpdateProfileInput!) {
      updateProfile(input: \$input) {
        id
        email
        name
        phone
        userType
      }
    }
  ''';

  static const String changePasswordMutation = '''
    mutation ChangePassword(\$input: ChangePasswordInput!) {
      changePassword(input: \$input)
    }
  ''';
}
