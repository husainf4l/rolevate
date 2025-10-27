import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/controllers/theme_controller.dart';

class DarkModeSettingsScreen extends StatefulWidget {
  const DarkModeSettingsScreen({super.key});

  @override
  State<DarkModeSettingsScreen> createState() => _DarkModeSettingsScreenState();
}

class _DarkModeSettingsScreenState extends State<DarkModeSettingsScreen> {
  final ThemeController _themeController = Get.find<ThemeController>();
  
  late String _themeMode;
  bool _adaptiveBrightness = true;
  bool _trueDarkMode = false;
  double _brightness = 0.5;
  
  @override
  void initState() {
    super.initState();
    _themeMode = _themeController.themeMode.value;
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: const Text('Dark Mode Settings'),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          child: const Icon(CupertinoIcons.back),
          onPressed: () => Get.back(),
        ),
      ),
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(AppTheme.spacing20),
          children: [
            // Theme Mode Selection
            _buildSectionHeader('Appearance'),
            const SizedBox(height: AppTheme.spacing16),
            
            Text(
              'Choose how Rolevate looks to you. Select a single theme, or sync with your system settings.',
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: AppTheme.spacing24),
            
            // Theme Options
            _buildThemeOption(
              icon: CupertinoIcons.sun_max,
              title: 'Light Mode',
              subtitle: 'Bright and clear interface',
              value: 'light',
              isSelected: _themeMode == 'light',
              onTap: () {
                setState(() => _themeMode = 'light');
                _themeController.setThemeMode('light');
              },
            ),
            const SizedBox(height: AppTheme.spacing12),
            
            _buildThemeOption(
              icon: CupertinoIcons.moon,
              title: 'Dark Mode',
              subtitle: 'Easy on the eyes in low light',
              value: 'dark',
              isSelected: _themeMode == 'dark',
              onTap: () {
                setState(() => _themeMode = 'dark');
                _themeController.setThemeMode('dark');
              },
            ),
            const SizedBox(height: AppTheme.spacing12),
            
            _buildThemeOption(
              icon: CupertinoIcons.device_phone_portrait,
              title: 'System Default',
              subtitle: 'Automatically adjust based on system settings',
              value: 'system',
              isSelected: _themeMode == 'system',
              onTap: () {
                setState(() => _themeMode = 'system');
                _themeController.setThemeMode('system');
              },
            ),
            
            const SizedBox(height: AppTheme.spacing32),
            
            // Dark Mode Options (only shown if dark mode is selected)
            if (_themeMode == 'dark' || _themeMode == 'system') ...[
              _buildSectionHeader('Dark Mode Options'),
              const SizedBox(height: AppTheme.spacing16),
              
              _buildToggleItem(
                icon: CupertinoIcons.moon_stars,
                title: 'True Dark Mode',
                subtitle: 'Use pure black backgrounds for OLED screens',
                value: _trueDarkMode,
                onChanged: (value) => setState(() => _trueDarkMode = value),
              ),
              const SizedBox(height: AppTheme.spacing12),
              
              _buildToggleItem(
                icon: CupertinoIcons.brightness,
                title: 'Adaptive Brightness',
                subtitle: 'Automatically adjust based on ambient light',
                value: _adaptiveBrightness,
                onChanged: (value) => setState(() => _adaptiveBrightness = value),
              ),
              
              const SizedBox(height: AppTheme.spacing32),
            ],
            
            // Brightness Control
            _buildSectionHeader('Display Brightness'),
            const SizedBox(height: AppTheme.spacing16),
            
            Container(
              padding: const EdgeInsets.all(AppTheme.spacing20),
              decoration: BoxDecoration(
                color: AppColors.iosSystemGrey6,
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Icon(
                        CupertinoIcons.sun_min,
                        color: AppColors.textSecondary,
                      ),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacing16),
                          child: CupertinoSlider(
                            value: _brightness,
                            onChanged: _adaptiveBrightness ? null : (value) {
                              setState(() => _brightness = value);
                            },
                            activeColor: AppColors.primary600,
                          ),
                        ),
                      ),
                      Icon(
                        CupertinoIcons.sun_max,
                        color: AppColors.textSecondary,
                      ),
                    ],
                  ),
                  const SizedBox(height: AppTheme.spacing12),
                  Text(
                    _adaptiveBrightness
                        ? 'Adaptive brightness is enabled'
                        : '${(_brightness * 100).round()}%',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: AppTheme.spacing32),
            
            // Additional Settings
            _buildSectionHeader('Additional Settings'),
            const SizedBox(height: AppTheme.spacing16),
            
            _buildInfoCard(
              icon: CupertinoIcons.info_circle,
              title: 'Battery Saver',
              description: 'Dark mode can help extend battery life on devices with OLED screens.',
            ),
            const SizedBox(height: AppTheme.spacing12),
            
            _buildInfoCard(
              icon: CupertinoIcons.eye,
              title: 'Eye Comfort',
              description: 'Reduce eye strain in low-light environments with dark mode.',
            ),
            
            const SizedBox(height: AppTheme.spacing32),
            
            // Preview Section
            _buildSectionHeader('Preview'),
            const SizedBox(height: AppTheme.spacing16),
            
            Container(
              padding: const EdgeInsets.all(AppTheme.spacing20),
              decoration: BoxDecoration(
                color: _getPreviewBackgroundColor(),
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                border: Border.all(
                  color: AppColors.iosSystemGrey4,
                  width: 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Job Listing Example',
                    style: AppTypography.headlineMedium.copyWith(
                      fontWeight: FontWeight.bold,
                      color: _getPreviewTextColor(),
                    ),
                  ),
                  const SizedBox(height: AppTheme.spacing12),
                  Text(
                    'This is how the app will look with your selected theme.',
                    style: AppTypography.bodyMedium.copyWith(
                      color: _getPreviewSecondaryTextColor(),
                    ),
                  ),
                  const SizedBox(height: AppTheme.spacing16),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppTheme.spacing16,
                      vertical: AppTheme.spacing8,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primary600,
                      borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                    ),
                    child: const Text(
                      'Apply Now',
                      style: TextStyle(
                        color: CupertinoColors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: AppTypography.headlineSmall.copyWith(
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildThemeOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required String value,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary600.withValues(alpha: 0.1) : AppColors.iosSystemGrey6,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          border: Border.all(
            color: isSelected ? AppColors.primary600 : CupertinoColors.transparent,
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary600 : AppColors.iosSystemGrey4,
                borderRadius: BorderRadius.circular(AppTheme.radiusSm),
              ),
              child: Icon(
                icon,
                color: CupertinoColors.white,
                size: 28,
              ),
            ),
            const SizedBox(width: AppTheme.spacing16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTypography.bodyLarge.copyWith(
                      fontWeight: FontWeight.w600,
                      color: isSelected ? AppColors.primary600 : AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: AppTheme.spacing4),
                  Text(
                    subtitle,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              Icon(
                CupertinoIcons.checkmark_circle_fill,
                color: AppColors.primary600,
                size: 28,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildToggleItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.spacing16),
      decoration: BoxDecoration(
        color: AppColors.iosSystemGrey6,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.primary600.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(AppTheme.radiusSm),
            ),
            child: Icon(
              icon,
              color: AppColors.primary600,
              size: 24,
            ),
          ),
          const SizedBox(width: AppTheme.spacing16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTypography.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppTheme.spacing4),
                Text(
                  subtitle,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          CupertinoSwitch(
            value: value,
            onChanged: onChanged,
            activeTrackColor: AppColors.primary600,
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required String description,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.spacing16),
      decoration: BoxDecoration(
        color: AppColors.iosSystemGrey6,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            icon,
            color: AppColors.primary600,
            size: 24,
          ),
          const SizedBox(width: AppTheme.spacing16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTypography.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppTheme.spacing4),
                Text(
                  description,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getPreviewBackgroundColor() {
    if (_themeMode == 'light') {
      return CupertinoColors.white;
    } else if (_themeMode == 'dark') {
      return _trueDarkMode ? CupertinoColors.black : const Color(0xFF1C1C1E);
    }
    // System mode - use current brightness
    return CupertinoColors.systemBackground;
  }

  Color _getPreviewTextColor() {
    if (_themeMode == 'light') {
      return CupertinoColors.black;
    } else if (_themeMode == 'dark') {
      return CupertinoColors.white;
    }
    return AppColors.textPrimary;
  }

  Color _getPreviewSecondaryTextColor() {
    if (_themeMode == 'light') {
      return CupertinoColors.systemGrey;
    } else if (_themeMode == 'dark') {
      return CupertinoColors.systemGrey2;
    }
    return AppColors.textSecondary;
  }
}
