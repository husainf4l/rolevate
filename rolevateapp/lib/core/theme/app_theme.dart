import 'package:flutter/cupertino.dart';
import 'app_colors.dart';
import 'app_typography.dart';

/// RoleVate app theme following Apple Human Interface Guidelines
class AppTheme {
  // Spacing Scale
  static const double spacing4 = 4.0;
  static const double spacing8 = 8.0;
  static const double spacing12 = 12.0;
  static const double spacing16 = 16.0;
  static const double spacing20 = 20.0;
  static const double spacing24 = 24.0;
  static const double spacing32 = 32.0;
  static const double spacing40 = 40.0;
  static const double spacing48 = 48.0;
  
  // Border Radius Scale (from website: --radius: 0.625rem = 10px)
  static const double radiusXs = 6.0;
  static const double radiusSm = 8.0;
  static const double radiusMd = 10.0;
  static const double radiusLg = 12.0;
  static const double radiusXl = 16.0;
  static const double radius2xl = 20.0;
  
  // Shadow Definitions (from website)
  static const List<BoxShadow> shadowSoft = [
    BoxShadow(
      color: Color(0x0A000000), // rgba(0, 0, 0, 0.04)
      blurRadius: 24,
      offset: Offset(0, 2),
    ),
  ];
  
  static const List<BoxShadow> shadowMedium = [
    BoxShadow(
      color: Color(0x14000000), // rgba(0, 0, 0, 0.08)
      blurRadius: 32,
      offset: Offset(0, 4),
    ),
  ];
  
  static const List<BoxShadow> shadowStrong = [
    BoxShadow(
      color: Color(0x1F000000), // rgba(0, 0, 0, 0.12)
      blurRadius: 48,
      offset: Offset(0, 8),
    ),
  ];
  
  // iOS-style card shadow
  static const List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Color(0x1A000000),
      blurRadius: 10,
      offset: Offset(0, 2),
    ),
  ];
  
  // Cupertino Theme Data
  static CupertinoThemeData get lightTheme {
    return CupertinoThemeData(
      brightness: Brightness.light,
      primaryColor: AppColors.primary600,
      primaryContrastingColor: CupertinoColors.white,
      scaffoldBackgroundColor: AppColors.background,
      barBackgroundColor: CupertinoColors.white,
      textTheme: CupertinoTextThemeData(
        primaryColor: AppColors.foreground,
        textStyle: AppTypography.bodyMedium.copyWith(
          color: AppColors.foreground,
        ),
        actionTextStyle: AppTypography.button.copyWith(
          color: AppColors.primary600,
        ),
        tabLabelTextStyle: AppTypography.labelSmall.copyWith(
          color: AppColors.iosSystemGrey,
        ),
        navTitleTextStyle: AppTypography.headlineMedium.copyWith(
          color: AppColors.foreground,
          fontWeight: FontWeight.w600,
        ),
        navLargeTitleTextStyle: AppTypography.displayLarge.copyWith(
          color: AppColors.foreground,
        ),
        navActionTextStyle: AppTypography.button.copyWith(
          color: AppColors.primary600,
        ),
        pickerTextStyle: AppTypography.bodyMedium.copyWith(
          color: AppColors.foreground,
        ),
        dateTimePickerTextStyle: AppTypography.bodyMedium.copyWith(
          color: AppColors.foreground,
        ),
      ),
    );
  }
  
  static CupertinoThemeData get darkTheme {
    return CupertinoThemeData(
      brightness: Brightness.dark,
      primaryColor: AppColors.primary600,
      primaryContrastingColor: CupertinoColors.black,
      scaffoldBackgroundColor: const Color(0xFF000000),
      barBackgroundColor: const Color(0xFF1C1C1E),
      textTheme: CupertinoTextThemeData(
        primaryColor: CupertinoColors.white,
        textStyle: AppTypography.bodyMedium.copyWith(
          color: CupertinoColors.white,
        ),
        actionTextStyle: AppTypography.button.copyWith(
          color: AppColors.primary600,
        ),
        tabLabelTextStyle: AppTypography.labelSmall.copyWith(
          color: CupertinoColors.systemGrey,
        ),
        navTitleTextStyle: AppTypography.headlineMedium.copyWith(
          color: CupertinoColors.white,
          fontWeight: FontWeight.w600,
        ),
        navLargeTitleTextStyle: AppTypography.displayLarge.copyWith(
          color: CupertinoColors.white,
        ),
        navActionTextStyle: AppTypography.button.copyWith(
          color: AppColors.primary600,
        ),
        pickerTextStyle: AppTypography.bodyMedium.copyWith(
          color: CupertinoColors.white,
        ),
        dateTimePickerTextStyle: AppTypography.bodyMedium.copyWith(
          color: CupertinoColors.white,
        ),
      ),
    );
  }
  
  // Animation Durations
  static const Duration fastAnimation = Duration(milliseconds: 150);
  static const Duration normalAnimation = Duration(milliseconds: 250);
  static const Duration slowAnimation = Duration(milliseconds: 400);
  
  // Cubic Bezier Easing (Apple-style)
  static const Cubic easeOut = Cubic(0.25, 0.46, 0.45, 0.94);
  static const Cubic easeInOut = Cubic(0.42, 0.0, 0.58, 1.0);
  
  // Glass Effect Decoration
  static BoxDecoration glassDecoration({
    Color? color,
    double borderRadius = radiusLg,
  }) {
    return BoxDecoration(
      color: color ?? AppColors.glassWhite,
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: AppColors.borderSubtle,
        width: 1,
      ),
    );
  }
  
  // Glass Strong Effect Decoration
  static BoxDecoration glassStrongDecoration({
    Color? color,
    double borderRadius = radiusLg,
  }) {
    return BoxDecoration(
      color: color ?? AppColors.glassWhiteStrong,
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: AppColors.borderCorporate,
        width: 1,
      ),
    );
  }
  
  // Card Decoration
  static BoxDecoration cardDecoration({
    Color? color,
    double borderRadius = radiusXl,
  }) {
    return BoxDecoration(
      color: color ?? AppColors.card,
      borderRadius: BorderRadius.circular(borderRadius),
      boxShadow: cardShadow,
    );
  }
  
  // Solid Primary Decoration (No gradient, just primary-600)
  static BoxDecoration primaryDecoration({
    double borderRadius = radiusLg,
  }) {
    return BoxDecoration(
      color: AppColors.primary600,
      borderRadius: BorderRadius.circular(borderRadius),
    );
  }
  
  // Primary Hover Decoration (primary-700)
  static BoxDecoration primaryHoverDecoration({
    double borderRadius = radiusLg,
  }) {
    return BoxDecoration(
      color: AppColors.primary700,
      borderRadius: BorderRadius.circular(borderRadius),
    );
  }
}
