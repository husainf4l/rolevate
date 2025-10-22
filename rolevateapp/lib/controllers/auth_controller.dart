import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:rolevateapp/services/graphql_service.dart';

class AuthController extends GetxController {
  final isAuthenticated = false.obs;
  final isLoading = false.obs;
  final user = Rxn<Map<String, dynamic>>();
  final token = ''.obs;
  
  final storage = GetStorage();
  
  @override
  void onInit() {
    super.onInit();
    _loadStoredAuth();
  }
  
  void _loadStoredAuth() {
    final storedToken = storage.read('token');
    final storedUser = storage.read('user');
    
    if (storedToken != null && storedUser != null) {
      token.value = storedToken;
      user.value = Map<String, dynamic>.from(storedUser);
      isAuthenticated.value = true;
    }
  }
  
  Future<void> login(String email, String password) async {
    try {
      print('🔐 Attempting login for: $email');
      
      isLoading.value = true;
      
      final MutationOptions options = MutationOptions(
        document: gql(GraphQLService.loginMutation),
        variables: {
          'email': email,
          'password': password,
        },
      );

      final result = await GraphQLService.client.mutate(options);

      print('✅ Login response: ${result.data.toString()}');

      if (result.hasException) {
        print('❌ GraphQL Exception: ${result.exception.toString()}');
        
        // Check for specific error messages
        String errorMessage = 'Login failed';
        if (result.exception?.graphqlErrors.isNotEmpty ?? false) {
          final firstError = result.exception!.graphqlErrors.first;
          if (firstError.message.toLowerCase().contains('invalid credentials')) {
            errorMessage = 'Invalid email or password';
          } else {
            errorMessage = firstError.message;
          }
        }
        
        Get.snackbar(
          'Login Failed',
          errorMessage,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: CupertinoColors.destructiveRed,
          colorText: CupertinoColors.white,
          duration: const Duration(seconds: 3),
        );
        return;
      }

      if (result.data != null && result.data!['login'] != null) {
        final loginData = result.data!['login'];
        final accessToken = loginData['access_token'] as String?;
        
        if (accessToken != null) {
          token.value = accessToken;
          await storage.write('token', accessToken);

          final userData = loginData['user'];
          await storage.write('user', {
            'id': userData['id'],
            'email': userData['email'],
            'name': userData['name'],
            'userType': userData['userType'],
          });

          user.value = Map<String, dynamic>.from(userData);
          isAuthenticated.value = true;
          
          final userType = userData['userType'] as String;
          print('👤 User type: $userType');
          
          Get.snackbar(
            'Welcome!',
            'Login successful',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: CupertinoColors.systemGreen,
            colorText: CupertinoColors.white,
            duration: const Duration(seconds: 2),
          );
          
          // Navigate based on user type
          if (userType.toLowerCase() == 'business') {
            Get.offAllNamed('/business-dashboard');
          } else if (userType.toLowerCase() == 'candidate') {
            Get.offAllNamed('/candidate-dashboard');
          } else {
            // Default fallback
            Get.offAllNamed('/home');
          }
        } else {
          print('❌ No access_token in response');
          Get.snackbar(
            'Error',
            'Login failed - no token received',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: CupertinoColors.destructiveRed,
            colorText: CupertinoColors.white,
          );
        }
      }
    } catch (e) {
      print('❌ Login error: $e');
      Get.snackbar(
        'Error',
        'An unexpected error occurred',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: CupertinoColors.destructiveRed,
        colorText: CupertinoColors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }
  
  Future<void> logout() async {
    user.value = null;
    token.value = '';
    isAuthenticated.value = false;
    
    await storage.remove('token');
    await storage.remove('user');
    
    Get.offAllNamed('/');
  }
}
