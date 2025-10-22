import 'package:flutter/cupertino.dart';

/// RoleVate brand colors based on the website design system
class AppColors {
  // Primary Color (Cyan-600 from website navbar)
  static const Color primary = Color(0xFF0891B2); // Primary cyan-600
  static const Color primaryDark = Color(0xFF0E7490); // Cyan-700 for hover states
  
  // Primary Scale (Cyan palette)
  static const Color primary50 = Color(0xFFF0FDFA);
  static const Color primary100 = Color(0xFFCCFBF1);
  static const Color primary200 = Color(0xFF99F6E4);
  static const Color primary300 = Color(0xFF5EEAD4);
  static const Color primary400 = Color(0xFF2DD4BF);
  static const Color primary500 = Color(0xFF14B8A6);
  static const Color primary600 = Color(0xFF0891B2); // Main brand color
  static const Color primary700 = Color(0xFF0E7490);
  static const Color primary800 = Color(0xFF155E75);
  static const Color primary900 = Color(0xFF164E63);

  // Accent Colors
  static const Color accentLight = Color(0xFFF0FDFA);
  static const Color activeLinkBg = Color(0xCCF0FDFA); // primary-50 with 80% opacity
  
  // Glass Effect Colors (for cards, not navigation)
  static const Color glassWhite = Color(0xD9FFFFFF); // rgba(255, 255, 255, 0.85)
  static const Color glassWhiteStrong = Color(0xF2FFFFFF); // rgba(255, 255, 255, 0.95)
  
  // Border Colors
  static const Color borderSubtle = Color(0x33FFFFFF); // rgba(255, 255, 255, 0.2)
  static const Color borderCorporate = Color(0x1A0891B2); // rgba(8, 145, 178, 0.1)
  
  // Text Colors
  static const Color textPrimary = Color(0xFF0F172A); // Slate-900
  static const Color textSecondary = Color(0xFF4B5563); // Gray-600
  static const Color textTertiary = Color(0xFF6B7280); // Gray-500
  
  // Surface Colors
  static const Color surfaceElevated = Color(0xCCFFFFFF); // rgba(255, 255, 255, 0.8)
  
  // Background
  static const Color background = Color(0xFFFFFFFF);
  static const Color foreground = Color(0xFF0F172A);
  
  // Card Colors
  static const Color card = Color(0xFFFFFFFF);
  static const Color cardForeground = Color(0xFF0F172A);
  
  // iOS System Colors (for native feel)
  static const Color iosSystemBlue = CupertinoColors.systemBlue;
  static const Color iosSystemGrey = CupertinoColors.systemGrey;
  static const Color iosSystemGrey2 = CupertinoColors.systemGrey2;
  static const Color iosSystemGrey3 = CupertinoColors.systemGrey3;
  static const Color iosSystemGrey4 = CupertinoColors.systemGrey4;
  static const Color iosSystemGrey5 = CupertinoColors.systemGrey5;
  static const Color iosSystemGrey6 = CupertinoColors.systemGrey6;
  
  // Semantic Colors
  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);
}
