import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: Text('Settings'),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          child: const Icon(CupertinoIcons.back),
          onPressed: () => Get.back(),
        ),
      ),
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(AppTheme.spacing16),
          children: [
            // Account Section
            _buildSectionHeader('Account'),
            _buildSettingItem(
              'Profile',
              'Manage your profile information',
              CupertinoIcons.person,
              () => Get.toNamed('/profile'),
            ),
            _buildSettingItem(
              'Privacy & Security',
              'Privacy settings and data protection',
              CupertinoIcons.lock_shield,
              () => Get.toNamed('/privacy-security'),
            ),

            const SizedBox(height: AppTheme.spacing24),

            // Notifications Section
            _buildSectionHeader('Notifications'),
            _buildSettingItem(
              'Notification Preferences',
              'Customize what you want to be notified about',
              CupertinoIcons.bell_fill,
              () => Get.toNamed('/notification-preferences'),
            ),

            const SizedBox(height: AppTheme.spacing24),

            // Support Section
            _buildSectionHeader('Support'),
            _buildSettingItem(
              'Help & Support',
              'Get help and contact support',
              CupertinoIcons.question_circle,
              () => Get.toNamed('/support'),
            ),
            _buildSettingItem(
              'About',
              'App version and information',
              CupertinoIcons.info_circle,
              () => Get.toNamed('/about'),
            ),

            const SizedBox(height: AppTheme.spacing24),

            // Sign Out
            CupertinoButton(
              padding: const EdgeInsets.symmetric(vertical: AppTheme.spacing16),
              color: AppColors.error.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              onPressed: () {
                _showSignOutDialog();
              },
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    CupertinoIcons.arrow_right_square,
                    color: AppColors.error,
                  ),
                  const SizedBox(width: AppTheme.spacing8),
                  Text(
                    'Sign Out',
                    style: AppTypography.button.copyWith(
                      color: AppColors.error,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing12),
      child: Text(
        title,
        style: AppTypography.headlineSmall.copyWith(
          color: AppColors.primary600,
        ),
      ),
    );
  }

  Widget _buildSettingItem(String title, String subtitle, IconData icon, VoidCallback onTap) {
    return CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        margin: const EdgeInsets.only(bottom: AppTheme.spacing8),
        decoration: BoxDecoration(
          color: AppColors.iosSystemGrey6,
          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        ),
        child: Row(
          children: [
            Icon(icon, color: AppColors.primary600, size: 24),
            const SizedBox(width: AppTheme.spacing16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTypography.bodyLarge,
                  ),
                  const SizedBox(height: AppTheme.spacing4),
                  Text(
                    subtitle,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              CupertinoIcons.chevron_right,
              color: AppColors.iosSystemGrey,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  void _showSignOutDialog() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          CupertinoDialogAction(
            isDefaultAction: true,
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          CupertinoDialogAction(
            isDestructiveAction: true,
            onPressed: () {
              Navigator.of(context).pop();
              // TODO: Implement sign out
              Get.offAllNamed('/');
            },
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }
}