import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/models/models.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/controllers/job_controller.dart';

/// Reusable job card widget
class JobCard extends StatelessWidget {
  final Job job;
  final VoidCallback? onTap;

  const JobCard({
    super.key,
    required this.job,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final jobController = Get.find<JobController>();

    return CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: onTap ?? () {
        Get.toNamed('/job-detail', arguments: job.id);
      },
      child: Container(
        decoration: AppTheme.cardDecoration(borderRadius: AppTheme.radiusXl),
        child: Padding(
          padding: const EdgeInsets.all(AppTheme.spacing16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Company and bookmark
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        // Company logo or placeholder
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: AppColors.primary50,
                            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                            image: job.company.logo != null
                                ? DecorationImage(
                                    image: NetworkImage(job.company.logo!),
                                    fit: BoxFit.cover,
                                  )
                                : null,
                          ),
                          child: job.company.logo == null
                              ? const Icon(
                                  CupertinoIcons.building_2_fill,
                                  color: AppColors.primary600,
                                  size: 24,
                                )
                              : null,
                        ),
                        const SizedBox(width: AppTheme.spacing12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                job.company.name,
                                style: AppTypography.labelLarge.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              Text(
                                job.location,
                                style: AppTypography.labelSmall.copyWith(
                                  color: AppColors.textTertiary,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Bookmark button
                  Obx(() => CupertinoButton(
                        padding: EdgeInsets.zero,
                        onPressed: () {
                          jobController.toggleSaveJob(job.id);
                        },
                        child: Icon(
                          jobController.isJobSaved(job.id)
                              ? CupertinoIcons.bookmark_fill
                              : CupertinoIcons.bookmark,
                          color: jobController.isJobSaved(job.id)
                              ? AppColors.primary600
                              : AppColors.textTertiary,
                          size: 20,
                        ),
                      )),
                ],
              ),
              const SizedBox(height: AppTheme.spacing12),
              
              // Job title
              Text(
                job.title,
                style: AppTypography.headlineMedium.copyWith(
                  color: AppColors.textPrimary,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              
              const SizedBox(height: AppTheme.spacing4),
              Text(
                job.department,
                style: AppTypography.labelMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              
              const SizedBox(height: AppTheme.spacing12),
              
              // Job details chips
              Wrap(
                spacing: AppTheme.spacing8,
                runSpacing: AppTheme.spacing8,
                children: [
                  _buildChip(
                    job.type.displayName,
                    CupertinoIcons.briefcase,
                  ),
                  _buildChip(
                    job.jobLevel.displayName,
                    CupertinoIcons.chart_bar,
                  ),
                  _buildChip(
                    job.workType.displayName,
                    CupertinoIcons.location,
                  ),
                ],
              ),
              
              const SizedBox(height: AppTheme.spacing12),
              Row(
                children: [
                  const Icon(
                    CupertinoIcons.money_dollar_circle,
                    size: 16,
                    color: AppColors.primary600,
                  ),
                  const SizedBox(width: AppTheme.spacing4),
                  Text(
                    job.salary,
                    style: AppTypography.labelLarge.copyWith(
                      color: AppColors.primary600,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: AppTheme.spacing8),
              Row(
                children: [
                  Icon(
                    CupertinoIcons.time,
                    size: 14,
                    color: job.isExpired
                        ? AppColors.error
                        : AppColors.textTertiary,
                  ),
                  const SizedBox(width: AppTheme.spacing4),
                  Text(
                    job.formattedDeadline,
                    style: AppTypography.labelSmall.copyWith(
                      color: job.isExpired
                          ? AppColors.error
                          : AppColors.textTertiary,
                    ),
                  ),
                ],
              ),
              
              // Featured badge
              if (job.featured) ...[
                const SizedBox(height: AppTheme.spacing8),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppTheme.spacing8,
                    vertical: AppTheme.spacing4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.warning.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        CupertinoIcons.star_fill,
                        size: 12,
                        color: AppColors.warning,
                      ),
                      const SizedBox(width: AppTheme.spacing4),
                      Text(
                        'Featured',
                        style: AppTypography.labelSmall.copyWith(
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
        ),
      ),
    );
  }

  Widget _buildChip(String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppTheme.spacing8,
        vertical: AppTheme.spacing4,
      ),
      decoration: BoxDecoration(
        color: AppColors.iosSystemGrey6,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 12,
            color: AppColors.textSecondary,
          ),
          const SizedBox(width: AppTheme.spacing4),
          Text(
            label,
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
