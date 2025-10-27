import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';

class AppDrawer extends StatelessWidget {
  final VoidCallback onClose;
  
  const AppDrawer({super.key, required this.onClose});

  @override
  Widget build(BuildContext context) {
    final authController = Get.find<AuthController>();

    return Container(
      width: MediaQuery.of(context).size.width * 0.80,
      height: MediaQuery.of(context).size.height,
      decoration: BoxDecoration(
        color: CupertinoColors.white,
        boxShadow: [
          BoxShadow(
            color: CupertinoColors.black.withValues(alpha: 0.2),
            offset: const Offset(2, 0),
            blurRadius: 8,
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(AppTheme.spacing24),
              decoration: BoxDecoration(
                color: AppColors.primary600,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Flexible(
                        child: Image.asset(
                          'assets/logos/Rolevate.webp',
                          height: 40,
                          fit: BoxFit.contain,
                        ),
                      ),
                      CupertinoButton(
                        padding: EdgeInsets.zero,
                        onPressed: onClose,
                        child: const Icon(
                          CupertinoIcons.xmark,
                          color: CupertinoColors.white,
                          size: 20,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppTheme.spacing16),
                  Obx(() {
                    if (authController.isAuthenticated.value) {
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            authController.user.value?['name'] ?? 'User',
                            style: AppTypography.headlineMedium.copyWith(
                              color: CupertinoColors.white,
                            ),
                          ),
                          const SizedBox(height: AppTheme.spacing4),
                          Text(
                            authController.user.value?['email'] ?? '',
                            style: AppTypography.bodySmall.copyWith(
                              color: CupertinoColors.white.withValues(alpha: 0.9),
                            ),
                          ),
                        ],
                      );
                    } else {
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Image.asset(
                                'assets/logos/Rolevate-icon.webp',
                                height: 24,
                                fit: BoxFit.contain,
                              ),
                              const SizedBox(width: AppTheme.spacing8),
                              Text(
                                'Welcome to RoleVate',
                                style: AppTypography.headlineMedium.copyWith(
                                  color: CupertinoColors.white,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: AppTheme.spacing12),
                          CupertinoButton(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppTheme.spacing20,
                              vertical: AppTheme.spacing12,
                            ),
                            color: CupertinoColors.white,
                            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                            onPressed: () {
                              onClose();
                              Get.toNamed('/login');
                            },
                            child: Text(
                              'Sign In',
                              style: AppTypography.button.copyWith(
                                color: AppColors.primary600,
                              ),
                            ),
                          ),
                        ],
                      );
                    }
                  }),
                ],
              ),
            ),
            
            // Menu Items
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  _buildMenuItem(
                    icon: CupertinoIcons.home,
                    title: 'Home',
                    onTap: () {
                      Get.offAllNamed('/');
                    },
                  ),
                  _buildMenuItem(
                    icon: CupertinoIcons.search,
                    title: 'Browse Jobs',
                    onTap: () {
                      Get.toNamed('/browse-jobs');
                    },
                  ),
                  Obx(() {
                    if (authController.isAuthenticated.value) {
                      return Column(
                        children: [
                          _buildMenuItem(
                            icon: CupertinoIcons.person,
                            title: 'My Profile',
                            onTap: () {
                              Get.toNamed('/profile');
                            },
                          ),
                          _buildMenuItem(
                            icon: CupertinoIcons.bookmark,
                            title: 'Saved Jobs',
                            onTap: () {
                              Get.toNamed('/saved-jobs');
                            },
                          ),
                          _buildMenuItem(
                            icon: CupertinoIcons.doc_text,
                            title: 'My Applications',
                            onTap: () {
                              Get.toNamed('/my-applications');
                            },
                          ),
                          _buildMenuItem(
                            icon: CupertinoIcons.bell,
                            title: 'Notifications',
                            onTap: () {
                              Get.toNamed('/notifications');
                            },
                          ),
                        ],
                      );
                    } else {
                      return const SizedBox.shrink();
                    }
                  }),
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppTheme.spacing16,
                      vertical: AppTheme.spacing8,
                    ),
                    child: Container(
                      height: 0.5,
                      color: AppColors.iosSystemGrey5,
                    ),
                  ),
                  Obx(() {
                    if (authController.isAuthenticated.value) {
                      return Column(
                        children: [
                          _buildMenuItem(
                            icon: CupertinoIcons.settings,
                            title: 'Settings',
                            onTap: () {
                              Get.toNamed('/settings');
                            },
                          ),
                          _buildMenuItem(
                            icon: CupertinoIcons.question_circle,
                            title: 'Help & Support',
                            onTap: () {
                              Get.toNamed('/support');
                            },
                          ),
                          _buildMenuItem(
                            icon: CupertinoIcons.info_circle,
                            title: 'About',
                            onTap: () {
                              Get.toNamed('/about');
                            },
                          ),
                        ],
                      );
                    } else {
                      return const SizedBox.shrink();
                    }
                  }),
                ],
              ),
            ),
            
            // Footer - Sign Out Button
            Obx(() {
              if (authController.isAuthenticated.value) {
                return Container(
                  padding: const EdgeInsets.all(AppTheme.spacing16),
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(
                        color: AppColors.iosSystemGrey5,
                        width: 0.5,
                      ),
                    ),
                  ),
                  child: CupertinoButton(
                    padding: const EdgeInsets.symmetric(
                      vertical: AppTheme.spacing12,
                    ),
                    color: AppColors.error.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                    onPressed: () {
                      onClose();
                      _showSignOutDialog(context);
                    },
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          CupertinoIcons.arrow_right_square,
                          color: AppColors.error,
                          size: 20,
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
                );
              } else {
                return const SizedBox.shrink();
              }
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: () {
        onClose();
        onTap();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppTheme.spacing16,
          vertical: AppTheme.spacing16,
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: AppColors.textPrimary,
              size: 24,
            ),
            const SizedBox(width: AppTheme.spacing16),
            Text(
              title,
              style: AppTypography.bodyLarge.copyWith(
                color: AppColors.textPrimary,
              ),
            ),
            const Spacer(),
            Icon(
              CupertinoIcons.chevron_right,
              color: AppColors.iosSystemGrey,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  void _showSignOutDialog(BuildContext context) {
    final authController = Get.find<AuthController>();
    
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
              authController.logout();
              Get.offAllNamed('/');
            },
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }
}
