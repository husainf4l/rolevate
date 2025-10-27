import 'package:flutter/cupertino.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';

class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({super.key});

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    Get.snackbar(
      'Copied',
      '$label copied to clipboard',
      snackPosition: SnackPosition.BOTTOM,
      duration: const Duration(seconds: 2),
    );
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: const Text('Help & Support'),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          child: const Icon(CupertinoIcons.back),
          onPressed: () => Get.back(),
        ),
      ),
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(AppTheme.spacing16),
          children: [
            // Header
            const Text(
              'How can we help you?',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppTheme.spacing8),
            const Text(
              'Get in touch with our support team or find answers to common questions.',
              style: TextStyle(
                fontSize: 16,
                color: CupertinoColors.systemGrey,
              ),
            ),
            
            const SizedBox(height: AppTheme.spacing32),

            // Contact Methods
            _buildSectionTitle('Contact Us'),
            const SizedBox(height: AppTheme.spacing16),
            
            _buildContactCard(
              icon: CupertinoIcons.mail_solid,
              title: 'Email Support',
              subtitle: 'support@rolevate.com',
              onTap: () => _copyToClipboard('support@rolevate.com', 'Email'),
            ),
            
            const SizedBox(height: AppTheme.spacing12),
            
            _buildContactCard(
              icon: CupertinoIcons.phone_fill,
              title: 'Phone Support',
              subtitle: '+971 50 123 4567',
              onTap: () => _copyToClipboard('+971 50 123 4567', 'Phone number'),
            ),
            
            const SizedBox(height: AppTheme.spacing12),
            
            _buildContactCard(
              icon: CupertinoIcons.globe,
              title: 'Visit Website',
              subtitle: 'www.rolevate.com',
              onTap: () => _copyToClipboard('https://rolevate.com', 'Website'),
            ),

            const SizedBox(height: AppTheme.spacing32),

            // FAQs
            _buildSectionTitle('Frequently Asked Questions'),
            const SizedBox(height: AppTheme.spacing16),
            
            _buildFAQCard(
              question: 'How do I apply for a job?',
              answer: 'Browse available jobs, select a position you\'re interested in, and click the "Apply Now" button. Fill in your details and submit your application.',
            ),
            
            const SizedBox(height: AppTheme.spacing12),
            
            _buildFAQCard(
              question: 'How can I track my applications?',
              answer: 'Go to "My Applications" from the menu to see all your submitted applications and their current status.',
            ),
            
            const SizedBox(height: AppTheme.spacing12),
            
            _buildFAQCard(
              question: 'Can I edit my profile?',
              answer: 'Yes! Go to Profile > Edit Profile to update your personal information, photo, and other details.',
            ),
            
            const SizedBox(height: AppTheme.spacing12),
            
            _buildFAQCard(
              question: 'How do I save jobs for later?',
              answer: 'Click the bookmark icon on any job listing to save it. Access your saved jobs from the menu.',
            ),

            const SizedBox(height: AppTheme.spacing32),

            // Business Support
            _buildSectionTitle('For Business Accounts'),
            const SizedBox(height: AppTheme.spacing16),
            
            const Text(
              'If you\'re a business looking to post jobs or manage applications, please contact our business support team for dedicated assistance.',
              style: TextStyle(
                fontSize: 15,
                color: CupertinoColors.systemGrey,
              ),
            ),

            const SizedBox(height: AppTheme.spacing32),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildContactCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        decoration: BoxDecoration(
          color: CupertinoColors.systemBackground,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: CupertinoColors.systemGrey5,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: CupertinoColors.activeBlue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                icon,
                color: CupertinoColors.activeBlue,
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
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 15,
                      color: CupertinoColors.systemGrey,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              CupertinoIcons.chevron_right,
              color: CupertinoColors.systemGrey3,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFAQCard({
    required String question,
    required String answer,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.spacing16),
      decoration: BoxDecoration(
        color: CupertinoColors.systemBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: CupertinoColors.systemGrey5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(
                CupertinoIcons.question_circle_fill,
                color: CupertinoColors.activeBlue,
                size: 20,
              ),
              const SizedBox(width: AppTheme.spacing8),
              Expanded(
                child: Text(
                  question,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppTheme.spacing8),
          Padding(
            padding: const EdgeInsets.only(left: 28),
            child: Text(
              answer,
              style: const TextStyle(
                fontSize: 15,
                color: CupertinoColors.systemGrey,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
