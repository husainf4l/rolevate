import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart' show Colors;
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/models/enums.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final authController = Get.find<AuthController>();
  
  UserType _selectedUserType = UserType.candidate;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _signup() async {
    debugPrint('📝 Signup button pressed');
    
    // Validation
    if (_nameController.text.isEmpty ||
        _emailController.text.isEmpty ||
        _passwordController.text.isEmpty ||
        _confirmPasswordController.text.isEmpty) {
      debugPrint('⚠️ Validation failed: Empty fields');
      Get.snackbar(
        'Validation Error',
        'Please fill in all fields',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.warning,
        colorText: CupertinoColors.white,
      );
      return;
    }

    if (_passwordController.text != _confirmPasswordController.text) {
      debugPrint('⚠️ Validation failed: Passwords do not match');
      Get.snackbar(
        'Validation Error',
        'Passwords do not match',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.warning,
        colorText: CupertinoColors.white,
      );
      return;
    }

    if (_passwordController.text.length < 8) {
      debugPrint('⚠️ Validation failed: Password too short');
      Get.snackbar(
        'Validation Error',
        'Password must be at least 8 characters',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.warning,
        colorText: CupertinoColors.white,
      );
      return;
    }

    // Check password complexity
    final password = _passwordController.text;
    final hasUppercase = password.contains(RegExp(r'[A-Z]'));
    final hasLowercase = password.contains(RegExp(r'[a-z]'));
    final hasDigit = password.contains(RegExp(r'[0-9]'));
    final hasSpecialChar = password.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'));

    if (!hasUppercase || !hasLowercase || !hasDigit || !hasSpecialChar) {
      debugPrint('⚠️ Validation failed: Password complexity requirements not met');
      Get.snackbar(
        'Validation Error',
        'Password must contain uppercase, lowercase, number, and special character',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.warning,
        colorText: CupertinoColors.white,
        duration: const Duration(seconds: 4),
      );
      return;
    }

    debugPrint('📧 Name: ${_nameController.text}');
    debugPrint('📧 Email: ${_emailController.text}');
    debugPrint('👤 User Type: ${_selectedUserType.name}');
    
    await authController.signup(
      name: _nameController.text,
      email: _emailController.text,
      password: _passwordController.text,
      userType: _selectedUserType,
    );
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        middle: Text('Sign Up'),
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppTheme.spacing20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: AppTheme.spacing40),
              // Logo
              Image.asset(
                'assets/logos/Rolevate-icon.webp',
                height: 80,
                fit: BoxFit.contain,
              ),
              const SizedBox(height: AppTheme.spacing20),
              Text(
                'Create Account',
                style: AppTypography.displayMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppTheme.spacing8),
              Text(
                'Sign up to get started',
                style: AppTypography.bodyLarge.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppTheme.spacing40),
              
              // User Type Selector
              Text(
                'I am a:',
                style: AppTypography.labelLarge.copyWith(
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: AppTheme.spacing12),
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedUserType = UserType.candidate;
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.all(AppTheme.spacing16),
                        decoration: BoxDecoration(
                          color: _selectedUserType == UserType.candidate
                              ? AppColors.primary600.withValues(alpha: 0.1)
                              : AppColors.iosSystemGrey6,
                          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                          border: Border.all(
                            color: _selectedUserType == UserType.candidate
                                ? AppColors.primary600
                                : Colors.transparent,
                            width: 2,
                          ),
                        ),
                        child: Column(
                          children: [
                            Icon(
                              CupertinoIcons.person,
                              color: _selectedUserType == UserType.candidate
                                  ? AppColors.primary600
                                  : AppColors.iosSystemGrey,
                              size: 32,
                            ),
                            const SizedBox(height: AppTheme.spacing8),
                            Text(
                              'Job Seeker',
                              style: AppTypography.labelLarge.copyWith(
                                color: _selectedUserType == UserType.candidate
                                    ? AppColors.primary600
                                    : AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: AppTheme.spacing16),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedUserType = UserType.business;
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.all(AppTheme.spacing16),
                        decoration: BoxDecoration(
                          color: _selectedUserType == UserType.business
                              ? AppColors.primary600.withValues(alpha: 0.1)
                              : AppColors.iosSystemGrey6,
                          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                          border: Border.all(
                            color: _selectedUserType == UserType.business
                                ? AppColors.primary600
                                : Colors.transparent,
                            width: 2,
                          ),
                        ),
                        child: Column(
                          children: [
                            Icon(
                              CupertinoIcons.building_2_fill,
                              color: _selectedUserType == UserType.business
                                  ? AppColors.primary600
                                  : AppColors.iosSystemGrey,
                              size: 32,
                            ),
                            const SizedBox(height: AppTheme.spacing8),
                            Text(
                              'Employer',
                              style: AppTypography.labelLarge.copyWith(
                                color: _selectedUserType == UserType.business
                                    ? AppColors.primary600
                                    : AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppTheme.spacing24),
              
              // Name field
              CupertinoTextField(
                controller: _nameController,
                placeholder: 'Full Name',
                padding: const EdgeInsets.all(AppTheme.spacing16),
                decoration: BoxDecoration(
                  color: AppColors.iosSystemGrey6,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                ),
                style: AppTypography.bodyMedium,
                prefix: const Padding(
                  padding: EdgeInsets.only(left: AppTheme.spacing16),
                  child: Icon(
                    CupertinoIcons.person,
                    color: AppColors.iosSystemGrey,
                  ),
                ),
              ),
              const SizedBox(height: AppTheme.spacing16),
              
              // Email field
              CupertinoTextField(
                controller: _emailController,
                placeholder: 'Email',
                keyboardType: TextInputType.emailAddress,
                padding: const EdgeInsets.all(AppTheme.spacing16),
                decoration: BoxDecoration(
                  color: AppColors.iosSystemGrey6,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                ),
                style: AppTypography.bodyMedium,
                prefix: const Padding(
                  padding: EdgeInsets.only(left: AppTheme.spacing16),
                  child: Icon(
                    CupertinoIcons.mail,
                    color: AppColors.iosSystemGrey,
                  ),
                ),
              ),
              const SizedBox(height: AppTheme.spacing16),
              
              // Password field
              CupertinoTextField(
                controller: _passwordController,
                placeholder: 'Password',
                obscureText: true,
                padding: const EdgeInsets.all(AppTheme.spacing16),
                decoration: BoxDecoration(
                  color: AppColors.iosSystemGrey6,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                ),
                style: AppTypography.bodyMedium,
                prefix: const Padding(
                  padding: EdgeInsets.only(left: AppTheme.spacing16),
                  child: Icon(
                    CupertinoIcons.lock,
                    color: AppColors.iosSystemGrey,
                  ),
                ),
              ),
              const SizedBox(height: AppTheme.spacing16),
              
              // Confirm Password field
              CupertinoTextField(
                controller: _confirmPasswordController,
                placeholder: 'Confirm Password',
                obscureText: true,
                padding: const EdgeInsets.all(AppTheme.spacing16),
                decoration: BoxDecoration(
                  color: AppColors.iosSystemGrey6,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                ),
                style: AppTypography.bodyMedium,
                prefix: const Padding(
                  padding: EdgeInsets.only(left: AppTheme.spacing16),
                  child: Icon(
                    CupertinoIcons.lock_fill,
                    color: AppColors.iosSystemGrey,
                  ),
                ),
              ),
              const SizedBox(height: AppTheme.spacing24),
              
              // Sign up button
              Obx(() => CupertinoButton(
                    color: AppColors.primary600,
                    borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                    onPressed: authController.isLoading.value ? null : _signup,
                    child: authController.isLoading.value
                        ? const CupertinoActivityIndicator(
                            color: CupertinoColors.white,
                          )
                        : Text(
                            'Sign Up',
                            style: AppTypography.button.copyWith(
                              color: CupertinoColors.white,
                            ),
                          ),
                  )),
              const SizedBox(height: AppTheme.spacing20),
              
              // Login link
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Already have an account? ',
                    style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  CupertinoButton(
                    padding: EdgeInsets.zero,
                    child: Text(
                      'Login',
                      style: AppTypography.button.copyWith(
                        color: AppColors.primary600,
                      ),
                    ),
                    onPressed: () {
                      Get.back();
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
