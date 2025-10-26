import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/job_controller.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/models/application.dart';
import 'package:rolevateapp/models/enums.dart';

class MyApplicationsScreen extends StatefulWidget {
  const MyApplicationsScreen({super.key});

  @override
  State<MyApplicationsScreen> createState() => _MyApplicationsScreenState();
}

class _MyApplicationsScreenState extends State<MyApplicationsScreen> {
  final JobController jobController = Get.find<JobController>();

  @override
  void initState() {
    super.initState();
    // Fetch applications if not already loaded
    if (jobController.myApplications.isEmpty) {
      jobController.fetchMyApplications();
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: Text('My Applications'),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          child: const Icon(CupertinoIcons.back),
          onPressed: () => Get.back(),
        ),
      ),
      child: SafeArea(
        child: Obx(() {
          if (jobController.isLoading.value) {
            return const Center(
              child: CupertinoActivityIndicator(),
            );
          }

          if (jobController.error.value.isNotEmpty) {
            return Center(
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
                    'Error loading applications',
                    style: AppTypography.headlineMedium,
                  ),
                  const SizedBox(height: AppTheme.spacing8),
                  Text(
                    jobController.error.value,
                    style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppTheme.spacing16),
                  CupertinoButton(
                    color: AppColors.primary600,
                    borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                    child: Text(
                      'Retry',
                      style: AppTypography.button.copyWith(
                        color: CupertinoColors.white,
                      ),
                    ),
                    onPressed: () => jobController.fetchMyApplications(),
                  ),
                ],
              ),
            );
          }

          if (jobController.myApplications.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    CupertinoIcons.doc_text,
                    size: 48,
                    color: AppColors.iosSystemGrey,
                  ),
                  const SizedBox(height: AppTheme.spacing16),
                  Text(
                    'No applications yet',
                    style: AppTypography.headlineMedium,
                  ),
                  const SizedBox(height: AppTheme.spacing8),
                  Text(
                    'Applications you submit will appear here',
                    style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppTheme.spacing16),
                  CupertinoButton(
                    color: AppColors.primary600,
                    borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                    child: Text(
                      'Browse Jobs',
                      style: AppTypography.button.copyWith(
                        color: CupertinoColors.white,
                      ),
                    ),
                    onPressed: () => Get.toNamed('/browse-jobs'),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(AppTheme.spacing16),
            itemCount: jobController.myApplications.length,
            itemBuilder: (context, index) {
              final application = jobController.myApplications[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: AppTheme.spacing16),
                child: _buildApplicationCard(application),
              );
            },
          );
        }),
      ),
    );
  }

  Widget _buildApplicationCard(Application application) {
    return Container(
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
                  application.job.title,
                  style: AppTypography.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              _buildStatusBadge(application.status),
            ],
          ),
          const SizedBox(height: AppTheme.spacing8),
          Text(
            application.job.company.name,
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
                application.job.location,
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(width: AppTheme.spacing16),
              Icon(
                CupertinoIcons.calendar,
                color: AppColors.iosSystemGrey,
                size: 16,
              ),
              const SizedBox(width: AppTheme.spacing4),
              Text(
                _formatDate(application.createdAt),
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          if (application.interviewScheduled) ...[
            const SizedBox(height: AppTheme.spacing12),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppTheme.spacing12,
                vertical: AppTheme.spacing8,
              ),
              decoration: BoxDecoration(
                color: AppColors.warning.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              ),
              child: Row(
                children: [
                  const Icon(
                    CupertinoIcons.calendar_badge_plus,
                    color: AppColors.warning,
                    size: 16,
                  ),
                  const SizedBox(width: AppTheme.spacing8),
                  Text(
                    'Interview Scheduled',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.warning,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatusBadge(ApplicationStatus status) {
    Color color;
    String label;

    switch (status) {
      case ApplicationStatus.pending:
        color = AppColors.warning;
        label = 'Pending';
        break;
      case ApplicationStatus.reviewed:
        color = AppColors.info;
        label = 'Reviewed';
        break;
      case ApplicationStatus.shortlisted:
        color = AppColors.primary600;
        label = 'Shortlisted';
        break;
      case ApplicationStatus.interviewed:
        color = AppColors.primary600;
        label = 'Interviewed';
        break;
      case ApplicationStatus.offered:
        color = AppColors.success;
        label = 'Offered';
        break;
      case ApplicationStatus.hired:
        color = AppColors.success;
        label = 'Hired';
        break;
      case ApplicationStatus.analyzed:
        color = AppColors.info;
        label = 'Analyzed';
        break;
      case ApplicationStatus.rejected:
        color = AppColors.error;
        label = 'Rejected';
        break;
      case ApplicationStatus.withdrawn:
        color = AppColors.iosSystemGrey;
        label = 'Withdrawn';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppTheme.spacing8,
        vertical: AppTheme.spacing4,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(AppTheme.radiusSm),
      ),
      child: Text(
        label,
        style: AppTypography.labelSmall.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  String _formatDate(DateTime? date) {
    if (date == null) return 'Unknown';
    return '${date.day}/${date.month}/${date.year}';
  }
}