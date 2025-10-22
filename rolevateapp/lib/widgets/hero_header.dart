import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';

class HeroHeader extends StatelessWidget {
  const HeroHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.primary600,
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppTheme.spacing20,
            vertical: AppTheme.spacing32,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top bar with logo and login
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'RoleVate',
                    style: AppTypography.displayMedium.copyWith(
                      color: CupertinoColors.white,
                    ),
                  ),
                  CupertinoButton(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppTheme.spacing16,
                      vertical: AppTheme.spacing8,
                    ),
                    color: CupertinoColors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(AppTheme.radius2xl),
                    onPressed: () => Get.toNamed('/login'),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          CupertinoIcons.person_circle,
                          color: CupertinoColors.white,
                          size: 20,
                        ),
                        const SizedBox(width: AppTheme.spacing8),
                        Text(
                          'Login',
                          style: AppTypography.button.copyWith(
                            color: CupertinoColors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppTheme.spacing40),
              // Hero content
              Text(
                'Find Your Dream Job',
                style: AppTypography.displayLarge.copyWith(
                  fontSize: 36,
                  color: CupertinoColors.white,
                ),
              ),
              const SizedBox(height: AppTheme.spacing12),
              Text(
                'Discover thousands of opportunities from top companies',
                style: AppTypography.bodyLarge.copyWith(
                  color: CupertinoColors.white,
                ),
              ),
              const SizedBox(height: AppTheme.spacing32),
              // Search bar
              Container(
                decoration: AppTheme.cardDecoration(
                  color: CupertinoColors.white,
                  borderRadius: AppTheme.radiusLg,
                ),
                child: CupertinoTextField(
                  placeholder: 'Search jobs, companies, or keywords...',
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppTheme.spacing16,
                    vertical: AppTheme.spacing16,
                  ),
                  decoration: const BoxDecoration(),
                  style: AppTypography.bodyMedium,
                  prefix: const Padding(
                    padding: EdgeInsets.only(left: AppTheme.spacing16),
                    child: Icon(
                      CupertinoIcons.search,
                      color: AppColors.iosSystemGrey,
                    ),
                  ),
                  suffix: Padding(
                    padding: const EdgeInsets.only(right: AppTheme.spacing8),
                    child: CupertinoButton(
                      padding: EdgeInsets.zero,
                      minSize: 0,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppTheme.spacing16,
                          vertical: AppTheme.spacing8,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary600,
                          borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                        ),
                        child: Text(
                          'Search',
                          style: AppTypography.button.copyWith(
                            color: CupertinoColors.white,
                          ),
                        ),
                      ),
                      onPressed: () {
                        // Handle search
                      },
                    ),
                  ),
                  onSubmitted: (value) {
                    // Handle search
                  },
                ),
              ),
              const SizedBox(height: AppTheme.spacing20),
            ],
          ),
        ),
      ),
    );
  }
}
