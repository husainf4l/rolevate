import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/services/application_service.dart';
import 'package:rolevateapp/services/job_service.dart';
import 'package:rolevateapp/models/models.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';

class ApplicationsScreen extends StatefulWidget {
  const ApplicationsScreen({super.key});

  @override
  State<ApplicationsScreen> createState() => _ApplicationsScreenState();
}

class _ApplicationsScreenState extends State<ApplicationsScreen> {
  final _applicationService = ApplicationService();
  final _jobService = JobService();
  
  bool _isLoading = true;
  List<Application> _allApplications = [];
  String _errorMessage = '';
  
  @override
  void initState() {
    super.initState();
    _loadApplications();
  }
  
  Future<void> _loadApplications() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });
    
    try {
      // Fetch all company jobs first
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
      
      // Sort by most recent first
      allApplications.sort((a, b) => b.appliedAt.compareTo(a.appliedAt));
      
      setState(() {
        _allApplications = allApplications;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error loading applications: $e');
      setState(() {
        _errorMessage = 'Failed to load applications';
        _isLoading = false;
      });
      
      Get.snackbar(
        'Error',
        'Failed to load applications',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: CupertinoColors.destructiveRed,
        colorText: CupertinoColors.white,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: const Text('Applications'),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          child: const Icon(CupertinoIcons.back),
          onPressed: () => Get.back(),
        ),
      ),
      child: SafeArea(
        child: _isLoading
            ? const Center(child: CupertinoActivityIndicator())
            : _errorMessage.isNotEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(AppTheme.spacing24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            CupertinoIcons.exclamationmark_triangle,
                            size: 48,
                            color: AppColors.error,
                          ),
                          const SizedBox(height: AppTheme.spacing16),
                          Text(
                            _errorMessage,
                            style: AppTypography.bodyLarge.copyWith(
                              color: AppColors.textSecondary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: AppTheme.spacing16),
                          CupertinoButton(
                            onPressed: _loadApplications,
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  )
                : _allApplications.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(AppTheme.spacing24),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                CupertinoIcons.doc_text,
                                size: 64,
                                color: AppColors.iosSystemGrey,
                              ),
                              const SizedBox(height: AppTheme.spacing16),
                              Text(
                                'No Applications Yet',
                                style: AppTypography.headlineMedium,
                              ),
                              const SizedBox(height: AppTheme.spacing8),
                              Text(
                                'Applications will appear here when candidates apply to your jobs',
                                style: AppTypography.bodyMedium.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(AppTheme.spacing16),
                        itemCount: _allApplications.length,
                        itemBuilder: (context, index) {
                          final application = _allApplications[index];
                          final candidateName = application.candidate?.name ?? 'Unknown Candidate';
                          final jobTitle = application.job.title;
                          final statusText = _formatStatus(application.status);
                          final timeAgo = _getTimeAgo(application.appliedAt);

                          return Padding(
                            padding: const EdgeInsets.only(bottom: AppTheme.spacing12),
                            child: Container(
                              padding: const EdgeInsets.all(AppTheme.spacing16),
                              decoration: BoxDecoration(
                                color: AppColors.iosSystemGrey6,
                                borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                              ),
                              child: Column(
                                children: [
                                  // Main application info
                                  Row(
                                    children: [
                                      // Avatar
                                      Container(
                                        width: 50,
                                        height: 50,
                                        decoration: BoxDecoration(
                                          color: AppColors.primary600.withValues(alpha: 0.1),
                                          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                                        ),
                                        child: Center(
                                          child: Text(
                                            candidateName.isNotEmpty ? candidateName[0].toUpperCase() : '?',
                                            style: AppTypography.headlineMedium.copyWith(
                                              color: AppColors.primary600,
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: AppTheme.spacing12),
                                      // Info
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              candidateName,
                                              style: AppTypography.headlineSmall,
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: AppTheme.spacing4),
                                            Text(
                                              jobTitle,
                                              style: AppTypography.bodyMedium.copyWith(
                                                color: AppColors.textSecondary,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: AppTheme.spacing8),
                                            Row(
                                              children: [
                                                Container(
                                                  padding: const EdgeInsets.symmetric(
                                                    horizontal: AppTheme.spacing8,
                                                    vertical: AppTheme.spacing4,
                                                  ),
                                                  decoration: BoxDecoration(
                                                    color: _getStatusColor(application.status)
                                                        .withValues(alpha: 0.1),
                                                    borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                                                  ),
                                                  child: Text(
                                                    statusText,
                                                    style: AppTypography.bodySmall.copyWith(
                                                      color: _getStatusColor(application.status),
                                                    ),
                                                  ),
                                                ),
                                                const SizedBox(width: AppTheme.spacing8),
                                                Text(
                                                  timeAgo,
                                                  style: AppTypography.bodySmall.copyWith(
                                                    color: AppColors.textSecondary,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                      const Icon(
                                        CupertinoIcons.chevron_right,
                                        color: AppColors.iosSystemGrey,
                                      ),
                                    ],
                                  ),
                                  
                                  // Action buttons for appropriate statuses
                                  if (_canScheduleInterview(application.status))
                                    Padding(
                                      padding: const EdgeInsets.only(top: AppTheme.spacing12),
                                      child: Row(
                                        children: [
                                          Expanded(
                                            child: CupertinoButton(
                                              padding: const EdgeInsets.symmetric(
                                                horizontal: AppTheme.spacing12,
                                                vertical: AppTheme.spacing8,
                                              ),
                                              color: AppColors.primary600,
                                              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                                              child: Text(
                                                'Schedule Interview',
                                                style: AppTypography.button.copyWith(
                                                  color: CupertinoColors.white,
                                                  fontSize: 14,
                                                ),
                                              ),
                                              onPressed: () => _scheduleInterview(application),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
      ),
    );
  }
  
  String _formatStatus(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.pending:
        return 'New';
      case ApplicationStatus.reviewed:
        return 'Under Review';
      case ApplicationStatus.analyzed:
        return 'Analyzed';
      case ApplicationStatus.shortlisted:
        return 'Shortlisted';
      case ApplicationStatus.interviewed:
        return 'Interview Scheduled';
      case ApplicationStatus.offered:
        return 'Offered';
      case ApplicationStatus.hired:
        return 'Hired';
      case ApplicationStatus.rejected:
        return 'Rejected';
      case ApplicationStatus.withdrawn:
        return 'Withdrawn';
    }
  }
  
  String _getTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inDays > 30) {
      final months = (difference.inDays / 30).floor();
      return '$months ${months == 1 ? 'month' : 'months'} ago';
    } else if (difference.inDays > 0) {
      return '${difference.inDays} ${difference.inDays == 1 ? 'day' : 'days'} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} ${difference.inHours == 1 ? 'hour' : 'hours'} ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} ${difference.inMinutes == 1 ? 'minute' : 'minutes'} ago';
    } else {
      return 'Just now';
    }
  }

  Color _getStatusColor(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.pending:
        return AppColors.info;
      case ApplicationStatus.reviewed:
      case ApplicationStatus.analyzed:
      case ApplicationStatus.shortlisted:
        return AppColors.warning;
      case ApplicationStatus.interviewed:
      case ApplicationStatus.offered:
      case ApplicationStatus.hired:
        return AppColors.success;
      case ApplicationStatus.rejected:
      case ApplicationStatus.withdrawn:
        return AppColors.error;
    }
  }

  bool _canScheduleInterview(ApplicationStatus status) {
    // Allow scheduling interviews for applications that are under review or shortlisted
    return status == ApplicationStatus.reviewed || 
           status == ApplicationStatus.analyzed || 
           status == ApplicationStatus.shortlisted;
  }

  void _scheduleInterview(Application application) {
    Get.toNamed('/schedule-interview', arguments: {
      'applicationId': application.id,
      'candidateName': application.candidate?.name ?? 'Unknown Candidate',
      'candidateTitle': 'Applicant for ${application.job.title}',
    });
  }
}
