import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/services/job_service.dart';
import 'package:rolevateapp/services/application_service.dart';
import 'package:rolevateapp/models/models.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';

class BusinessJobsScreen extends StatefulWidget {
  const BusinessJobsScreen({super.key});

  @override
  State<BusinessJobsScreen> createState() => _BusinessJobsScreenState();
}

class _BusinessJobsScreenState extends State<BusinessJobsScreen> {
  final _jobService = JobService();
  final _applicationService = ApplicationService();
  
  bool _isLoading = true;
  List<Job> _jobs = [];
  Map<String, int> _applicantCounts = {};
  String _errorMessage = '';
  
  @override
  void initState() {
    super.initState();
    _loadJobs();
  }
  
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    
    // Check if we should refresh the jobs list
    final args = Get.arguments;
    if (args != null && args is Map && args['refresh'] == true) {
      debugPrint('🔄 Refresh argument detected, reloading jobs...');
      _loadJobs();
    }
  }
  
  Future<void> _loadJobs() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });
    
    try {
      // Fetch company jobs
      final jobs = await _jobService.getCompanyJobs();
      
      // Fetch applicant counts for each job
      Map<String, int> counts = {};
      for (var job in jobs) {
        try {
          final apps = await _applicationService.getApplicationsByJob(job.id);
          counts[job.id] = apps.length;
        } catch (e) {
          debugPrint('Error fetching applications for job ${job.id}: $e');
          counts[job.id] = 0;
        }
      }
      
      setState(() {
        _jobs = jobs;
        _applicantCounts = counts;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error loading jobs: $e');
      setState(() {
        _errorMessage = 'Failed to load jobs';
        _isLoading = false;
      });
      
      Get.snackbar(
        'Error',
        'Failed to load jobs',
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
        middle: const Text('All Jobs'),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          child: const Icon(CupertinoIcons.back),
          onPressed: () => Get.back(),
        ),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          child: const Icon(CupertinoIcons.add),
          onPressed: () => Get.toNamed('/post-job'),
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
                            onPressed: _loadJobs,
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  )
                : _jobs.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(AppTheme.spacing24),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                CupertinoIcons.briefcase,
                                size: 64,
                                color: AppColors.iosSystemGrey,
                              ),
                              const SizedBox(height: AppTheme.spacing16),
                              Text(
                                'No Jobs Posted',
                                style: AppTypography.headlineMedium,
                              ),
                              const SizedBox(height: AppTheme.spacing8),
                              Text(
                                'Post your first job to start receiving applications',
                                style: AppTypography.bodyMedium.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: AppTheme.spacing16),
                              CupertinoButton(
                                color: CupertinoColors.systemBlue,
                                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                                child: const Text(
                                  'Post a Job',
                                  style: TextStyle(
                                    color: CupertinoColors.white,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                onPressed: () => Get.toNamed('/post-job'),
                              ),
                            ],
                          ),
                        ),
                      )
                    : CustomScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        slivers: [
                          CupertinoSliverRefreshControl(
                            onRefresh: _loadJobs,
                          ),
                          SliverPadding(
                            padding: const EdgeInsets.all(AppTheme.spacing16),
                            sliver: SliverList(
                              delegate: SliverChildBuilderDelegate(
                                (context, index) {
            final job = _jobs[index];
            final applicantCount = _applicantCounts[job.id] ?? 0;
            final statusText = _formatStatus(job.status);
            final statusColor = _getStatusColor(job.status);
            
            return Padding(
              padding: const EdgeInsets.only(bottom: AppTheme.spacing12),
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
                            job.title,
                            style: AppTypography.headlineSmall,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: AppTheme.spacing8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppTheme.spacing12,
                            vertical: AppTheme.spacing4,
                          ),
                          decoration: BoxDecoration(
                            color: statusColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                          ),
                          child: Text(
                            statusText,
                            style: AppTypography.bodySmall.copyWith(
                              color: statusColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppTheme.spacing12),
                    Row(
                      children: [
                        Icon(
                          CupertinoIcons.location_solid,
                          size: 16,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(width: AppTheme.spacing4),
                        Expanded(
                          child: Text(
                            job.location,
                            style: AppTypography.bodyMedium.copyWith(
                              color: AppColors.textSecondary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppTheme.spacing8),
                    Row(
                      children: [
                        const Icon(
                          CupertinoIcons.person_2,
                          size: 16,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(width: AppTheme.spacing4),
                        Text(
                          '$applicantCount ${applicantCount == 1 ? 'applicant' : 'applicants'}',
                          style: AppTypography.bodyMedium.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const Spacer(),
                        Icon(
                          CupertinoIcons.calendar,
                          size: 16,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(width: AppTheme.spacing4),
                        Text(
                          _formatDate(job.deadline),
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppTheme.spacing12),
                    Row(
                      children: [
                        Expanded(
                          child: CupertinoButton(
                            padding: const EdgeInsets.symmetric(
                              vertical: AppTheme.spacing8,
                            ),
                            color: AppColors.primary600,
                            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                            child: const Text(
                              'View Details',
                              style: TextStyle(
                                color: CupertinoColors.white,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            onPressed: () => Get.toNamed('/job-detail', arguments: job.id),
                          ),
                        ),
                        const SizedBox(width: AppTheme.spacing8),
                        CupertinoButton(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppTheme.spacing16,
                            vertical: AppTheme.spacing8,
                          ),
                          color: AppColors.iosSystemGrey5,
                          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                          child: const Icon(CupertinoIcons.ellipsis, color: AppColors.textPrimary),
                          onPressed: () {
                            _showJobOptions(context, job);
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
                                },
                                childCount: _jobs.length,
                              ),
                            ),
                          ),
                        ],
                      ),
      ),
    );
  }
  
  String _formatStatus(JobStatus status) {
    switch (status) {
      case JobStatus.draft:
        return 'Draft';
      case JobStatus.active:
        return 'Active';
      case JobStatus.paused:
        return 'Paused';
      case JobStatus.closed:
        return 'Closed';
      case JobStatus.expired:
        return 'Expired';
      case JobStatus.deleted:
        return 'Deleted';
    }
  }
  
  Color _getStatusColor(JobStatus status) {
    switch (status) {
      case JobStatus.draft:
        return AppColors.warning;
      case JobStatus.active:
        return AppColors.success;
      case JobStatus.paused:
        return AppColors.info;
      case JobStatus.closed:
      case JobStatus.expired:
      case JobStatus.deleted:
        return AppColors.iosSystemGrey;
    }
  }
  
  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = date.difference(now);
    
    if (difference.isNegative) {
      return 'Expired';
    } else if (difference.inDays > 30) {
      final months = (difference.inDays / 30).floor();
      return '$months ${months == 1 ? 'month' : 'months'}';
    } else if (difference.inDays > 0) {
      return '${difference.inDays} ${difference.inDays == 1 ? 'day' : 'days'}';
    } else {
      return 'Today';
    }
  }
  
  void _showJobOptions(BuildContext context, Job job) {
    showCupertinoModalPopup(
      context: context,
      builder: (BuildContext context) => CupertinoActionSheet(
        title: Text(job.title),
        actions: <CupertinoActionSheetAction>[
          CupertinoActionSheetAction(
            child: const Text('View Applications'),
            onPressed: () {
              Navigator.pop(context);
              Get.toNamed('/applications');
            },
          ),
          CupertinoActionSheetAction(
            child: const Text('Publish Job'),
            onPressed: () {
              Navigator.pop(context);
              _publishJob(context, job);
            },
          ),
          CupertinoActionSheetAction(
            child: const Text('Edit Job'),
            onPressed: () {
              Navigator.pop(context);
              // TODO: Navigate to edit job screen
              Get.snackbar('Coming Soon', 'Edit job feature will be available soon');
            },
          ),
          CupertinoActionSheetAction(
            child: const Text('Close Job'),
            onPressed: () {
              Navigator.pop(context);
              // TODO: Implement close job
              Get.snackbar('Coming Soon', 'Close job feature will be available soon');
            },
          ),
          CupertinoActionSheetAction(
            isDestructiveAction: true,
            child: const Text('Delete Job'),
            onPressed: () {
              Navigator.pop(context);
              _confirmDelete(context, job);
            },
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          child: const Text('Cancel'),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
    );
  }
  
  void _confirmDelete(BuildContext context, Job job) {
    showCupertinoDialog(
      context: context,
      builder: (BuildContext context) => CupertinoAlertDialog(
        title: const Text('Delete Job'),
        content: Text('Are you sure you want to delete "${job.title}"? This action cannot be undone.'),
        actions: <CupertinoDialogAction>[
          CupertinoDialogAction(
            child: const Text('Cancel'),
            onPressed: () {
              Navigator.pop(context);
            },
          ),
          CupertinoDialogAction(
            isDestructiveAction: true,
            child: const Text('Delete'),
            onPressed: () {
              Navigator.pop(context);
              // TODO: Implement delete job
              Get.snackbar('Coming Soon', 'Delete job feature will be available soon');
            },
          ),
        ],
      ),
    );
  }

  void _publishJob(BuildContext context, Job job) {
    showCupertinoDialog(
      context: context,
      builder: (BuildContext context) => CupertinoAlertDialog(
        title: const Text('Publish Job'),
        content: Text('Do you want to publish "${job.title}" and make it visible to candidates?'),
        actions: <CupertinoDialogAction>[
          CupertinoDialogAction(
            child: const Text('Cancel'),
            onPressed: () {
              Navigator.pop(context);
            },
          ),
          CupertinoDialogAction(
            isDefaultAction: true,
            child: const Text('Publish'),
            onPressed: () async {
              Navigator.pop(context);
              
              // Show loading indicator
              showCupertinoDialog(
                context: context,
                barrierDismissible: false,
                builder: (BuildContext dialogContext) => const CupertinoAlertDialog(
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CupertinoActivityIndicator(),
                      SizedBox(height: 16),
                      Text('Publishing job...'),
                    ],
                  ),
                ),
              );
              
              try {
                // Call API to publish job (set status to ACTIVE)
                await _jobService.updateJob(
                  jobId: job.id,
                  status: JobStatus.active,
                );
                
                Navigator.of(context).pop(); // Close loading dialog
                
                // Show success message
                Get.snackbar(
                  'Job Published',
                  '${job.title} has been published successfully and is now visible to candidates',
                  snackPosition: SnackPosition.BOTTOM,
                  backgroundColor: CupertinoColors.systemGreen,
                  colorText: CupertinoColors.white,
                  duration: const Duration(seconds: 3),
                );
                
                // Refresh the jobs list
                _loadJobs();
              } catch (e) {
                Navigator.of(context).pop(); // Close loading dialog
                
                // Show error message
                Get.snackbar(
                  'Error',
                  'Failed to publish job: ${e.toString()}',
                  snackPosition: SnackPosition.BOTTOM,
                  backgroundColor: CupertinoColors.destructiveRed,
                  colorText: CupertinoColors.white,
                  duration: const Duration(seconds: 3),
                );
              }
            },
          ),
        ],
      ),
    );
  }
}
