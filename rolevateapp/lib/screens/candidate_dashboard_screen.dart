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

                      // Quick stats - Enhanced for job seekers
                      Obx(() {
                        final appliedJobsCount = jobController.myApplications.length;
                        final interviewsCount = jobController.myApplications
                            .where((app) => app.status.name == 'interviewed' || 
                                          app.interviewScheduled)
                            .length;
                        final savedJobsCount = jobController.savedJobs.length;
                        final profileCompletion = 75; // Mock profile completion percentage
                        
                        return Column(
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: _buildStatCard(
                                    'Applications',
                                    appliedJobsCount.toString(),
                                    CupertinoIcons.doc_text_fill,
                                    AppColors.primary600,
                                  ),
                                ),
                                const SizedBox(width: AppTheme.spacing12),
                                Expanded(
                                  child: _buildStatCard(
                                    'Interviews',
                                    interviewsCount.toString(),
                                    CupertinoIcons.calendar,
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
                                    'Saved Jobs',
                                    savedJobsCount.toString(),
                                    CupertinoIcons.heart_fill,
                                    AppColors.error,
                                  ),
                                ),
                                const SizedBox(width: AppTheme.spacing12),
                                Expanded(
                                  child: _buildStatCard(
                                    'Profile',
                                    '$profileCompletion%',
                                    CupertinoIcons.person_crop_circle_fill,
                                    AppColors.warning,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        );
                      }),
                      const SizedBox(height: AppTheme.spacing24),

                      // Quick actions - Job seeker focused
                      Text(
                        'Quick Actions',
                        style: AppTypography.headlineMedium,
                      ),
                      const SizedBox(height: AppTheme.spacing12),
                      _buildActionButton(
                        'Find Jobs',
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
                        'Complete Profile',
                        CupertinoIcons.person_crop_circle,
                        () {
                          Get.toNamed('/profile');
                        },
                      ),
                      const SizedBox(height: AppTheme.spacing24),

                      // Recent jobs from backend
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Recent Jobs',
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
                              Get.toNamed('/home');
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: AppTheme.spacing12),
                      
                      // Real job data
                      Obx(() {
                        if (jobController.isLoading.value) {
                          return const Center(
                            child: Padding(
                              padding: EdgeInsets.all(AppTheme.spacing24),
                              child: CupertinoActivityIndicator(),
                            ),
                          );
                        }
                        
                        if (jobController.jobs.isEmpty) {
                          return Container(
                            padding: const EdgeInsets.all(AppTheme.spacing24),
                            decoration: BoxDecoration(
                              color: AppColors.iosSystemGrey6,
                              borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                            ),
                            child: Column(
                              children: [
                                const Icon(
                                  CupertinoIcons.briefcase,
                                  size: 48,
                                  color: AppColors.iosSystemGrey,
                                ),
                                const SizedBox(height: AppTheme.spacing12),
                                Text(
                                  'No jobs available yet',
                                  style: AppTypography.bodyLarge.copyWith(
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                                const SizedBox(height: AppTheme.spacing8),
                                CupertinoButton(
                                  color: AppColors.primary600,
                                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                                  child: Text(
                                    'Refresh',
                                    style: AppTypography.button.copyWith(
                                      color: CupertinoColors.white,
                                    ),
                                  ),
                                  onPressed: () => jobController.fetchJobs(),
                                ),
                              ],
                            ),
                          );
                        }
                        
                        // Show up to 3 recent jobs
                        final recentJobs = jobController.jobs.take(3).toList();
                        return Column(
                          children: recentJobs.map((job) {
                            return _buildJobCard(
                              job.title,
                              job.company.name,
                              job.location,
                              job.salary,
                              job.id,
                            );
                          }).toList(),
                        );
                      }),
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

  Widget _buildJobCard(String title, String company, String location, String salary, String jobId) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing12),
      child: CupertinoButton(
        padding: EdgeInsets.zero,
        onPressed: () {
          Get.toNamed('/job-detail', arguments: jobId);
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
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Obx(() {
                    final isSaved = jobController.isJobSaved(jobId);
                    return Icon(
                      isSaved ? CupertinoIcons.heart_fill : CupertinoIcons.heart,
                      color: isSaved ? AppColors.error : AppColors.iosSystemGrey,
                      size: 20,
                    );
                  }),
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
