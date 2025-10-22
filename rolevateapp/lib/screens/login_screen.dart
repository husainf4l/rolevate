import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final authController = Get.find<AuthController>();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    print('📝 Login button pressed');
    
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      print('⚠️ Validation failed: Empty email or password');
      Get.snackbar(
        'Validation Error',
        'Please enter both email and password',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.warning,
        colorText: CupertinoColors.white,
      );
      return;
    }

    print('📧 Email: ${_emailController.text}');
    print('🔑 Password: ${_passwordController.text.replaceAll(RegExp(r'.'), '*')}');
    
    await authController.login(
      _emailController.text,
      _passwordController.text,
    );
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        middle: Text('Login'),
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
                'Welcome Back',
                style: AppTypography.displayMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppTheme.spacing8),
              Text(
                'Sign in to continue',
                style: AppTypography.bodyLarge.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppTheme.spacing40),
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
              const SizedBox(height: AppTheme.spacing12),
              // Forgot password
              Align(
                alignment: Alignment.centerRight,
                child: CupertinoButton(
                  padding: EdgeInsets.zero,
                  child: Text(
                    'Forgot Password?',
                    style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.primary600,
                    ),
                  ),
                  onPressed: () {
                    // Handle forgot password
                  },
                ),
              ),
              const SizedBox(height: AppTheme.spacing24),
              // Login button
              Obx(() => CupertinoButton(
                    color: AppColors.primary600,
                    borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                    onPressed: authController.isLoading.value ? null : _login,
                    child: authController.isLoading.value
                        ? const CupertinoActivityIndicator(
                            color: CupertinoColors.white,
                          )
                        : Text(
                            'Login',
                            style: AppTypography.button.copyWith(
                              color: CupertinoColors.white,
                            ),
                          ),
                  )),
              const SizedBox(height: AppTheme.spacing20),
              // Sign up link
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "Don't have an account? ",
                    style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  CupertinoButton(
                    padding: EdgeInsets.zero,
                    minSize: 0,
                    child: Text(
                      'Sign Up',
                      style: AppTypography.button.copyWith(
                        color: AppColors.primary600,
                      ),
                    ),
                    onPressed: () {
                      Get.toNamed('/signup');
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
