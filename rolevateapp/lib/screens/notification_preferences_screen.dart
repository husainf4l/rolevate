import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';

class NotificationPreferencesScreen extends StatefulWidget {
  const NotificationPreferencesScreen({super.key});

  @override
  State<NotificationPreferencesScreen> createState() => _NotificationPreferencesScreenState();
}

class _NotificationPreferencesScreenState extends State<NotificationPreferencesScreen> {
  // Job Notifications
  bool _newJobMatches = true;
  bool _jobRecommendations = true;
  bool _savedJobUpdates = true;
  
  // Application Notifications
  bool _applicationStatus = true;
  bool _interviewInvites = true;
  bool _applicationReminders = true;
  
  // Communication Notifications
  bool _employerMessages = true;
  bool _chatMessages = true;
  
  // Marketing & Updates
  bool _promotions = false;
  bool _newsletter = true;
  bool _tips = true;
  
  // Notification Channels
  bool _pushNotifications = true;
  bool _emailNotifications = true;
  bool _smsNotifications = false;

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: const Text('Notification Preferences'),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => Get.back(),
          child: const Icon(CupertinoIcons.back),
        ),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: _savePreferences,
          child: const Text('Save'),
        ),
      ),
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(AppTheme.spacing20),
          children: [
            // Job Notifications
            _buildSectionHeader('Job Notifications'),
            const SizedBox(height: AppTheme.spacing16),
            
            _buildToggleItem(
              icon: CupertinoIcons.briefcase,
              title: 'New Job Matches',
              subtitle: 'Notify when jobs match your profile',
              value: _newJobMatches,
              onChanged: (value) => setState(() => _newJobMatches = value),
            ),
            const SizedBox(height: AppTheme.spacing12),
            
            _buildToggleItem(
              icon: CupertinoIcons.star,
              title: 'Job Recommendations',
              subtitle: 'Personalized job suggestions',
              value: _jobRecommendations,
              onChanged: (value) => setState(() => _jobRecommendations = value),
            ),
            const SizedBox(height: AppTheme.spacing12),
            
            _buildToggleItem(
              icon: CupertinoIcons.bookmark,
              title: 'Saved Job Updates',
              subtitle: 'Changes to saved jobs',
              value: _savedJobUpdates,
              onChanged: (value) => setState(() => _savedJobUpdates = value),
            ),
            
            const SizedBox(height: AppTheme.spacing32),
            
            // Application Notifications
            _buildSectionHeader('Application Notifications'),
            const SizedBox(height: AppTheme.spacing16),
            
            _buildToggleItem(
              icon: CupertinoIcons.doc_text,
              title: 'Application Status',
              subtitle: 'Updates on your applications',
              value: _applicationStatus,
              onChanged: (value) => setState(() => _applicationStatus = value),
            ),
            const SizedBox(height: AppTheme.spacing12),
            
            _buildToggleItem(
              icon: CupertinoIcons.person_2,
              title: 'Interview Invites',
              subtitle: 'Notifications for interview requests',
              value: _interviewInvites,
              onChanged: (value) => setState(() => _interviewInvites = value),
            ),
            const SizedBox(height: AppTheme.spacing12),
            
            _buildToggleItem(
              icon: CupertinoIcons.clock,
              title: 'Application Reminders',
              subtitle: 'Reminders to complete applications',
              value: _applicationReminders,
              onChanged: (value) => setState(() => _applicationReminders = value),
            ),
            
            const SizedBox(height: AppTheme.spacing32),
            
            // Communication
            _buildSectionHeader('Communication'),
            const SizedBox(height: AppTheme.spacing16),
            
            _buildToggleItem(
              icon: CupertinoIcons.envelope,
              title: 'Employer Messages',
              subtitle: 'Direct messages from employers',
              value: _employerMessages,
              onChanged: (value) => setState(() => _employerMessages = value),
            ),
            const SizedBox(height: AppTheme.spacing12),
            
            _buildToggleItem(
              icon: CupertinoIcons.chat_bubble_2,
              title: 'Chat Messages',
              subtitle: 'Messages in conversations',
              value: _chatMessages,
              onChanged: (value) => setState(() => _chatMessages = value),
            ),
            
            const SizedBox(height: AppTheme.spacing32),
            
            // Marketing & Updates
            _buildSectionHeader('Marketing & Updates'),
            const SizedBox(height: AppTheme.spacing16),
            
            _buildToggleItem(
              icon: CupertinoIcons.tag,
              title: 'Promotions',
              subtitle: 'Special offers and promotions',
              value: _promotions,
              onChanged: (value) => setState(() => _promotions = value),
            ),
            const SizedBox(height: AppTheme.spacing12),
            
            _buildToggleItem(
              icon: CupertinoIcons.news,
              title: 'Newsletter',
              subtitle: 'Weekly job market insights',
              value: _newsletter,
              onChanged: (value) => setState(() => _newsletter = value),
            ),
            const SizedBox(height: AppTheme.spacing12),
            
            _buildToggleItem(
              icon: CupertinoIcons.lightbulb,
              title: 'Tips & Tricks',
              subtitle: 'Career advice and tips',
              value: _tips,
              onChanged: (value) => setState(() => _tips = value),
            ),
            
            const SizedBox(height: AppTheme.spacing32),
            
            // Notification Channels
            _buildSectionHeader('Notification Channels'),
            const SizedBox(height: AppTheme.spacing16),
            
            _buildToggleItem(
              icon: CupertinoIcons.bell,
              title: 'Push Notifications',
              subtitle: 'Receive notifications on this device',
              value: _pushNotifications,
              onChanged: (value) => setState(() => _pushNotifications = value),
            ),
            const SizedBox(height: AppTheme.spacing12),
            
            _buildToggleItem(
              icon: CupertinoIcons.mail,
              title: 'Email Notifications',
              subtitle: 'Receive notifications via email',
              value: _emailNotifications,
              onChanged: (value) => setState(() => _emailNotifications = value),
            ),
            const SizedBox(height: AppTheme.spacing12),
            
            _buildToggleItem(
              icon: CupertinoIcons.chat_bubble_text,
              title: 'SMS Notifications',
              subtitle: 'Receive notifications via text',
              value: _smsNotifications,
              onChanged: (value) => setState(() => _smsNotifications = value),
            ),
            
            const SizedBox(height: AppTheme.spacing32),
            
            // Quick Actions
            Row(
              children: [
                Expanded(
                  child: CupertinoButton(
                    color: AppColors.iosSystemGrey5,
                    onPressed: _disableAll,
                    child: Text(
                      'Disable All',
                      style: TextStyle(color: AppColors.textPrimary),
                    ),
                  ),
                ),
                const SizedBox(width: AppTheme.spacing12),
                Expanded(
                  child: CupertinoButton(
                    color: AppColors.primary600,
                    onPressed: _enableAll,
                    child: const Text('Enable All'),
                  ),
                ),
              ],
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

  void _savePreferences() {
    Get.snackbar(
      'Success',
      'Notification preferences saved',
      snackPosition: SnackPosition.BOTTOM,
    );
    Get.back();
  }

  void _disableAll() {
    setState(() {
      _newJobMatches = false;
      _jobRecommendations = false;
      _savedJobUpdates = false;
      _applicationStatus = false;
      _interviewInvites = false;
      _applicationReminders = false;
      _employerMessages = false;
      _chatMessages = false;
      _promotions = false;
      _newsletter = false;
      _tips = false;
      _pushNotifications = false;
      _emailNotifications = false;
      _smsNotifications = false;
    });
  }

  void _enableAll() {
    setState(() {
      _newJobMatches = true;
      _jobRecommendations = true;
      _savedJobUpdates = true;
      _applicationStatus = true;
      _interviewInvites = true;
      _applicationReminders = true;
      _employerMessages = true;
      _chatMessages = true;
      _promotions = true;
      _newsletter = true;
      _tips = true;
      _pushNotifications = true;
      _emailNotifications = true;
      _smsNotifications = true;
    });
  }
}
