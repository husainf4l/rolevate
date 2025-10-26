import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/services/user_service.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final authController = Get.find<AuthController>();
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    final user = authController.user.value;
    _nameController = TextEditingController(text: user?['name'] ?? '');
    _emailController = TextEditingController(text: user?['email'] ?? '');
    _phoneController = TextEditingController(text: user?['phone'] ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _updateProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final userService = UserService();
      final updatedUser = await userService.updateProfile(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        phone: _phoneController.text.trim(),
      );

      // Update local state with the response
      authController.user.value = updatedUser;

      Get.back();
      Get.snackbar(
        'Success',
        'Profile updated successfully',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: CupertinoColors.systemGreen,
        colorText: CupertinoColors.white,
      );
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to update profile: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: CupertinoColors.destructiveRed,
        colorText: CupertinoColors.white,
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: const Text('Edit Profile'),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          child: const Icon(CupertinoIcons.back),
          onPressed: () => Get.back(),
        ),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: _isLoading ? null : _updateProfile,
          child: _isLoading
              ? const CupertinoActivityIndicator()
              : const Text('Save'),
        ),
      ),
      child: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(AppTheme.spacing16),
            children: [
              // Profile picture placeholder
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: AppColors.primary600,
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          _nameController.text.isNotEmpty
                              ? _nameController.text[0].toUpperCase()
                              : 'U',
                          style: AppTypography.displayLarge.copyWith(
                            color: CupertinoColors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: AppTheme.spacing12),
                    CupertinoButton(
                      onPressed: () {
                        // TODO: Implement profile picture upload
                        Get.snackbar(
                          'Coming Soon',
                          'Profile picture upload will be available soon',
                          snackPosition: SnackPosition.BOTTOM,
                        );
                      },
                      child: Text(
                        'Change Photo',
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.primary600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppTheme.spacing32),

              // Form fields
              _buildTextField(
                controller: _nameController,
                label: 'Full Name',
                placeholder: 'Enter your full name',
                icon: CupertinoIcons.person,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Name is required';
                  }
                  if (value.trim().length < 2) {
                    return 'Name must be at least 2 characters';
                  }
                  return null;
                },
              ),

              const SizedBox(height: AppTheme.spacing16),

              _buildTextField(
                controller: _emailController,
                label: 'Email',
                placeholder: 'Enter your email',
                icon: CupertinoIcons.mail,
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Email is required';
                  }
                  final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
                  if (!emailRegex.hasMatch(value.trim())) {
                    return 'Please enter a valid email';
                  }
                  return null;
                },
              ),

              const SizedBox(height: AppTheme.spacing16),

              _buildTextField(
                controller: _phoneController,
                label: 'Phone Number',
                placeholder: 'Enter your phone number',
                icon: CupertinoIcons.phone,
                keyboardType: TextInputType.phone,
                validator: (value) {
                  if (value != null && value.trim().isNotEmpty) {
                    // Basic phone validation - adjust as needed
                    final phoneRegex = RegExp(r'^\+?[\d\s\-\(\)]{10,}$');
                    if (!phoneRegex.hasMatch(value.trim())) {
                      return 'Please enter a valid phone number';
                    }
                  }
                  return null;
                },
              ),

              const SizedBox(height: AppTheme.spacing32),

              // Save button
              CupertinoButton.filled(
                onPressed: _isLoading ? null : _updateProfile,
                child: _isLoading
                    ? const CupertinoActivityIndicator()
                    : const Text('Save Changes'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String placeholder,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTypography.bodyLarge.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: AppTheme.spacing8),
        CupertinoTextFormFieldRow(
          controller: controller,
          placeholder: placeholder,
          keyboardType: keyboardType,
          prefix: Padding(
            padding: const EdgeInsets.only(right: AppTheme.spacing12),
            child: Icon(
              icon,
              color: AppColors.primary600,
              size: 20,
            ),
          ),
          padding: const EdgeInsets.all(AppTheme.spacing16),
          decoration: BoxDecoration(
            color: AppColors.iosSystemGrey6,
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          ),
          validator: validator,
        ),
      ],
    );
  }
}