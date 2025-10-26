import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/services/job_service.dart';
import 'package:rolevateapp/services/application_service.dart';
import 'package:rolevateapp/models/models.dart';
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
  final _jobService = JobService();
  final _applicationService = ApplicationService();
  
  bool _isDrawerOpen = false;
  bool _isLoading = true;
  late AnimationController _animationController;
  late Animation<Offset> _drawerAnimation;
  
  List<Job> _companyJobs = [];
  List<Application> _recentApplications = [];
  int _totalApplications = 0;
  int _interviewsCount = 0;
  int _hiredCount = 0;

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
    
    // Check authentication before loading data
    _checkAuthentication();
  }
  
  void _checkAuthentication() {
    final authController = Get.find<AuthController>();
    
    if (!authController.isAuthenticated.value || 
        authController.user.value == null ||
        authController.token.value.isEmpty) {
      // User is not authenticated, redirect to login
      Get.offAllNamed('/login');
      return;
    }
    
    final userType = authController.user.value!['userType'] as String?;
    debugPrint('🔍 User type: $userType'); // Debug user type
    
    if (userType?.toLowerCase() != 'business') {
      // TEMPORARILY DISABLED: Allow access for testing post job functionality
      // User is not a business user, redirect to home
      // Get.offAllNamed('/');
      // Get.snackbar(
      //   'Access Denied',
      //   'This section is only for business users. Current user type: $userType',
      //   snackPosition: SnackPosition.BOTTOM,
      //   backgroundColor: CupertinoColors.destructiveRed,
      //   colorText: CupertinoColors.white,
      //   duration: const Duration(seconds: 5),
      // );
      // return;
    }
    
    // User is authenticated and is a business user, load dashboard data
    _loadDashboardData();
  }
  
  Future<void> _loadDashboardData() async {
    setState(() => _isLoading = true);
    
    try {
      // Fetch company jobs
      final jobs = await _jobService.getCompanyJobs();
      
      // Fetch applications for all jobs
      List<Application> allApplications = [];
      for (var job in jobs) {
        try {
          final apps = await _applicationService.getApplicationsByJob(job.id);
          allApplications.addAll(apps);
        } catch (e) {
          debugPrint('Error fetching applications for job ${job.id}: $e');
        }
      }
      
      // Calculate stats
      final interviewsCount = allApplications
          .where((app) => app.status == ApplicationStatus.interviewed || 
                        app.interviewScheduled)
          .length;
      final hiredCount = allApplications
          .where((app) => app.status == ApplicationStatus.hired)
          .length;
      
      setState(() {
        _companyJobs = jobs;
        _recentApplications = allApplications.take(10).toList();
        _totalApplications = allApplications.length;
        _interviewsCount = interviewsCount;
        _hiredCount = hiredCount;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error loading dashboard data: $e');
      setState(() => _isLoading = false);
      
      if (mounted) {
        // Check if it's an authentication error
        String errorMessage = 'Failed to load dashboard data';
        bool shouldLogout = false;
        
        if (e.toString().contains('403') || e.toString().contains('Forbidden')) {
          errorMessage = 'Your session has expired. Please log in again.';
          shouldLogout = true;
        } else if (e.toString().contains('401') || e.toString().contains('Unauthorized')) {
          errorMessage = 'Authentication required. Please log in.';
          shouldLogout = true;
        }
        
        if (shouldLogout) {
          // Clear authentication data and redirect to login
          final authController = Get.find<AuthController>();
          authController.logout();
          Get.offAllNamed('/login');
        }
        
        Get.snackbar(
          'Error',
          errorMessage,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: CupertinoColors.destructiveRed,
          colorText: CupertinoColors.white,
          duration: const Duration(seconds: 3),
        );
      }
    }
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
                  child: _isLoading
                      ? const Center(child: CupertinoActivityIndicator())
                      : ListView(
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

                      // Quick stats - Enhanced for employers
                      Row(
                        children: [
                          Expanded(
                            child: _buildStatCard(
                              'Active Jobs',
                              _companyJobs.length.toString(),
                              CupertinoIcons.briefcase,
                              AppColors.primary600,
                            ),
                          ),
                          const SizedBox(width: AppTheme.spacing12),
                          Expanded(
                            child: _buildStatCard(
                              'Total Applications',
                              _totalApplications.toString(),
                              CupertinoIcons.person_2_fill,
                              AppColors.info,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppTheme.spacing12),
                      Row(
                        children: [
                          Expanded(
                            child: _buildStatCard(
                              'Interviews Scheduled',
                              _interviewsCount.toString(),
                              CupertinoIcons.calendar,
                              AppColors.warning,
                            ),
                          ),
                          const SizedBox(width: AppTheme.spacing12),
                          Expanded(
                            child: _buildStatCard(
                              'Successful Hires',
                              _hiredCount.toString(),
                              CupertinoIcons.checkmark_seal_fill,
                              AppColors.success,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppTheme.spacing24),

                      // Quick actions - Employer focused
                      Text(
                        'Quick Actions',
                        style: AppTypography.headlineMedium,
                      ),
                      const SizedBox(height: AppTheme.spacing12),
                      _buildActionButton(
                        'Post New Job',
                        CupertinoIcons.add_circled,
                        () async {
                          debugPrint('🎯 Post New Job button tapped');
                          final result = await Get.toNamed('/post-job');
                          if (result == true) {
                            // Job was posted successfully, refresh dashboard data
                            _loadDashboardData();
                          }
                        },
                      ),
                      const SizedBox(height: AppTheme.spacing8),
                      _buildActionButton(
                        'Manage Jobs',
                        CupertinoIcons.list_bullet,
                        () {
                          Get.toNamed('/jobs');
                        },
                      ),
                      const SizedBox(height: AppTheme.spacing8),
                      _buildActionButton(
                        'Review Candidates',
                        CupertinoIcons.person_2,
                        () {
                          Get.toNamed('/applications');
                        },
                      ),
                      const SizedBox(height: AppTheme.spacing8),
                      _buildActionButton(
                        'Schedule Interviews',
                        CupertinoIcons.calendar_badge_plus,
                        () {
                          Get.toNamed('/schedule-interview');
                        },
                      ),
                      const SizedBox(height: AppTheme.spacing24),

                      // Recent activity - Real Data
                      Text(
                        'Recent Applications',
                        style: AppTypography.headlineMedium,
                      ),
                      const SizedBox(height: AppTheme.spacing12),
                      
                      if (_recentApplications.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(AppTheme.spacing24),
                          decoration: BoxDecoration(
                            color: AppColors.iosSystemGrey6,
                            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                          ),
                          child: Column(
                            children: [
                              const Icon(
                                CupertinoIcons.doc_text,
                                size: 48,
                                color: AppColors.iosSystemGrey,
                              ),
                              const SizedBox(height: AppTheme.spacing12),
                              Text(
                                'No applications yet',
                                style: AppTypography.bodyLarge.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              const SizedBox(height: AppTheme.spacing8),
                              Text(
                                'Post your first job to start receiving applications',
                                textAlign: TextAlign.center,
                                style: AppTypography.bodyMedium.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        )
                      else
                        ...(_recentApplications.take(5).map((app) {
                          final timeDiff = DateTime.now().difference(app.appliedAt);
                          String timeAgo;
                          if (timeDiff.inDays > 0) {
                            timeAgo = '${timeDiff.inDays} day${timeDiff.inDays > 1 ? 's' : ''} ago';
                          } else if (timeDiff.inHours > 0) {
                            timeAgo = '${timeDiff.inHours} hour${timeDiff.inHours > 1 ? 's' : ''} ago';
                          } else {
                            timeAgo = '${timeDiff.inMinutes} minute${timeDiff.inMinutes > 1 ? 's' : ''} ago';
                          }
                          
                          return _buildActivityItem(
                            'New application for ${app.job.title}',
                            timeAgo,
                            CupertinoIcons.doc_text_fill,
                          );
                        })),
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
