import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';

class CompanySettingsScreen extends StatefulWidget {
  const CompanySettingsScreen({super.key});

  @override
  State<CompanySettingsScreen> createState() => _CompanySettingsScreenState();
}

class _CompanySettingsScreenState extends State<CompanySettingsScreen> {
  final AuthController authController = Get.find<AuthController>();

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: Text('Company Settings'),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          child: const Icon(CupertinoIcons.back),
          onPressed: () => Get.back(),
        ),
      ),
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(AppTheme.spacing20),
          children: [
            // Company Profile Section
            _buildSectionHeader('Company Profile'),
            const SizedBox(height: AppTheme.spacing16),
            _buildSettingsItem(
              title: 'Company Information',
              subtitle: 'Update company details and logo',
              icon: CupertinoIcons.building_2_fill,
              onTap: () {
                // TODO: Navigate to company profile edit
                Get.snackbar(
                  'Coming Soon',
                  'Company profile editing will be available soon',
                  snackPosition: SnackPosition.BOTTOM,
                );
              },
            ),
            _buildDivider(),

            // Job Management Section
            _buildSectionHeader('Job Management'),
            const SizedBox(height: AppTheme.spacing16),
            _buildSettingsItem(
              title: 'Posted Jobs',
              subtitle: 'Manage your job postings',
              icon: CupertinoIcons.briefcase_fill,
              onTap: () {
                Get.toNamed('/jobs');
              },
            ),
            _buildDivider(),
            _buildSettingsItem(
              title: 'Applications',
              subtitle: 'Review candidate applications',
              icon: CupertinoIcons.doc_person_fill,
              onTap: () {
                Get.toNamed('/applications');
              },
            ),
            _buildDivider(),

            // Account Settings Section
            _buildSectionHeader('Account Settings'),
            const SizedBox(height: AppTheme.spacing16),
            _buildSettingsItem(
              title: 'Profile Settings',
              subtitle: 'Update your account information',
              icon: CupertinoIcons.person_fill,
              onTap: () {
                Get.toNamed('/edit-profile');
              },
            ),
            _buildDivider(),
            _buildSettingsItem(
              title: 'Change Password',
              subtitle: 'Update your password',
              icon: CupertinoIcons.lock_fill,
              onTap: () {
                Get.toNamed('/change-password');
              },
            ),
            _buildDivider(),
            _buildSettingsItem(
              title: 'Notifications',
              subtitle: 'Manage notification preferences',
              icon: CupertinoIcons.bell_fill,
              onTap: () {
                Get.toNamed('/notifications');
              },
            ),
            _buildDivider(),

            // Support Section
            _buildSectionHeader('Support'),
            const SizedBox(height: AppTheme.spacing16),
            _buildSettingsItem(
              title: 'Help & Support',
              subtitle: 'Get help and contact support',
              icon: CupertinoIcons.question_circle_fill,
              onTap: () {
                // TODO: Navigate to help screen
                Get.snackbar(
                  'Coming Soon',
                  'Help & Support will be available soon',
                  snackPosition: SnackPosition.BOTTOM,
                );
              },
            ),
            _buildDivider(),
            _buildSettingsItem(
              title: 'Privacy Policy',
              subtitle: 'Read our privacy policy',
              icon: CupertinoIcons.hand_raised_fill,
              onTap: () {
                // TODO: Navigate to privacy policy
                Get.snackbar(
                  'Coming Soon',
                  'Privacy Policy will be available soon',
                  snackPosition: SnackPosition.BOTTOM,
                );
              },
            ),
            _buildDivider(),
            _buildSettingsItem(
              title: 'Terms of Service',
              subtitle: 'Read our terms of service',
              icon: CupertinoIcons.doc_fill,
              onTap: () {
                // TODO: Navigate to terms of service
                Get.snackbar(
                  'Coming Soon',
                  'Terms of Service will be available soon',
                  snackPosition: SnackPosition.BOTTOM,
                );
              },
            ),
            _buildDivider(),

            // Sign Out
            const SizedBox(height: AppTheme.spacing32),
            CupertinoButton(
              color: AppColors.error,
              borderRadius: BorderRadius.circular(AppTheme.radiusLg),
              padding: const EdgeInsets.symmetric(vertical: AppTheme.spacing16),
              child: const Text(
                'Sign Out',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              onPressed: () {
                _showSignOutDialog();
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: AppTypography.headlineMedium.copyWith(
        color: AppColors.primary600,
        fontWeight: FontWeight.w600,
      ),
    );
  }

  Widget _buildSettingsItem({
    required String title,
    required String subtitle,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppTheme.spacing16,
          vertical: AppTheme.spacing16,
        ),
        decoration: AppTheme.cardDecoration(),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(AppTheme.spacing12),
              decoration: BoxDecoration(
                color: AppColors.primary50,
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              ),
              child: Icon(
                icon,
                color: AppColors.primary600,
                size: 20,
              ),
            ),
            const SizedBox(width: AppTheme.spacing16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTypography.bodyLarge.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: AppTheme.spacing4),
                  Text(
                    subtitle,
                    style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              CupertinoIcons.chevron_right,
              color: AppColors.textTertiary,
              size: 16,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDivider() {
    return const SizedBox(height: AppTheme.spacing12);
  }

  void _showSignOutDialog() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          CupertinoDialogAction(
            child: const Text('Cancel'),
            onPressed: () => Get.back(),
          ),
          CupertinoDialogAction(
            isDestructiveAction: true,
            child: const Text('Sign Out'),
            onPressed: () {
              Get.back();
              authController.logout();
            },
          ),
        ],
      ),
    );
  }
}