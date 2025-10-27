import 'package:flutter/foundation.dart';
import 'package:get_storage/get_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:rolevateapp/services/graphql_service.dart';

/// Utility class to test backend connectivity and diagnose issues
class ConnectionTest {
  /// Test basic GraphQL connection
  static Future<Map<String, dynamic>> testConnection() async {
    debugPrint('🔍 Testing GraphQL connection...');
    
    final result = <String, dynamic>{
      'timestamp': DateTime.now().toIso8601String(),
      'connection': false,
      'authentication': false,
      'userType': null,
      'hasCompany': false,
      'errors': <String>[],
    };
    
    try {
      // Test 1: Basic connection with timeout
      final testQuery = gql('''
        query {
          __typename
        }
      ''');
      
      final queryResult = await GraphQLService.client.query(
        QueryOptions(
          document: testQuery,
          fetchPolicy: FetchPolicy.networkOnly,
        ),
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('Connection timeout - backend may be unreachable');
        },
      );
      
      if (queryResult.hasException) {
        result['errors'].add('Connection failed: ${queryResult.exception.toString()}');
        debugPrint('❌ Connection test failed: ${queryResult.exception}');
      } else {
        result['connection'] = true;
        debugPrint('✅ Connection test passed');
      }
      
      // Test 2: Check authentication
      final storage = GetStorage();
      final token = storage.read('token');
      final userType = storage.read('userType');
      final userId = storage.read('userId');
      
      debugPrint('🔑 Token present: ${token != null}');
      debugPrint('👤 User type: $userType');
      debugPrint('🆔 User ID: $userId');
      
      result['authentication'] = token != null;
      result['userType'] = userType;
      
      if (token == null) {
        result['errors'].add('Not authenticated - no token found');
      }
      
      if (userType != 'BUSINESS') {
        result['errors'].add('User type is $userType, must be BUSINESS to post jobs');
      }
      
      // Test 3: Check if user can access business features (only if connected)
      if (token != null && result['connection'] == true) {
        try {
          final meQuery = gql('''
            query {
              me {
                id
                email
                userType
                company {
                  id
                  name
                }
              }
            }
          ''');
          
          final meResult = await GraphQLService.client.query(
            QueryOptions(
              document: meQuery,
              fetchPolicy: FetchPolicy.networkOnly,
            ),
          ).timeout(
            const Duration(seconds: 10),
            onTimeout: () {
              throw Exception('Me query timeout');
            },
          );
          
          if (meResult.hasException) {
            result['errors'].add('Me query failed: ${meResult.exception.toString()}');
            debugPrint('❌ Me query failed: ${meResult.exception}');
          } else {
            final userData = meResult.data?['me'];
            result['hasCompany'] = userData?['company'] != null;
            debugPrint('🏢 Has company: ${result['hasCompany']}');
            
            if (!result['hasCompany']) {
              result['errors'].add('User has no company association - required to post jobs');
            }
          }
        } catch (e) {
          result['errors'].add('Me query error: $e');
          debugPrint('❌ Me query error: $e');
        }
      }
      
    } catch (e) {
      result['errors'].add('Test exception: $e');
      debugPrint('❌ Connection test exception: $e');
    }
    
    // Print summary
    debugPrint('📊 Connection Test Summary:');
    debugPrint('  Connection: ${result['connection']}');
    debugPrint('  Authentication: ${result['authentication']}');
    debugPrint('  User Type: ${result['userType']}');
    debugPrint('  Has Company: ${result['hasCompany']}');
    debugPrint('  Errors: ${result['errors']}');
    
    return result;
  }
  
  /// Test if job creation mutation is valid
  static Future<bool> testJobCreationMutation() async {
    debugPrint('🔍 Testing job creation mutation schema...');
    
    try {
      // Try to create a test job (will fail but validates the schema)
      const mutation = '''
        mutation CreateJob(\$input: CreateJobInput!) {
          createJob(input: \$input) {
            id
            title
          }
        }
      ''';
      
      final variables = {
        'input': {
          'title': '__TEST__',
          'department': '__TEST__',
          'location': '__TEST__',
          'salary': '__TEST__',
          'type': 'FULL_TIME',
          'jobLevel': 'ENTRY',
          'workType': 'ONSITE',
          'description': '__TEST__',
          'shortDescription': '__TEST__',
          'deadline': DateTime.now().add(const Duration(days: 30)).toIso8601String(),
        },
      };
      
      final result = await GraphQLService.client.mutate(
        MutationOptions(
          document: gql(mutation),
          variables: variables,
        ),
      );
      
      if (result.hasException) {
        debugPrint('❌ Schema validation failed: ${result.exception}');
        return false;
      }
      
      debugPrint('✅ Mutation schema is valid');
      return true;
    } catch (e) {
      debugPrint('❌ Mutation test failed: $e');
      return false;
    }
  }
  
  /// Get detailed error information
  static String getDetailedError(dynamic exception) {
    if (exception == null) return 'Unknown error';
    
    final buffer = StringBuffer();
    
    if (exception is OperationException) {
      buffer.writeln('GraphQL Operation Exception:');
      
      if (exception.linkException != null) {
        buffer.writeln('Link Exception: ${exception.linkException}');
      }
      
      if (exception.graphqlErrors.isNotEmpty) {
        buffer.writeln('GraphQL Errors:');
        for (var error in exception.graphqlErrors) {
          buffer.writeln('  - ${error.message}');
          if (error.extensions != null && error.extensions!.isNotEmpty) {
            buffer.writeln('    Extensions: ${error.extensions}');
          }
        }
      }
    } else {
      buffer.writeln(exception.toString());
    }
    
    return buffer.toString();
  }
}
