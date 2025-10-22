import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';

class AppNavBar extends StatelessWidget implements ObstructingPreferredSizeWidget {
  final VoidCallback onMenuTap;
  
  const AppNavBar({super.key, required this.onMenuTap});

  @override
  Widget build(BuildContext context) {
    final authController = Get.find<AuthController>();

    return Container(
      decoration: BoxDecoration(
        color: CupertinoColors.white,
        border: Border(
          bottom: BorderSide(
            color: AppColors.iosSystemGrey5,
            width: 0.5,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: CupertinoColors.black.withOpacity(0.05),
            offset: const Offset(0, 1),
            blurRadius: 2,
          ),
        ],
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppTheme.spacing16,
            vertical: AppTheme.spacing12,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
            // Menu Icon
            CupertinoButton(
              padding: EdgeInsets.zero,
              minSize: 36,
              onPressed: onMenuTap,
              child: const Icon(
                CupertinoIcons.line_horizontal_3,
                color: AppColors.textPrimary,
                size: 24,
              ),
            ),              // Logo (centered)
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Image.asset(
                    'assets/logos/Rolevate-icon.webp',
                    height: 32,
                    fit: BoxFit.contain,
                  ),
                  const SizedBox(width: AppTheme.spacing8),
                  Text(
                    'RoleVate',
                    style: AppTypography.headlineMedium.copyWith(
                      color: AppColors.primary600,
                      fontWeight: FontWeight.w600,
                      fontSize: 18,
                    ),
                  ),
                ],
              ),
              
              // Right side - Auth dependent
              Obx(() {
                if (authController.isAuthenticated.value) {
                  return CupertinoButton(
                    padding: EdgeInsets.zero,
                    minSize: 36,
                    onPressed: () {
                      _showUserMenu(context, authController);
                    },
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: AppColors.primary600,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary600.withOpacity(0.3),
                            offset: const Offset(0, 2),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                      child: Center(
                        child: Text(
                          (authController.user.value?['name'] ?? 'U')[0].toUpperCase(),
                          style: AppTypography.labelLarge.copyWith(
                            color: CupertinoColors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ),
                  );
                } else {
                  return CupertinoButton(
                    padding: EdgeInsets.zero,
                    minSize: 36,
                    onPressed: () {
                      Get.toNamed('/login');
                    },
                    child: const Icon(
                      CupertinoIcons.person_circle,
                      color: AppColors.textSecondary,
                      size: 28,
                    ),
                  );
                }
              }),
            ],
          ),
        ),
      ),
    );
  }

  void _showUserMenu(BuildContext context, AuthController authController) {
    final userType = authController.user.value?['userType'] as String? ?? '';
    final isBusiness = userType.toLowerCase() == 'business';
    final isCandidate = userType.toLowerCase() == 'candidate';

    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: Text(
          authController.user.value?['name'] ?? 'User',
          style: AppTypography.headlineSmall,
        ),
        message: Text(
          '${authController.user.value?['email'] ?? ''}\n${isBusiness ? '🏢 Business' : isCandidate ? '👤 Candidate' : ''}',
          style: AppTypography.bodySmall,
        ),
        actions: [
          // Dashboard - Navigate to appropriate dashboard
          CupertinoActionSheetAction(
            onPressed: () {
              Get.back();
              if (isBusiness) {
                Get.offAllNamed('/business-dashboard');
              } else if (isCandidate) {
                Get.offAllNamed('/candidate-dashboard');
              } else {
                Get.offAllNamed('/home');
              }
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.house_fill, size: 20),
                SizedBox(width: AppTheme.spacing8),
                Text('Dashboard'),
              ],
            ),
          ),
          
          // Profile action (common for both)
          CupertinoActionSheetAction(
            onPressed: () {
              Get.back();
              Get.toNamed('/profile');
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.person, size: 20),
                SizedBox(width: AppTheme.spacing8),
                Text('Profile'),
              ],
            ),
          ),
          
          // Business-specific actions
          if (isBusiness) ...[
            CupertinoActionSheetAction(
              onPressed: () {
                Get.back();
                Get.toNamed('/my-jobs');
              },
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(CupertinoIcons.briefcase, size: 20),
                  SizedBox(width: AppTheme.spacing8),
                  Text('My Job Posts'),
                ],
              ),
            ),
            CupertinoActionSheetAction(
              onPressed: () {
                Get.back();
                Get.toNamed('/post-job');
              },
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(CupertinoIcons.add_circled, size: 20),
                  SizedBox(width: AppTheme.spacing8),
                  Text('Post New Job'),
                ],
              ),
            ),
            CupertinoActionSheetAction(
              onPressed: () {
                Get.back();
                Get.toNamed('/applications');
              },
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(CupertinoIcons.person_2, size: 20),
                  SizedBox(width: AppTheme.spacing8),
                  Text('Applications'),
                ],
              ),
            ),
            CupertinoActionSheetAction(
              onPressed: () {
                Get.back();
                Get.toNamed('/company-settings');
              },
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(CupertinoIcons.building_2_fill, size: 20),
                  SizedBox(width: AppTheme.spacing8),
                  Text('Company Settings'),
                ],
              ),
            ),
          ],
          
          // Candidate-specific actions
          if (isCandidate) ...[
            CupertinoActionSheetAction(
              onPressed: () {
                Get.back();
                Get.toNamed('/saved-jobs');
              },
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(CupertinoIcons.heart, size: 20),
                  SizedBox(width: AppTheme.spacing8),
                  Text('Saved Jobs'),
                ],
              ),
            ),
            CupertinoActionSheetAction(
              onPressed: () {
                Get.back();
                Get.toNamed('/my-applications');
              },
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(CupertinoIcons.doc_text, size: 20),
                  SizedBox(width: AppTheme.spacing8),
                  Text('My Applications'),
                ],
              ),
            ),
            CupertinoActionSheetAction(
              onPressed: () {
                Get.back();
                Get.toNamed('/interviews');
              },
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(CupertinoIcons.calendar, size: 20),
                  SizedBox(width: AppTheme.spacing8),
                  Text('My Interviews'),
                ],
              ),
            ),
          ],
          
          // Settings (common for both)
          CupertinoActionSheetAction(
            onPressed: () {
              Get.back();
              Get.toNamed('/settings');
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.settings, size: 20),
                SizedBox(width: AppTheme.spacing8),
                Text('Settings'),
              ],
            ),
          ),
          
          // Logout (common for both)
          CupertinoActionSheetAction(
            isDestructiveAction: true,
            onPressed: () {
              Get.back();
              authController.logout();
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.arrow_right_square, size: 20),
                SizedBox(width: AppTheme.spacing8),
                Text('Sign Out'),
              ],
            ),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          isDefaultAction: true,
          onPressed: () => Get.back(),
          child: const Text('Cancel'),
        ),
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(60.0);

  @override
  bool shouldFullyObstruct(BuildContext context) => true;
}
