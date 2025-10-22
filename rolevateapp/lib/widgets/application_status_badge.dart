import 'package:flutter/cupertino.dart';
import 'package:rolevateapp/models/enums.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';

/// Widget to display application status with appropriate colors
class ApplicationStatusBadge extends StatelessWidget {
  final ApplicationStatus status;
  final bool compact;

  const ApplicationStatusBadge({
    super.key,
    required this.status,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final colors = _getStatusColors(status);
    
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? AppTheme.spacing8 : AppTheme.spacing12,
        vertical: compact ? AppTheme.spacing4 : AppTheme.spacing8,
      ),
      decoration: BoxDecoration(
        color: colors['background'],
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _getStatusIcon(status),
            size: compact ? 12 : 14,
            color: colors['foreground'],
          ),
          SizedBox(width: compact ? AppTheme.spacing4 : AppTheme.spacing8),
          Text(
            status.displayName,
            style: (compact ? AppTypography.labelSmall : AppTypography.labelMedium).copyWith(
              color: colors['foreground'],
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  /// Get status-specific colors
  Map<String, Color> _getStatusColors(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.pending:
        return {
          'background': AppColors.warning.withOpacity(0.1),
          'foreground': AppColors.warning,
        };
      case ApplicationStatus.reviewed:
        return {
          'background': AppColors.info.withOpacity(0.1),
          'foreground': AppColors.info,
        };
      case ApplicationStatus.shortlisted:
        return {
          'background': AppColors.primary.withOpacity(0.1),
          'foreground': AppColors.primary,
        };
      case ApplicationStatus.interviewed:
        return {
          'background': AppColors.primary.withOpacity(0.15),
          'foreground': AppColors.primary700,
        };
      case ApplicationStatus.offered:
        return {
          'background': AppColors.success.withOpacity(0.1),
          'foreground': AppColors.success,
        };
      case ApplicationStatus.hired:
        return {
          'background': AppColors.success.withOpacity(0.2),
          'foreground': AppColors.success,
        };
      case ApplicationStatus.analyzed:
        return {
          'background': AppColors.primary.withOpacity(0.1),
          'foreground': AppColors.primary,
        };
      case ApplicationStatus.rejected:
        return {
          'background': AppColors.error.withOpacity(0.1),
          'foreground': AppColors.error,
        };
      case ApplicationStatus.withdrawn:
        return {
          'background': AppColors.iosSystemGrey4,
          'foreground': AppColors.textSecondary,
        };
    }
  }

  /// Get status-specific icon
  IconData _getStatusIcon(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.pending:
        return CupertinoIcons.clock;
      case ApplicationStatus.reviewed:
        return CupertinoIcons.eye;
      case ApplicationStatus.shortlisted:
        return CupertinoIcons.star;
      case ApplicationStatus.interviewed:
        return CupertinoIcons.video_camera;
      case ApplicationStatus.offered:
        return CupertinoIcons.hand_thumbsup;
      case ApplicationStatus.hired:
        return CupertinoIcons.checkmark_seal;
      case ApplicationStatus.analyzed:
        return CupertinoIcons.chart_bar_alt_fill;
      case ApplicationStatus.rejected:
        return CupertinoIcons.xmark_circle;
      case ApplicationStatus.withdrawn:
        return CupertinoIcons.arrow_uturn_left;
    }
  }
}
