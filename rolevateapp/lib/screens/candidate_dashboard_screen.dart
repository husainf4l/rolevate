import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/controllers/job_controller.dart';
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
  late final JobController jobController;
  bool _isDrawerOpen = false;
  late AnimationController _animationController;
  late Animation<Offset> _drawerAnimation;

  @override
  void initState() {
    super.initState();
    // Initialize or get JobController
    if (Get.isRegistered<JobController>()) {
      jobController = Get.find<JobController>();
    } else {
      jobController = Get.put(JobController());
    }
    
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
    
    // Check authentication before proceeding
    _checkAuthentication();
  }
  
  void _checkAuthentication() {
    if (!authController.isAuthenticated.value || 
        authController.user.value == null ||
        authController.token.value.isEmpty) {
      // User is not authenticated, redirect to login
      Get.offAllNamed('/login');
      return;
    }
    
    final userType = authController.user.value!['userType'] as String?;
    if (userType?.toLowerCase() != 'candidate') {
      // User is not a candidate, redirect to home
      Get.offAllNamed('/');
      Get.snackbar(
        'Access Denied',
        'This section is only for job seekers',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: CupertinoColors.destructiveRed,
        colorText: CupertinoColors.white,
      );
      return;
    }
    
    // User is authenticated and is a candidate, dashboard is ready
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
                  child: CustomScrollView(
                    slivers: [
                      CupertinoSliverRefreshControl(
                        onRefresh: _refreshData,
                      ),
                      SliverList(
                        delegate: SliverChildListDelegate([
                          Padding(
                            padding: const EdgeInsets.all(AppTheme.spacing16),
                            child: Column(
                              children: [
                                // Welcome section with profile completion
                                _buildWelcomeSection(),
                                const SizedBox(height: AppTheme.spacing24),

                                // Stats cards
                                _buildStatsSection(),
                                const SizedBox(height: AppTheme.spacing24),

                                // Recent applications
                                _buildRecentApplicationsSection(),
                                const SizedBox(height: AppTheme.spacing24),

                                // Recommended jobs
                                _buildRecommendedJobsSection(),
                                const SizedBox(height: AppTheme.spacing24),

                                // Quick actions
                                _buildQuickActionsSection(),
                              ],
                            ),
                          ),
                        ]),
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

  Future<void> _refreshData() async {
    await Future.wait([
      jobController.fetchJobs(),
      jobController.fetchSavedJobs(),
      jobController.fetchMyApplications(),
    ]);
  }

  Widget _buildWelcomeSection() {
    return Obx(() {
      final user = authController.user.value;
      final firstName = user?['firstName'] ?? user?['name'] ?? 'there';
      final profileCompletion = _calculateProfileCompletion();
      
      return Container(
        padding: const EdgeInsets.all(AppTheme.spacing20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.primary600,
              AppColors.primary700,
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(AppTheme.radiusXl),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary600.withValues(alpha: 0.3),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Welcome back,',
                        style: AppTypography.bodyMedium.copyWith(
                          color: CupertinoColors.white.withValues(alpha: 0.9),
                        ),
                      ),
                      const SizedBox(height: AppTheme.spacing4),
                      Text(
                        firstName,
                        style: AppTypography.displaySmall.copyWith(
                          color: CupertinoColors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(AppTheme.spacing12),
                  decoration: BoxDecoration(
                    color: CupertinoColors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                  ),
                  child: const Icon(
                    CupertinoIcons.person_circle,
                    color: CupertinoColors.white,
                    size: 32,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppTheme.spacing20),
            
            // Profile completion bar
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Profile Completion',
                      style: AppTypography.bodySmall.copyWith(
                        color: CupertinoColors.white.withValues(alpha: 0.9),
                      ),
                    ),
                    Text(
                      '$profileCompletion%',
                      style: AppTypography.bodySmall.copyWith(
                        color: CupertinoColors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppTheme.spacing8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                  child: Container(
                    height: 6,
                    decoration: BoxDecoration(
                      color: CupertinoColors.white.withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                    ),
                    child: FractionallySizedBox(
                      alignment: Alignment.centerLeft,
                      widthFactor: profileCompletion / 100,
                      child: Container(
                        decoration: BoxDecoration(
                          color: CupertinoColors.white,
                          borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                        ),
                      ),
                    ),
                  ),
                ),
                if (profileCompletion < 100) ...[
                  const SizedBox(height: AppTheme.spacing12),
                  CupertinoButton(
                    padding: EdgeInsets.zero,
                    onPressed: () => Get.toNamed('/edit-profile'),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Complete your profile',
                          style: AppTypography.bodySmall.copyWith(
                            color: CupertinoColors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: AppTheme.spacing4),
                        const Icon(
                          CupertinoIcons.arrow_right_circle_fill,
                          color: CupertinoColors.white,
                          size: 16,
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      );
    });
  }

  Widget _buildStatsSection() {
    return Obx(() {
      final totalApplications = jobController.myApplications.length;
      final activeApplications = jobController.myApplications
          .where((app) => 
              app.status.name == 'pending' || 
              app.status.name == 'reviewed' ||
              app.status.name == 'shortlisted')
          .length;
      final interviewsCount = jobController.myApplications
          .where((app) => app.interviewScheduled || app.status.name == 'interviewed')
          .length;

      return Row(
        children: [
          Expanded(
            child: _buildStatCard(
              icon: CupertinoIcons.doc_text_fill,
              label: 'Applications',
              value: totalApplications.toString(),
              color: AppColors.primary600,
              subtitle: '$activeApplications active',
            ),
          ),
          const SizedBox(width: AppTheme.spacing12),
          Expanded(
            child: _buildStatCard(
              icon: CupertinoIcons.calendar,
              label: 'Interviews',
              value: interviewsCount.toString(),
              color: AppColors.success,
              subtitle: interviewsCount > 0 ? 'Scheduled' : 'None yet',
            ),
          ),
        ],
      );
    });
  }

  Widget _buildStatCard({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
    required String subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.spacing16),
      decoration: BoxDecoration(
        color: CupertinoColors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        border: Border.all(
          color: AppColors.iosSystemGrey5,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: CupertinoColors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(AppTheme.spacing8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: AppTheme.spacing12),
          Text(
            value,
            style: AppTypography.displaySmall.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: AppTheme.spacing4),
          Text(
            label,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppTheme.spacing4),
          Text(
            subtitle,
            style: AppTypography.labelSmall.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentApplicationsSection() {
    return Obx(() {
      final recentApps = jobController.myApplications.take(3).toList();
      
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Recent Applications',
                style: AppTypography.headlineMedium.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (jobController.myApplications.isNotEmpty)
                CupertinoButton(
                  padding: EdgeInsets.zero,
                  child: Text(
                    'View All',
                    style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.primary600,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  onPressed: () => Get.toNamed('/my-applications'),
                ),
            ],
          ),
          const SizedBox(height: AppTheme.spacing12),
          
          if (recentApps.isEmpty)
            _buildEmptyState(
              icon: CupertinoIcons.doc_text,
              title: 'No applications yet',
              subtitle: 'Start applying to jobs to see them here',
              actionLabel: 'Browse Jobs',
              onAction: () => Get.toNamed('/browse-jobs'),
            )
          else
            ...recentApps.map((app) => Padding(
              padding: const EdgeInsets.only(bottom: AppTheme.spacing12),
              child: _buildApplicationCard(app),
            )),
        ],
      );
    });
  }

  Widget _buildApplicationCard(dynamic app) {
    final statusColor = _getStatusColor(app.status.name);
    
    return CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: () {
        // Navigate to application details
      },
      child: Container(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        decoration: BoxDecoration(
          color: CupertinoColors.white,
          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          border: Border.all(
            color: AppColors.iosSystemGrey5,
            width: 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    app.job.title,
                    style: AppTypography.bodyLarge.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppTheme.spacing8,
                    vertical: AppTheme.spacing4,
                  ),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                  ),
                  child: Text(
                    _formatStatus(app.status.name),
                    style: AppTypography.labelSmall.copyWith(
                      color: statusColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppTheme.spacing8),
            Text(
              app.job.company.name,
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.primary600,
              ),
            ),
            const SizedBox(height: AppTheme.spacing8),
            Row(
              children: [
                Icon(
                  CupertinoIcons.clock,
                  size: 14,
                  color: AppColors.textSecondary,
                ),
                const SizedBox(width: AppTheme.spacing4),
                Text(
                  _formatDate(app.appliedAt),
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecommendedJobsSection() {
    return Obx(() {
      final recommendedJobs = jobController.jobs.take(3).toList();
      
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Recommended for You',
                style: AppTypography.headlineMedium.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              CupertinoButton(
                padding: EdgeInsets.zero,
                child: Text(
                  'See All',
                  style: AppTypography.bodyMedium.copyWith(
                    color: AppColors.primary600,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                onPressed: () => Get.toNamed('/browse-jobs'),
              ),
            ],
          ),
          const SizedBox(height: AppTheme.spacing12),
          
          if (jobController.isLoading.value)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(AppTheme.spacing24),
                child: CupertinoActivityIndicator(),
              ),
            )
          else if (recommendedJobs.isEmpty)
            _buildEmptyState(
              icon: CupertinoIcons.briefcase,
              title: 'No jobs available',
              subtitle: 'Check back later for new opportunities',
              actionLabel: 'Refresh',
              onAction: () => jobController.fetchJobs(),
            )
          else
            ...recommendedJobs.map((job) => Padding(
              padding: const EdgeInsets.only(bottom: AppTheme.spacing12),
              child: _buildJobCard(job),
            )),
        ],
      );
    });
  }

  Widget _buildJobCard(dynamic job) {
    return CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: () => Get.toNamed('/job-detail', arguments: job.id),
      child: Container(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        decoration: BoxDecoration(
          color: CupertinoColors.white,
          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          border: Border.all(
            color: AppColors.iosSystemGrey5,
            width: 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    job.title,
                    style: AppTypography.bodyLarge.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Obx(() {
                  final isSaved = jobController.isJobSaved(job.id);
                  return CupertinoButton(
                    padding: EdgeInsets.zero,
                    minSize: 0,
                    onPressed: () => jobController.toggleSaveJob(job.id),
                    child: Icon(
                      isSaved ? CupertinoIcons.heart_fill : CupertinoIcons.heart,
                      color: isSaved ? AppColors.error : AppColors.textSecondary,
                      size: 20,
                    ),
                  );
                }),
              ],
            ),
            const SizedBox(height: AppTheme.spacing8),
            Text(
              job.company.name,
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.primary600,
              ),
            ),
            const SizedBox(height: AppTheme.spacing12),
            Row(
              children: [
                Icon(
                  CupertinoIcons.location_solid,
                  color: AppColors.textSecondary,
                  size: 16,
                ),
                const SizedBox(width: AppTheme.spacing4),
                Expanded(
                  child: Text(
                    job.location,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: AppTheme.spacing12),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppTheme.spacing8,
                    vertical: AppTheme.spacing4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary600.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                  ),
                  child: Text(
                    job.type.displayName,
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.primary600,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: AppTypography.headlineMedium.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: AppTheme.spacing12),
        Row(
          children: [
            Expanded(
              child: _buildQuickActionCard(
                icon: CupertinoIcons.search,
                label: 'Find Jobs',
                color: AppColors.primary600,
                onTap: () => Get.toNamed('/browse-jobs'),
              ),
            ),
            const SizedBox(width: AppTheme.spacing12),
            Expanded(
              child: _buildQuickActionCard(
                icon: CupertinoIcons.heart,
                label: 'Saved Jobs',
                color: AppColors.error,
                onTap: () => Get.toNamed('/saved-jobs'),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppTheme.spacing12),
        Row(
          children: [
            Expanded(
              child: _buildQuickActionCard(
                icon: CupertinoIcons.person_crop_circle,
                label: 'Edit Profile',
                color: AppColors.warning,
                onTap: () => Get.toNamed('/edit-profile'),
              ),
            ),
            const SizedBox(width: AppTheme.spacing12),
            Expanded(
              child: _buildQuickActionCard(
                icon: CupertinoIcons.settings,
                label: 'Settings',
                color: AppColors.iosSystemGrey,
                onTap: () => Get.toNamed('/settings'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickActionCard({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          border: Border.all(
            color: color.withValues(alpha: 0.2),
            width: 1,
          ),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: AppTheme.spacing8),
            Text(
              label,
              style: AppTypography.bodySmall.copyWith(
                color: color,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
    required String actionLabel,
    required VoidCallback onAction,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.spacing24),
      decoration: BoxDecoration(
        color: AppColors.iosSystemGrey6,
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            size: 48,
            color: AppColors.iosSystemGrey,
          ),
          const SizedBox(height: AppTheme.spacing12),
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
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppTheme.spacing16),
          CupertinoButton(
            color: AppColors.primary600,
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
            padding: const EdgeInsets.symmetric(
              horizontal: AppTheme.spacing20,
              vertical: AppTheme.spacing12,
            ),
            child: Text(
              actionLabel,
              style: AppTypography.button.copyWith(
                color: CupertinoColors.white,
              ),
            ),
            onPressed: onAction,
          ),
        ],
      ),
    );
  }

  int _calculateProfileCompletion() {
    final user = authController.user.value;
    if (user == null) return 0;
    
    int completion = 40; // Base for having an account
    
    if (user['firstName'] != null && user['firstName'].toString().isNotEmpty) completion += 15;
    if (user['lastName'] != null && user['lastName'].toString().isNotEmpty) completion += 15;
    if (user['email'] != null) completion += 10;
    if (user['phone'] != null) completion += 10;
    if (user['avatar'] != null) completion += 10;
    
    return completion.clamp(0, 100);
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return AppColors.warning;
      case 'reviewed':
      case 'shortlisted':
        return AppColors.primary600;
      case 'interviewed':
        return AppColors.info;
      case 'accepted':
      case 'offered':
        return AppColors.success;
      case 'rejected':
        return AppColors.error;
      default:
        return AppColors.iosSystemGrey;
    }
  }

  String _formatStatus(String status) {
    return status[0].toUpperCase() + status.substring(1).toLowerCase();
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    
    if (diff.inDays == 0) {
      if (diff.inHours == 0) {
        return '${diff.inMinutes}m ago';
      }
      return '${diff.inHours}h ago';
    } else if (diff.inDays < 7) {
      return '${diff.inDays}d ago';
    } else if (diff.inDays < 30) {
      return '${(diff.inDays / 7).floor()}w ago';
    } else {
      return '${(diff.inDays / 30).floor()}mo ago';
    }
  }
}
