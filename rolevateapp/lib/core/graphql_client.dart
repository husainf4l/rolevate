import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:get_storage/get_storage.dart';

/// GraphQL Client Configuration for Rolevate Backend
class GraphQLClientConfig {
  static const String _graphqlEndpoint = 'https://rolevate.com/api/graphql';
  static const String _graphqlEndpointLocal = 'http://localhost:4005/api/graphql';
  
  // Use local endpoint for development
  static bool _useLocalEndpoint = false;
  
  static String get endpoint => _useLocalEndpoint ? _graphqlEndpointLocal : _graphqlEndpoint;
  
  /// Switch to local backend for development
  static void useLocalEndpoint() {
    _useLocalEndpoint = true;
  }
  
  /// Switch to production backend
  static void useProductionEndpoint() {
    _useLocalEndpoint = false;
  }
  
  /// Create GraphQL client with authentication
  static GraphQLClient createClient() {
    final storage = GetStorage();
    
    // HTTP Link
    final HttpLink httpLink = HttpLink(endpoint);
    
    // Auth Link - Add JWT token to headers
    final AuthLink authLink = AuthLink(
      getToken: () async {
        final token = storage.read('access_token');
        return token != null ? 'Bearer $token' : null;
      },
    );
    
    // Combine links
    final Link link = authLink.concat(httpLink);
    
    // Create client
    return GraphQLClient(
      link: link,
      cache: GraphQLCache(store: InMemoryStore()),
    );
  }
  
  /// Initialize GraphQL with Hive storage for offline support
  static Future<void> initializeGraphQL() async {
    await initHiveForFlutter();
  }
}

/// Extension to easily access GraphQL client
extension GraphQLClientExtension on GetStorage {
  /// Get or create GraphQL client instance
  GraphQLClient getGraphQLClient() {
    return GraphQLClientConfig.createClient();
  }
}
