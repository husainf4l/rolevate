import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/services/user_service.dart';

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final authController = Get.find<AuthController>();
  final _formKey = GlobalKey<FormState>();

  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _isLoading = false;
  bool _obscureCurrentPassword = true;
  bool _obscureNewPassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _changePassword() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final userService = UserService();
      final success = await userService.changePassword(
        currentPassword: _currentPasswordController.text,
        newPassword: _newPasswordController.text,
      );

      if (success) {
        Get.back();
        Get.snackbar(
          'Success',
          'Password changed successfully',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: CupertinoColors.systemGreen,
          colorText: CupertinoColors.white,
        );
      } else {
        Get.snackbar(
          'Error',
          'Failed to change password',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: CupertinoColors.destructiveRed,
          colorText: CupertinoColors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to change password: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: CupertinoColors.destructiveRed,
        colorText: CupertinoColors.white,
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!RegExp(r'(?=.*[a-z])').hasMatch(value)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!RegExp(r'(?=.*[A-Z])').hasMatch(value)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!RegExp(r'(?=.*\d)').hasMatch(value)) {
      return 'Password must contain at least one number';
    }
    if (!RegExp(r'(?=.*[@$!%*?&])').hasMatch(value)) {
      return 'Password must contain at least one special character';
    }
    return null;
  }

  String? _validateConfirmPassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please confirm your password';
    }
    if (value != _newPasswordController.text) {
      return 'Passwords do not match';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: const Text('Change Password'),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          child: const Icon(CupertinoIcons.back),
          onPressed: () => Get.back(),
        ),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: _isLoading ? null : _changePassword,
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
              // Header
              Text(
                'Change your password',
                style: AppTypography.headlineMedium,
              ),
              const SizedBox(height: AppTheme.spacing8),
              Text(
                'Enter your current password and choose a new one.',
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),

              const SizedBox(height: AppTheme.spacing32),

              // Form fields
              _buildPasswordField(
                controller: _currentPasswordController,
                label: 'Current Password',
                placeholder: 'Enter your current password',
                obscureText: _obscureCurrentPassword,
                onToggleVisibility: () => setState(() =>
                    _obscureCurrentPassword = !_obscureCurrentPassword),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Current password is required';
                  }
                  return null;
                },
              ),

              const SizedBox(height: AppTheme.spacing16),

              _buildPasswordField(
                controller: _newPasswordController,
                label: 'New Password',
                placeholder: 'Enter your new password',
                obscureText: _obscureNewPassword,
                onToggleVisibility: () => setState(() =>
                    _obscureNewPassword = !_obscureNewPassword),
                validator: _validatePassword,
              ),

              const SizedBox(height: AppTheme.spacing16),

              _buildPasswordField(
                controller: _confirmPasswordController,
                label: 'Confirm New Password',
                placeholder: 'Confirm your new password',
                obscureText: _obscureConfirmPassword,
                onToggleVisibility: () => setState(() =>
                    _obscureConfirmPassword = !_obscureConfirmPassword),
                validator: _validateConfirmPassword,
              ),

              const SizedBox(height: AppTheme.spacing32),

              // Password requirements
              Container(
                padding: const EdgeInsets.all(AppTheme.spacing16),
                decoration: BoxDecoration(
                  color: AppColors.iosSystemGrey6,
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Password Requirements:',
                      style: AppTypography.bodyMedium.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: AppTheme.spacing8),
                    _buildRequirement('At least 8 characters'),
                    _buildRequirement('One uppercase letter'),
                    _buildRequirement('One lowercase letter'),
                    _buildRequirement('One number'),
                    _buildRequirement('One special character (@\$!%*?&)'),
                  ],
                ),
              ),

              const SizedBox(height: AppTheme.spacing32),

              // Save button
              CupertinoButton.filled(
                onPressed: _isLoading ? null : _changePassword,
                child: _isLoading
                    ? const CupertinoActivityIndicator(color: CupertinoColors.white)
                    : const Text(
                        'Change Password',
                        style: TextStyle(
                          color: CupertinoColors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPasswordField({
    required TextEditingController controller,
    required String label,
    required String placeholder,
    required bool obscureText,
    required VoidCallback onToggleVisibility,
    required String? Function(String?) validator,
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
        Container(
          decoration: BoxDecoration(
            color: AppColors.iosSystemGrey6,
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          ),
          child: Row(
            children: [
              Padding(
                padding: const EdgeInsets.only(left: AppTheme.spacing16),
                child: Icon(
                  CupertinoIcons.lock,
                  color: AppColors.primary600,
                  size: 20,
                ),
              ),
              Expanded(
                child: CupertinoTextFormFieldRow(
                  controller: controller,
                  placeholder: placeholder,
                  obscureText: obscureText,
                  padding: const EdgeInsets.all(AppTheme.spacing16),
                  decoration: BoxDecoration(
                    color: CupertinoColors.white.withValues(alpha: 0),
                  ),
                  validator: validator,
                ),
              ),
              CupertinoButton(
                padding: const EdgeInsets.only(right: AppTheme.spacing16),
                onPressed: onToggleVisibility,
                child: Icon(
                  obscureText ? CupertinoIcons.eye : CupertinoIcons.eye_slash,
                  color: AppColors.iosSystemGrey,
                  size: 20,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRequirement(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing4),
      child: Row(
        children: [
          Icon(
            CupertinoIcons.checkmark,
            color: AppColors.success,
            size: 16,
          ),
          const SizedBox(width: AppTheme.spacing8),
          Text(
            text,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}