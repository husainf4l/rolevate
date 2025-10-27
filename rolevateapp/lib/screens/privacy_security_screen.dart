import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';

class PrivacySecurityScreen extends StatefulWidget {
  const PrivacySecurityScreen({super.key});

  @override
  State<PrivacySecurityScreen> createState() => _PrivacySecurityScreenState();
}

class _PrivacySecurityScreenState extends State<PrivacySecurityScreen> {
  final AuthController _authController = Get.find<AuthController>();
  
  bool _profileVisibility = true;
  bool _showEmail = true;
  bool _showPhone = true;
  bool _allowMessages = true;
  bool _twoFactorAuth = false;

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: const Text('Privacy & Security'),
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
            // Privacy Section
            _buildSectionHeader('Privacy Settings'),
            const SizedBox(height: AppTheme.spacing16),
            
            _buildToggleItem(
              icon: CupertinoIcons.eye,
              title: 'Profile Visibility',
              subtitle: 'Allow employers to view your profile',
              value: _profileVisibility,
              onChanged: (value) {
                setState(() => _profileVisibility = value);
              },
            ),
            const SizedBox(height: AppTheme.spacing12),
            
            _buildToggleItem(
              icon: CupertinoIcons.mail,
              title: 'Show Email',
              subtitle: 'Display email on your profile',
              value: _showEmail,
              onChanged: (value) {
                setState(() => _showEmail = value);
              },
            ),
            const SizedBox(height: AppTheme.spacing12),
            
            _buildToggleItem(
              icon: CupertinoIcons.phone,
              title: 'Show Phone Number',
              subtitle: 'Display phone number on your profile',
              value: _showPhone,
              onChanged: (value) {
                setState(() => _showPhone = value);
              },
            ),
            const SizedBox(height: AppTheme.spacing12),
            
            _buildToggleItem(
              icon: CupertinoIcons.chat_bubble,
              title: 'Allow Messages',
              subtitle: 'Receive messages from employers',
              value: _allowMessages,
              onChanged: (value) {
                setState(() => _allowMessages = value);
              },
            ),
            
            const SizedBox(height: AppTheme.spacing32),
            
            // Security Section
            _buildSectionHeader('Security Settings'),
            const SizedBox(height: AppTheme.spacing16),
            
            _buildToggleItem(
              icon: CupertinoIcons.lock_shield,
              title: 'Two-Factor Authentication',
              subtitle: 'Add an extra layer of security',
              value: _twoFactorAuth,
              onChanged: (value) {
                setState(() => _twoFactorAuth = value);
                _showTwoFactorDialog(value);
              },
            ),
            const SizedBox(height: AppTheme.spacing12),
            
            _buildActionItem(
              icon: CupertinoIcons.lock_rotation,
              title: 'Change Password',
              subtitle: 'Update your account password',
              onTap: _showChangePasswordDialog,
            ),
            const SizedBox(height: AppTheme.spacing12),
            
            _buildActionItem(
              icon: CupertinoIcons.device_phone_portrait,
              title: 'Active Sessions',
              subtitle: 'Manage logged-in devices',
              onTap: _showActiveSessionsDialog,
            ),
            
            const SizedBox(height: AppTheme.spacing32),
            
            // Data Management
            _buildSectionHeader('Data Management'),
            const SizedBox(height: AppTheme.spacing16),
            
            _buildActionItem(
              icon: CupertinoIcons.cloud_download,
              title: 'Download My Data',
              subtitle: 'Export your personal information',
              onTap: _showDownloadDataDialog,
            ),
            const SizedBox(height: AppTheme.spacing12),
            
            _buildActionItem(
              icon: CupertinoIcons.trash,
              title: 'Delete Account',
              subtitle: 'Permanently delete your account',
              onTap: _showDeleteAccountDialog,
              isDestructive: true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: AppTypography.headlineSmall.copyWith(
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildToggleItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.spacing16),
      decoration: BoxDecoration(
        color: AppColors.iosSystemGrey6,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.primary600.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(AppTheme.radiusSm),
            ),
            child: Icon(
              icon,
              color: AppColors.primary600,
              size: 24,
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
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          CupertinoSwitch(
            value: value,
            onChanged: onChanged,
            activeTrackColor: AppColors.primary600,
          ),
        ],
      ),
    );
  }

  Widget _buildActionItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    return CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        decoration: BoxDecoration(
          color: AppColors.iosSystemGrey6,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
              color: isDestructive
                  ? CupertinoColors.systemRed.withValues(alpha: 0.1)
                  : AppColors.primary600.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppTheme.radiusSm),
              ),
              child: Icon(
                icon,
                color: isDestructive ? CupertinoColors.systemRed : AppColors.primary600,
                size: 24,
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
                      color: isDestructive ? CupertinoColors.systemRed : AppColors.textPrimary,
                    ),
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
            Icon(
              CupertinoIcons.chevron_right,
              color: AppColors.textTertiary,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  void _showTwoFactorDialog(bool enabled) {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: Text(enabled ? 'Enable 2FA' : 'Disable 2FA'),
        content: Text(
          enabled
              ? 'Two-factor authentication adds an extra layer of security to your account.'
              : 'Are you sure you want to disable two-factor authentication?',
        ),
        actions: [
          CupertinoDialogAction(
            child: const Text('Cancel'),
            onPressed: () {
              setState(() => _twoFactorAuth = !enabled);
              Get.back();
            },
          ),
          CupertinoDialogAction(
            isDefaultAction: true,
            child: const Text('Confirm'),
            onPressed: () {
              Get.back();
              Get.snackbar(
                enabled ? 'Enabled' : 'Disabled',
                enabled
                    ? 'Two-factor authentication has been enabled'
                    : 'Two-factor authentication has been disabled',
                snackPosition: SnackPosition.BOTTOM,
              );
            },
          ),
        ],
      ),
    );
  }

  void _showChangePasswordDialog() {
    final currentPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();

    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Change Password'),
        content: Column(
          children: [
            const SizedBox(height: 16),
            CupertinoTextField(
              controller: currentPasswordController,
              placeholder: 'Current Password',
              obscureText: true,
            ),
            const SizedBox(height: 12),
            CupertinoTextField(
              controller: newPasswordController,
              placeholder: 'New Password',
              obscureText: true,
            ),
            const SizedBox(height: 12),
            CupertinoTextField(
              controller: confirmPasswordController,
              placeholder: 'Confirm Password',
              obscureText: true,
            ),
          ],
        ),
        actions: [
          CupertinoDialogAction(
            child: const Text('Cancel'),
            onPressed: () => Get.back(),
          ),
          CupertinoDialogAction(
            isDefaultAction: true,
            child: const Text('Change'),
            onPressed: () {
              if (newPasswordController.text != confirmPasswordController.text) {
                Get.snackbar(
                  'Error',
                  'Passwords do not match',
                  snackPosition: SnackPosition.BOTTOM,
                );
                return;
              }
              Get.back();
              Get.snackbar(
                'Success',
                'Password changed successfully',
                snackPosition: SnackPosition.BOTTOM,
              );
            },
          ),
        ],
      ),
    );
  }

  void _showActiveSessionsDialog() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Active Sessions'),
        content: const Text(
          'Current Device: iPhone\nLast Active: Just now\n\nNo other active sessions.',
        ),
        actions: [
          CupertinoDialogAction(
            child: const Text('Close'),
            onPressed: () => Get.back(),
          ),
        ],
      ),
    );
  }

  void _showDownloadDataDialog() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Download Data'),
        content: const Text(
          'We will prepare your data and send a download link to your email within 24 hours.',
        ),
        actions: [
          CupertinoDialogAction(
            child: const Text('Cancel'),
            onPressed: () => Get.back(),
          ),
          CupertinoDialogAction(
            isDefaultAction: true,
            child: const Text('Request'),
            onPressed: () {
              Get.back();
              Get.snackbar(
                'Request Sent',
                'You will receive an email with your data shortly',
                snackPosition: SnackPosition.BOTTOM,
              );
            },
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Delete Account'),
        content: const Text(
          'Are you sure you want to delete your account? This action cannot be undone.',
        ),
        actions: [
          CupertinoDialogAction(
            child: const Text('Cancel'),
            onPressed: () => Get.back(),
          ),
          CupertinoDialogAction(
            isDestructiveAction: true,
            child: const Text('Delete'),
            onPressed: () {
              Get.back();
              Get.snackbar(
                'Account Deleted',
                'Your account has been permanently deleted',
                snackPosition: SnackPosition.BOTTOM,
              );
              _authController.logout();
            },
          ),
        ],
      ),
    );
  }
}
