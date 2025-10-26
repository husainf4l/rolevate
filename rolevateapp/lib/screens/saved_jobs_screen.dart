import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/job_controller.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/widgets/job_card.dart';

class SavedJobsScreen extends StatefulWidget {
  const SavedJobsScreen({super.key});

  @override
  State<SavedJobsScreen> createState() => _SavedJobsScreenState();
}

class _SavedJobsScreenState extends State<SavedJobsScreen> {
  final JobController jobController = Get.find<JobController>();

  @override
  void initState() {
    super.initState();
    // Fetch saved jobs if not already loaded
    if (jobController.savedJobs.isEmpty) {
      jobController.fetchSavedJobs();
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: Text('Saved Jobs'),
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
                    'Error loading saved jobs',
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
                    onPressed: () => jobController.fetchSavedJobs(),
                  ),
                ],
              ),
            );
          }

          if (jobController.savedJobs.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    CupertinoIcons.heart,
                    size: 48,
                    color: AppColors.iosSystemGrey,
                  ),
                  const SizedBox(height: AppTheme.spacing16),
                  Text(
                    'No saved jobs yet',
                    style: AppTypography.headlineMedium,
                  ),
                  const SizedBox(height: AppTheme.spacing8),
                  Text(
                    'Jobs you save will appear here',
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
            itemCount: jobController.savedJobs.length,
            itemBuilder: (context, index) {
              final savedJob = jobController.savedJobs[index];
              if (savedJob.job == null) return const SizedBox.shrink();
              return Padding(
                padding: const EdgeInsets.only(bottom: AppTheme.spacing16),
                child: JobCard(job: savedJob.job!),
              );
            },
          );
        }),
      ),
    );
  }
}