import 'package:graphql_flutter/graphql_flutter.dart';

class GraphQLService {
  static GraphQLClient? _client;

  static void initialize(String apiUrl) {
    final HttpLink httpLink = HttpLink(apiUrl);

    _client = GraphQLClient(
      link: httpLink,
      cache: GraphQLCache(store: HiveStore()),
    );
  }

  static GraphQLClient get client {
    if (_client == null) {
      throw Exception('GraphQL client not initialized. Call initialize() first.');
    }
    return _client!;
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
}
