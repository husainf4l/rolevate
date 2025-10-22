import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/widgets/app_nav_bar.dart';
import 'package:rolevateapp/widgets/app_drawer.dart';

class BusinessDashboardScreen extends StatefulWidget {
  const BusinessDashboardScreen({super.key});

  @override
  State<BusinessDashboardScreen> createState() => _BusinessDashboardScreenState();
}

class _BusinessDashboardScreenState extends State<BusinessDashboardScreen>
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
                  child: ListView(
                    padding: const EdgeInsets.all(AppTheme.spacing16),
                    children: [
                      // Welcome section
                      Obx(() {
                        final userName = authController.user.value?['name'] ?? 'Business User';
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Welcome back,',
                              style: AppTypography.bodyLarge.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: AppTheme.spacing4),
                            Text(
                              userName,
                              style: AppTypography.displayMedium,
                            ),
                          ],
                        );
                      }),
                      const SizedBox(height: AppTheme.spacing24),

                      // Quick stats
                      Row(
                        children: [
                          Expanded(
                            child: _buildStatCard(
                              'Active Jobs',
                              '12',
                              CupertinoIcons.briefcase,
                              AppColors.primary600,
                            ),
                          ),
                          const SizedBox(width: AppTheme.spacing12),
                          Expanded(
                            child: _buildStatCard(
                              'Applications',
                              '45',
                              CupertinoIcons.doc_text,
                              AppColors.success,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppTheme.spacing12),
                      Row(
                        children: [
                          Expanded(
                            child: _buildStatCard(
                              'Interviews',
                              '8',
                              CupertinoIcons.calendar,
                              AppColors.warning,
                            ),
                          ),
                          const SizedBox(width: AppTheme.spacing12),
                          Expanded(
                            child: _buildStatCard(
                              'Hired',
                              '3',
                              CupertinoIcons.checkmark_seal,
                              AppColors.info,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppTheme.spacing24),

                      // Quick actions
                      Text(
                        'Quick Actions',
                        style: AppTypography.headlineMedium,
                      ),
                      const SizedBox(height: AppTheme.spacing12),
                      _buildActionButton(
                        'Post New Job',
                        CupertinoIcons.add_circled,
                        () {
                          Get.toNamed('/post-job');
                        },
                      ),
                      const SizedBox(height: AppTheme.spacing8),
                      _buildActionButton(
                        'View All Jobs',
                        CupertinoIcons.list_bullet,
                        () {
                          Get.toNamed('/jobs');
                        },
                      ),
                      const SizedBox(height: AppTheme.spacing8),
                      _buildActionButton(
                        'Review Applications',
                        CupertinoIcons.person_2,
                        () {
                          Get.toNamed('/applications');
                        },
                      ),
                      const SizedBox(height: AppTheme.spacing8),
                      _buildActionButton(
                        'Schedule Interview',
                        CupertinoIcons.calendar_badge_plus,
                        () {
                          Get.toNamed('/schedule-interview');
                        },
                      ),
                      const SizedBox(height: AppTheme.spacing24),

                      // Recent activity
                      Text(
                        'Recent Activity',
                        style: AppTypography.headlineMedium,
                      ),
                      const SizedBox(height: AppTheme.spacing12),
                      _buildActivityItem(
                        'New application for Senior Developer',
                        '2 hours ago',
                        CupertinoIcons.doc_text_fill,
                      ),
                      _buildActivityItem(
                        'Interview scheduled with John Doe',
                        '5 hours ago',
                        CupertinoIcons.calendar,
                      ),
                      _buildActivityItem(
                        'Job posting "UI Designer" expired',
                        '1 day ago',
                        CupertinoIcons.clock_fill,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Drawer overlay
          if (_isDrawerOpen)
            GestureDetector(
              onTap: _closeDrawer,
              child: Container(
                color: CupertinoColors.black.withOpacity(0.3),
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

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.spacing16),
      decoration: BoxDecoration(
        color: AppColors.iosSystemGrey6,
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: AppTheme.spacing8),
          Text(
            value,
            style: AppTypography.displayMedium.copyWith(
              color: color,
            ),
          ),
          const SizedBox(height: AppTheme.spacing4),
          Text(
            label,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
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

  Widget _buildActivityItem(String title, String time, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing12),
      child: Container(
        padding: const EdgeInsets.all(AppTheme.spacing12),
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
                color: AppColors.primary600.withOpacity(0.1),
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
                    title,
                    style: AppTypography.bodyMedium,
                  ),
                  const SizedBox(height: AppTheme.spacing4),
                  Text(
                    time,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
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
}
