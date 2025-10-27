import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:rolevateapp/services/graphql_service.dart';
import 'package:rolevateapp/models/enums.dart';
import 'dart:io';

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
    final savedAvatarPath = storage.read('avatar_local_path');
    
    if (storedToken != null && storedUser != null) {
      token.value = storedToken;
      user.value = Map<String, dynamic>.from(storedUser);
      
      // CRITICAL: Load saved avatar from permanent storage
      if (savedAvatarPath != null) {
        final avatarFile = File(savedAvatarPath);
        if (avatarFile.existsSync()) {
          user.value!['avatar'] = 'file://$savedAvatarPath';
          debugPrint('✅ Loaded saved avatar from storage: $savedAvatarPath');
        } else {
          debugPrint('⚠️ Saved avatar file not found: $savedAvatarPath');
          storage.remove('avatar_local_path');
        }
      }
      
      isAuthenticated.value = true;
      
      // Update GraphQL client with stored token
      GraphQLService.updateClient();
    }
  }
  
  Future<void> _checkAndNavigateBusiness() async {
    try {
      debugPrint('🏢 Checking if company profile exists...');
      
      // Query to check if user has company profile
      const String query = '''
        query CheckCompany {
          me {
            id
            company {
              id
              name
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
          // If timeout, just go to dashboard
          debugPrint('⏱️ Company check timeout, going to dashboard');
          Get.offAllNamed('/business-dashboard');
          throw Exception('Timeout');
        },
      );
      
      if (result.hasException) {
        debugPrint('❌ Error checking company: ${result.exception}');
        // On error, go to dashboard (user can set up later)
        Get.offAllNamed('/business-dashboard');
        return;
      }
      
      final userData = result.data?['me'];
      final hasCompany = userData?['company'] != null;
      
      debugPrint('🏢 Has company: $hasCompany');
      
      if (hasCompany) {
        // Company exists, go to business dashboard
        Get.offAllNamed('/business-dashboard');
      } else {
        // No company, redirect to company setup
        debugPrint('📝 Redirecting to company setup...');
        Get.offAllNamed('/company-settings');
        
        Get.snackbar(
          'Complete Your Profile',
          'Please set up your company profile to continue',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: CupertinoColors.systemBlue,
          colorText: CupertinoColors.white,
          duration: const Duration(seconds: 3),
        );
      }
    } catch (e) {
      if (e.toString() != 'Exception: Timeout') {
        debugPrint('❌ Error in _checkAndNavigateBusiness: $e');
      }
      // On any error, just go to dashboard
      Get.offAllNamed('/business-dashboard');
    }
  }
  
  Future<void> login(String email, String password) async {
    try {
      debugPrint('🔐 Attempting login for: $email');
      
      isLoading.value = true;
      
      final MutationOptions options = MutationOptions(
        document: gql(GraphQLService.loginMutation),
        variables: {
          'email': email,
          'password': password,
        },
      );

      final result = await GraphQLService.client.mutate(options);

      debugPrint('✅ Login response: ${result.data.toString()}');

      if (result.hasException) {
        debugPrint('❌ GraphQL Exception: ${result.exception.toString()}');
        
        // Check for specific error messages
        String errorMessage = 'Login failed';
        if (result.exception?.graphqlErrors.isNotEmpty ?? false) {
          final firstError = result.exception!.graphqlErrors.first;
          final message = firstError.message.toLowerCase();
          
          if (message.contains('invalid') || message.contains('credentials') || message.contains('password')) {
            errorMessage = 'Invalid email or password';
          } else if (message.contains('not found') || message.contains('user does not exist')) {
            errorMessage = 'No account found with this email. Please sign up first.';
          } else if (message.contains('deactivated') || message.contains('disabled')) {
            errorMessage = 'Your account has been deactivated. Please contact support.';
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
          duration: const Duration(seconds: 4),
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
          
          // Update GraphQL client with new token
          GraphQLService.updateClient();
          
          final userType = userData['userType'] as String;
          debugPrint('👤 User type: $userType');
          
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
            // Check if company profile exists
            await _checkAndNavigateBusiness();
          } else if (userType.toLowerCase() == 'candidate') {
            Get.offAllNamed('/candidate-dashboard');
          } else {
            // Default fallback
            Get.offAllNamed('/home');
          }
        } else {
          debugPrint('❌ No access_token in response');
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
      debugPrint('❌ Login error: $e');
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
    
    // Update GraphQL client to remove token
    GraphQLService.updateClient();
    
    Get.offAllNamed('/');
  }

  Future<void> signup({
    required String name,
    required String email,
    required String password,
    required UserType userType,
  }) async {
    try {
      debugPrint('📝 Attempting signup for: $email');
      
      isLoading.value = true;
      
      const String mutation = '''
        mutation CreateUser(\$input: CreateUserInput!) {
          createUser(input: \$input) {
            id
            email
            name
            userType
          }
        }
      ''';

      final variables = {
        'input': {
          'email': email,
          'password': password,
          'name': name,
          'userType': userType.toJson(),
        },
      };

      final MutationOptions options = MutationOptions(
        document: gql(mutation),
        variables: variables,
      );

      final result = await GraphQLService.client.mutate(options);

      debugPrint('✅ Signup response: ${result.data.toString()}');

      if (result.hasException) {
        debugPrint('❌ GraphQL Exception: ${result.exception.toString()}');
        
        String errorMessage = 'Signup failed';
        if (result.exception?.graphqlErrors.isNotEmpty ?? false) {
          final firstError = result.exception!.graphqlErrors.first;
          final message = firstError.message.toLowerCase();
          
          // Handle specific error cases
          if (message.contains('duplicate') || message.contains('already exists') || message.contains('unique')) {
            errorMessage = 'This email is already registered. Please use a different email or try logging in.';
          } else if (message.contains('password')) {
            errorMessage = 'Password must be at least 8 characters with uppercase, lowercase, number and special character.';
          } else if (message.contains('email')) {
            errorMessage = 'Please enter a valid email address.';
          } else {
            errorMessage = firstError.message;
          }
        }
        
        Get.snackbar(
          'Signup Failed',
          errorMessage,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: CupertinoColors.destructiveRed,
          colorText: CupertinoColors.white,
          duration: const Duration(seconds: 4),
        );
        return;
      }

      if (result.data != null && result.data!['createUser'] != null) {
        debugPrint('✅ User created successfully');
        
        // After creating user, automatically log them in
        await login(email, password);
      } else {
        debugPrint('❌ No user data in response');
        Get.snackbar(
          'Error',
          'Signup failed - please try again',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: CupertinoColors.destructiveRed,
          colorText: CupertinoColors.white,
        );
      }
    } catch (e) {
      debugPrint('❌ Signup error: $e');
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
}
