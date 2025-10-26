import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: Text('Notifications'),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          child: const Icon(CupertinoIcons.back),
          onPressed: () => Get.back(),
        ),
      ),
      child: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                CupertinoIcons.bell,
                size: 48,
                color: AppColors.iosSystemGrey,
              ),
              const SizedBox(height: AppTheme.spacing16),
              Text(
                'No notifications yet',
                style: AppTypography.headlineMedium,
              ),
              const SizedBox(height: AppTheme.spacing8),
              Text(
                'You\'ll receive notifications about job updates,\napplication status, and more.',
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
        ),
      ),
    );
  }
}