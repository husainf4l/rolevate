import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart' show CircleAvatar;
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/widgets/app_nav_bar.dart';
import 'package:rolevateapp/widgets/app_drawer.dart';
import 'dart:io';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with SingleTickerProviderStateMixin {
  final authController = Get.find<AuthController>();
  bool _isDrawerOpen = false;
  late AnimationController _animationController;
  late Animation<Offset> _drawerAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _drawerAnimation = Tween<Offset>(
      begin: const Offset(-1.0, 0.0),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _toggleDrawer() {
    setState(() {
      _isDrawerOpen = !_isDrawerOpen;
      if (_isDrawerOpen) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    });
  }

  void _closeDrawer() {
    if (_isDrawerOpen) {
      _toggleDrawer();
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      child: Stack(
        children: [
          // Main content
          Column(
            children: [
              AppNavBar(
                onMenuTap: _toggleDrawer,
              ),
              Expanded(
                child: SafeArea(
                  top: false,
                  child: Obx(() {
                    final user = authController.user.value;
                    final userName = user?['name'] ?? 'User';
                    final userEmail = user?['email'] ?? 'email@example.com';
                    final userType = user?['userType'] ?? 'User';
                    final isBusiness = userType.toLowerCase() == 'business';

                    return ListView(
                      padding: const EdgeInsets.all(AppTheme.spacing16),
                      children: [
                        // Profile header
                        Center(
                          child: Column(
                            children: [
                              _buildProfileAvatar(user),
                              const SizedBox(height: AppTheme.spacing16),
                              Text(
                                userName,
                                style: AppTypography.displayMedium,
                              ),
                              const SizedBox(height: AppTheme.spacing4),
                              Text(
                                userEmail,
                                style: AppTypography.bodyMedium.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              const SizedBox(height: AppTheme.spacing8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: AppTheme.spacing12,
                                  vertical: AppTheme.spacing4,
                                ),
                                decoration: BoxDecoration(
                                  color: isBusiness 
                                      ? AppColors.primary600.withValues(alpha: 0.1)
                                      : AppColors.info.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                                ),
                                child: Text(
                                  isBusiness ? '🏢 Business User' : '👤 Candidate',
                                  style: AppTypography.bodySmall.copyWith(
                                    color: isBusiness ? AppColors.primary600 : AppColors.info,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: AppTheme.spacing32),

                        // Profile sections
                        Text(
                          'Personal Information',
                          style: AppTypography.headlineMedium,
                        ),
                        const SizedBox(height: AppTheme.spacing12),
                        _buildInfoCard(
                          'Name',
                          userName,
                          CupertinoIcons.person,
                          onTap: () {
                            Get.toNamed('/edit-profile');
                          },
                        ),
                        const SizedBox(height: AppTheme.spacing8),
                        _buildInfoCard(
                          'Email',
                          userEmail,
                          CupertinoIcons.mail,
                          onTap: () {
                            Get.toNamed('/edit-profile');
                          },
                        ),
                        const SizedBox(height: AppTheme.spacing8),
                        _buildInfoCard(
                          'Phone',
                          'Not set',
                          CupertinoIcons.phone,
                          onTap: () {
                            Get.toNamed('/edit-profile');
                          },
                        ),
                        const SizedBox(height: AppTheme.spacing24),

                        // Settings & Preferences
                        Text(
                          'Settings',
                          style: AppTypography.headlineMedium,
                        ),
                        const SizedBox(height: AppTheme.spacing12),
                        _buildActionButton(
                          'Privacy & Security',
                          CupertinoIcons.lock_shield,
                          () {
                            debugPrint('🔒 Navigating to Privacy & Security');
                            Get.toNamed('/privacy-security');
                          },
                        ),
                        const SizedBox(height: AppTheme.spacing8),
                        _buildActionButton(
                          'Notification Preferences',
                          CupertinoIcons.bell_fill,
                          () {
                            debugPrint('🔔 Navigating to Notification Preferences');
                            Get.toNamed('/notification-preferences');
                          },
                        ),
                        const SizedBox(height: AppTheme.spacing24),

                        // Support & Info
                        Text(
                          'Support',
                          style: AppTypography.headlineMedium,
                        ),
                        const SizedBox(height: AppTheme.spacing12),
                        _buildActionButton(
                          'Help & Support',
                          CupertinoIcons.question_circle,
                          () {
                            Get.toNamed('/help-support');
                          },
                        ),
                        const SizedBox(height: AppTheme.spacing8),
                        _buildActionButton(
                          'About',
                          CupertinoIcons.info_circle,
                          () {
                            debugPrint('ℹ️ Navigating to About');
                            Get.toNamed('/about');
                          },
                        ),
                        const SizedBox(height: AppTheme.spacing24),

                        // Danger zone
                        Text(
                          'Danger Zone',
                          style: AppTypography.headlineMedium.copyWith(
                            color: AppColors.error,
                          ),
                        ),
                        const SizedBox(height: AppTheme.spacing12),
                        CupertinoButton(
                          padding: EdgeInsets.zero,
                          onPressed: () {
                            _showDeleteAccountDialog();
                          },
                          child: Container(
                            padding: const EdgeInsets.all(AppTheme.spacing16),
                            decoration: BoxDecoration(
                              color: AppColors.error.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                              border: Border.all(
                                color: AppColors.error.withValues(alpha: 0.3),
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  CupertinoIcons.trash,
                                  color: AppColors.error,
                                ),
                                const SizedBox(width: AppTheme.spacing12),
                                Text(
                                  'Delete Account',
                                  style: AppTypography.bodyLarge.copyWith(
                                    color: AppColors.error,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: AppTheme.spacing24),
                      ],
                    );
                  }),
                ),
              ),
            ],
          ),

          // Drawer overlay
          if (_isDrawerOpen)
            GestureDetector(
              onTap: _closeDrawer,
              child: Container(
                color: CupertinoColors.black.withValues(alpha: 0.3),
              ),
            ),

          // Drawer
          SlideTransition(
            position: _drawerAnimation,
            child: AppDrawer(
              onClose: _closeDrawer,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(
    String label,
    String value,
    IconData icon, {
    VoidCallback? onTap,
  }) {
    return CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        decoration: BoxDecoration(
          color: AppColors.iosSystemGrey6,
          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
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
                size: 20,
              ),
            ),
            const SizedBox(width: AppTheme.spacing12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: AppTheme.spacing4),
                  Text(
                    value,
                    style: AppTypography.bodyLarge,
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

  Widget _buildActionButton(String label, IconData icon, VoidCallback onTap) {
    return CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        decoration: BoxDecoration(
          color: AppColors.iosSystemGrey6,
          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        ),
        child: Row(
          children: [
            Icon(icon, color: AppColors.primary600),
            const SizedBox(width: AppTheme.spacing12),
            Text(
              label,
              style: AppTypography.bodyLarge.copyWith(
                color: AppColors.textPrimary,
              ),
            ),
            const Spacer(),
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

  Widget _buildProfileAvatar(Map<String, dynamic>? user) {
    final userName = user?['name'] ?? 'User';
    final avatarUrl = user?['avatar'] as String?;
    
    // Helper to build initials fallback
    Widget buildInitials() {
      return Container(
        width: 100,
        height: 100,
        decoration: BoxDecoration(
          color: AppColors.primary600,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: AppColors.primary600.withValues(alpha: 0.3),
              offset: const Offset(0, 4),
              blurRadius: 12,
            ),
          ],
        ),
        child: Center(
          child: Text(
            userName[0].toUpperCase(),
            style: AppTypography.displayLarge.copyWith(
              color: CupertinoColors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      );
    }
    
    // If no avatar, show initials
    if (avatarUrl == null || avatarUrl.isEmpty) {
      return buildInitials();
    }
    
    // Check if it's a local file:// URL (from mock upload)
    if (avatarUrl.startsWith('file://')) {
      final filePath = avatarUrl.replaceFirst('file://', '');
      final file = File(filePath);
      
      return Container(
        width: 100,
        height: 100,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: AppColors.primary600.withValues(alpha: 0.3),
              offset: const Offset(0, 4),
              blurRadius: 12,
            ),
          ],
        ),
        child: ClipOval(
          child: Image.file(
            file,
            width: 100,
            height: 100,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) {
              print('❌ Error loading profile avatar: $error');
              return buildInitials();
            },
          ),
        ),
      );
    }
    
    // It's a network URL
    return Container(
      width: 100,
      height: 100,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: AppColors.primary600.withValues(alpha: 0.3),
            offset: const Offset(0, 4),
            blurRadius: 12,
          ),
        ],
      ),
      child: ClipOval(
        child: Image.network(
          avatarUrl,
          width: 100,
          height: 100,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) {
            return buildInitials();
          },
          loadingBuilder: (context, child, loadingProgress) {
            if (loadingProgress == null) return child;
            return buildInitials();
          },
        ),
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
            onPressed: () {
              Get.back();
              // TODO: Implement account deletion
              authController.logout();
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
