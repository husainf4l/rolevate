import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as path;
import 'package:get_storage/get_storage.dart';
import 'dart:io';

class UserService {
  final _storage = GetStorage();
  
  /// Upload user avatar/profile picture
  Future<String> uploadAvatar(File imageFile) async {
    debugPrint('🔧 UserService.uploadAvatar called');
    
    try {
      // TEMPORARY: Mock implementation for testing
      debugPrint('🎭 Using mock implementation for avatar upload');
      
      // Copy the file to permanent storage
      final appDir = await getApplicationDocumentsDirectory();
      final fileName = 'avatar_${DateTime.now().millisecondsSinceEpoch}${path.extension(imageFile.path)}';
      final permanentPath = path.join(appDir.path, 'avatars', fileName);
      
      // Create avatars directory if it doesn't exist
      final avatarsDir = Directory(path.join(appDir.path, 'avatars'));
      if (!await avatarsDir.exists()) {
        await avatarsDir.create(recursive: true);
      }
      
      // Delete old avatar file if exists
      final oldAvatarPath = _storage.read('avatar_local_path');
      if (oldAvatarPath != null) {
        try {
          final oldFile = File(oldAvatarPath);
          if (await oldFile.exists()) {
            await oldFile.delete();
            debugPrint('🗑️ Deleted old avatar: $oldAvatarPath');
          }
        } catch (e) {
          debugPrint('⚠️ Could not delete old avatar: $e');
        }
      }
      
      // Copy the file to permanent location
      final permanentFile = await imageFile.copy(permanentPath);
      debugPrint('📁 Avatar copied to permanent storage: $permanentPath');
      
      // SAVE TO GetStorage - THIS IS THE KEY!!!
      await _storage.write('avatar_local_path', permanentFile.path);
      debugPrint('💾 Avatar path saved to GetStorage: ${permanentFile.path}');
      
      // Simulate API delay
      await Future.delayed(const Duration(seconds: 2));
      
      // Return the permanent file path as file:// URL
      final mockAvatarUrl = 'file://${permanentFile.path}';
      
      debugPrint('✅ Mock avatar uploaded successfully: $mockAvatarUrl');
      return mockAvatarUrl;
      
      /*
      // ORIGINAL CODE - Uncomment when backend is ready
      final token = _storage.read('access_token');
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final uri = Uri.parse('https://rolevate.com/api/upload/avatar');
      final request = http.MultipartRequest('POST', uri);
      
      // Add authentication header
      request.headers['Authorization'] = 'Bearer $token';
      
      // Add the file
      request.files.add(
        await http.MultipartFile.fromPath(
          'avatar',
          imageFile.path,
        ),
      );

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode != 200 && response.statusCode != 201) {
        throw Exception('Failed to upload avatar: ${response.body}');
      }

      // Parse response to get avatar URL
      final responseData = jsonDecode(response.body);
      final avatarUrl = responseData['avatarUrl'] ?? responseData['url'];
      
      if (avatarUrl == null) {
        throw Exception('No avatar URL returned from server');
      }

      debugPrint('✅ Avatar uploaded successfully: $avatarUrl');
      return avatarUrl;
      */
    } catch (e) {
      debugPrint('❌ Error uploading avatar: $e');
      rethrow;
    }
  }

  /// Get the locally saved avatar path
  String? getSavedAvatarPath() {
    final savedPath = _storage.read('avatar_local_path');
    if (savedPath != null) {
      debugPrint('📂 Retrieved saved avatar path: $savedPath');
      // Verify file still exists
      final file = File(savedPath);
      if (file.existsSync()) {
        return savedPath;
      } else {
        debugPrint('⚠️ Saved avatar file no longer exists, clearing storage');
        _storage.remove('avatar_local_path');
        return null;
      }
    }
    return null;
  }

  /// Update user profile
  Future<Map<String, dynamic>> updateProfile({
    String? name,
    String? email,
    String? phone,
    String? avatar,
  }) async {
    debugPrint('🔧 UserService.updateProfile called');
    
    // TEMPORARY: Mock implementation for testing
    debugPrint('🎭 Using mock implementation for profile update');
    
    // Simulate API delay
    await Future.delayed(const Duration(seconds: 1));
    
    // Create a mock user response
    final mockUserData = {
      'id': 'mock-user-id',
      'email': email ?? 'user@example.com',
      'name': name ?? 'Mock User',
      'phone': phone,
      'avatar': avatar,
      'userType': 'CANDIDATE',
    };
    
    debugPrint('✅ Mock profile updated successfully');
    return Map<String, dynamic>.from(mockUserData);
    
    /*
    // ORIGINAL CODE - Uncomment when backend is ready
    const String mutation = '''
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

    final variables = {
      'input': {
        if (name != null) 'name': name,
        if (email != null) 'email': email,
        if (phone != null) 'phone': phone,
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

    final userData = result.data?['updateProfile'];
    if (userData == null) {
      throw Exception('Failed to update profile');
    }

    return Map<String, dynamic>.from(userData);
    */
  }

  /// Change user password
  Future<bool> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    debugPrint('🔧 UserService.changePassword called');
    
    // TEMPORARY: Mock implementation for testing
    debugPrint('🎭 Using mock implementation for password change');
    
    // Simulate API delay
    await Future.delayed(const Duration(seconds: 1));
    
    debugPrint('✅ Mock password changed successfully');
    return true;
    
    /*
    // ORIGINAL CODE - Uncomment when backend is ready
    const String mutation = '''
      mutation ChangePassword(\$input: ChangePasswordInput!) {
        changePassword(input: \$input)
      }
    ''';

    final variables = {
      'input': {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
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

    return result.data?['changePassword'] ?? false;
    */
  }
}