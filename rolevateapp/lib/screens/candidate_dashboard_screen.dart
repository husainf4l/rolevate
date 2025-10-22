import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/widgets/app_nav_bar.dart';
import 'package:rolevateapp/widgets/app_drawer.dart';

class CandidateDashboardScreen extends StatefulWidget {
  const CandidateDashboardScreen({super.key});

  @override
  State<CandidateDashboardScreen> createState() => _CandidateDashboardScreenState();
}

class _CandidateDashboardScreenState extends State<CandidateDashboardScreen>
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
                        final userName = authController.user.value?['name'] ?? 'Candidate';
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
                              'Applied Jobs',
                              '8',
                              CupertinoIcons.briefcase,
                              AppColors.primary600,
                            ),
                          ),
                          const SizedBox(width: AppTheme.spacing12),
                          Expanded(
                            child: _buildStatCard(
                              'Interviews',
                              '3',
                              CupertinoIcons.calendar,
                              AppColors.warning,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppTheme.spacing12),
                      Row(
                        children: [
                          Expanded(
                            child: _buildStatCard(
                              'Saved Jobs',
                              '15',
                              CupertinoIcons.heart,
                              AppColors.error,
                            ),
                          ),
                          const SizedBox(width: AppTheme.spacing12),
                          Expanded(
                            child: _buildStatCard(
                              'Profile Views',
                              '24',
                              CupertinoIcons.eye,
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
                        'Browse Jobs',
                        CupertinoIcons.search,
                        () {
                          Get.toNamed('/jobs');
                        },
                      ),
                      const SizedBox(height: AppTheme.spacing8),
                      _buildActionButton(
                        'My Applications',
                        CupertinoIcons.doc_text,
                        () {
                          Get.toNamed('/my-applications');
                        },
                      ),
                      const SizedBox(height: AppTheme.spacing8),
                      _buildActionButton(
                        'Saved Jobs',
                        CupertinoIcons.heart_fill,
                        () {
                          Get.toNamed('/saved-jobs');
                        },
                      ),
                      const SizedBox(height: AppTheme.spacing8),
                      _buildActionButton(
                        'Update Profile',
                        CupertinoIcons.person_crop_circle,
                        () {
                          Get.toNamed('/profile');
                        },
                      ),
                      const SizedBox(height: AppTheme.spacing24),

                      // Recommended jobs
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Recommended for You',
                            style: AppTypography.headlineMedium,
                          ),
                          CupertinoButton(
                            padding: EdgeInsets.zero,
                            child: Text(
                              'See All',
                              style: AppTypography.bodyMedium.copyWith(
                                color: AppColors.primary600,
                              ),
                            ),
                            onPressed: () {
                              Get.toNamed('/jobs');
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: AppTheme.spacing12),
                      _buildJobCard(
                        'Senior Flutter Developer',
                        'TechCorp Inc.',
                        'Remote',
                        '\$80k - \$120k',
                      ),
                      _buildJobCard(
                        'UI/UX Designer',
                        'Design Studio',
                        'New York, NY',
                        '\$70k - \$90k',
                      ),
                      _buildJobCard(
                        'Product Manager',
                        'StartupXYZ',
                        'San Francisco, CA',
                        '\$100k - \$140k',
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

  Widget _buildJobCard(String title, String company, String location, String salary) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing12),
      child: CupertinoButton(
        padding: EdgeInsets.zero,
        onPressed: () {
          // Navigate to job details
        },
        child: Container(
          padding: const EdgeInsets.all(AppTheme.spacing16),
          decoration: BoxDecoration(
            color: AppColors.iosSystemGrey6,
            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      title,
                      style: AppTypography.bodyLarge.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  Icon(
                    CupertinoIcons.heart,
                    color: AppColors.iosSystemGrey,
                    size: 20,
                  ),
                ],
              ),
              const SizedBox(height: AppTheme.spacing8),
              Text(
                company,
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.primary600,
                ),
              ),
              const SizedBox(height: AppTheme.spacing8),
              Row(
                children: [
                  Icon(
                    CupertinoIcons.location_solid,
                    color: AppColors.iosSystemGrey,
                    size: 16,
                  ),
                  const SizedBox(width: AppTheme.spacing4),
                  Text(
                    location,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(width: AppTheme.spacing16),
                  Icon(
                    CupertinoIcons.money_dollar_circle,
                    color: AppColors.iosSystemGrey,
                    size: 16,
                  ),
                  const SizedBox(width: AppTheme.spacing4),
                  Text(
                    salary,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
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
