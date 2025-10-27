import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/services/graphql_service.dart';
import 'package:url_launcher/url_launcher.dart';

class AboutScreen extends StatefulWidget {
  const AboutScreen({super.key});

  @override
  State<AboutScreen> createState() => _AboutScreenState();
}

class _AboutScreenState extends State<AboutScreen> {
  Map<String, dynamic>? _aboutData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchAboutInfo();
  }

  Future<void> _fetchAboutInfo() async {
    setState(() {
      _isLoading = true;
    });

    try {
      const String query = '''
        query GetAboutInfo {
          aboutInfo {
            appName
            appVersion
            description
            companyName
            website
            email
            phone
            address
            termsUrl
            privacyUrl
            socialLinks {
              facebook
              twitter
              linkedin
              instagram
            }
          }
        }
      ''';

      final result = await GraphQLService.client.query(
        QueryOptions(
          document: gql(query),
          fetchPolicy: FetchPolicy.networkOnly,
        ),
      );

      if (result.hasException) {
        throw Exception(result.exception.toString());
      }

      setState(() {
        _aboutData = result.data?['aboutInfo'] ?? _getDefaultAboutData();
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('❌ Error fetching about info: $e');
      setState(() {
        _aboutData = _getDefaultAboutData();
        _isLoading = false;
      });
    }
  }

  Map<String, dynamic> _getDefaultAboutData() {
    return {
      'appName': 'Rolevate',
      'appVersion': '1.0.0',
      'description': 'Rolevate is a comprehensive job matching platform that connects talented candidates with leading companies. Our AI-powered system ensures the best matches for both employers and job seekers.',
      'companyName': 'Rolevate Inc.',
      'website': 'https://rolevate.com',
      'email': 'support@rolevate.com',
      'phone': '+962 6 123 4567',
      'address': 'Amman, Jordan',
      'termsUrl': 'https://rolevate.com/terms',
      'privacyUrl': 'https://rolevate.com/privacy',
      'socialLinks': {
        'facebook': 'https://facebook.com/rolevate',
        'twitter': 'https://twitter.com/rolevate',
        'linkedin': 'https://linkedin.com/company/rolevate',
        'instagram': 'https://instagram.com/rolevate',
      },
    };
  }

  Future<void> _launchUrl(String urlString) async {
    try {
      final url = Uri.parse(urlString);
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      } else {
        Get.snackbar(
          'Error',
          'Could not open link',
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Invalid URL',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: const Text('About'),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          child: const Icon(CupertinoIcons.back),
          onPressed: () => Get.back(),
        ),
      ),
      child: SafeArea(
        child: _isLoading
            ? const Center(child: CupertinoActivityIndicator())
            : _aboutData == null
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          CupertinoIcons.exclamationmark_triangle,
                          size: 64,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(height: AppTheme.spacing16),
                        Text(
                          'Unable to load information',
                          style: AppTypography.bodyLarge.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: AppTheme.spacing16),
                        CupertinoButton(
                          onPressed: _fetchAboutInfo,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(AppTheme.spacing20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        // App Logo/Icon
                        Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            color: AppColors.primary600,
                            borderRadius: BorderRadius.circular(AppTheme.radiusXl),
                          ),
                          child: const Center(
                            child: Icon(
                              CupertinoIcons.briefcase_fill,
                              size: 50,
                              color: CupertinoColors.white,
                            ),
                          ),
                        ),
                        const SizedBox(height: AppTheme.spacing20),

                        // App Name & Version
                        Text(
                          _aboutData!['appName'] ?? 'Rolevate',
                          style: AppTypography.displayLarge.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: AppTheme.spacing8),
                        Text(
                          'Version ${_aboutData!['appVersion'] ?? '1.0.0'}',
                          style: AppTypography.bodyMedium.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: AppTheme.spacing32),

                        // Description
                        Text(
                          _aboutData!['description'] ?? '',
                          style: AppTypography.bodyLarge,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: AppTheme.spacing32),

                        // Company Info Section
                        _buildSectionTitle('Company Information'),
                        const SizedBox(height: AppTheme.spacing16),
                        _buildInfoRow(
                          CupertinoIcons.building_2_fill,
                          'Company',
                          _aboutData!['companyName'] ?? '',
                        ),
                        const SizedBox(height: AppTheme.spacing12),
                        _buildInfoRow(
                          CupertinoIcons.globe,
                          'Website',
                          _aboutData!['website'] ?? '',
                          onTap: () => _launchUrl(_aboutData!['website'] ?? ''),
                        ),
                        const SizedBox(height: AppTheme.spacing12),
                        _buildInfoRow(
                          CupertinoIcons.mail_solid,
                          'Email',
                          _aboutData!['email'] ?? '',
                          onTap: () => _launchUrl('mailto:${_aboutData!['email']}'),
                        ),
                        const SizedBox(height: AppTheme.spacing12),
                        _buildInfoRow(
                          CupertinoIcons.phone_fill,
                          'Phone',
                          _aboutData!['phone'] ?? '',
                          onTap: () => _launchUrl('tel:${_aboutData!['phone']}'),
                        ),
                        const SizedBox(height: AppTheme.spacing12),
                        _buildInfoRow(
                          CupertinoIcons.location_solid,
                          'Address',
                          _aboutData!['address'] ?? '',
                        ),
                        const SizedBox(height: AppTheme.spacing32),

                        // Social Media
                        if (_aboutData!['socialLinks'] != null) ...[
                          _buildSectionTitle('Follow Us'),
                          const SizedBox(height: AppTheme.spacing16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              if (_aboutData!['socialLinks']['facebook'] != null)
                                _buildSocialButton(
                                  CupertinoIcons.share,
                                  'Facebook',
                                  () => _launchUrl(_aboutData!['socialLinks']['facebook']),
                                ),
                              if (_aboutData!['socialLinks']['twitter'] != null)
                                _buildSocialButton(
                                  CupertinoIcons.share,
                                  'Twitter',
                                  () => _launchUrl(_aboutData!['socialLinks']['twitter']),
                                ),
                              if (_aboutData!['socialLinks']['linkedin'] != null)
                                _buildSocialButton(
                                  CupertinoIcons.share,
                                  'LinkedIn',
                                  () => _launchUrl(_aboutData!['socialLinks']['linkedin']),
                                ),
                              if (_aboutData!['socialLinks']['instagram'] != null)
                                _buildSocialButton(
                                  CupertinoIcons.share,
                                  'Instagram',
                                  () => _launchUrl(_aboutData!['socialLinks']['instagram']),
                                ),
                            ],
                          ),
                          const SizedBox(height: AppTheme.spacing32),
                        ],

                        // Legal Links
                        _buildSectionTitle('Legal'),
                        const SizedBox(height: AppTheme.spacing16),
                        _buildLinkButton(
                          'Terms of Service',
                          () => _launchUrl(_aboutData!['termsUrl'] ?? ''),
                        ),
                        const SizedBox(height: AppTheme.spacing8),
                        _buildLinkButton(
                          'Privacy Policy',
                          () => _launchUrl(_aboutData!['privacyUrl'] ?? ''),
                        ),
                        const SizedBox(height: AppTheme.spacing32),

                        // Copyright
                        Text(
                          '© ${DateTime.now().year} ${_aboutData!['companyName'] ?? 'Rolevate Inc.'}',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textTertiary,
                          ),
                        ),
                        const SizedBox(height: AppTheme.spacing8),
                        Text(
                          'All rights reserved',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
                  ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTypography.headlineMedium.copyWith(
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value, {VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        decoration: BoxDecoration(
          color: AppColors.iosSystemGrey6,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        ),
        child: Row(
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
                    label,
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: AppTheme.spacing4),
                  Text(
                    value,
                    style: AppTypography.bodyMedium.copyWith(
                      fontWeight: FontWeight.w600,
                      color: onTap != null ? AppColors.primary600 : AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
            if (onTap != null)
              Icon(
                CupertinoIcons.chevron_right,
                color: AppColors.textTertiary,
                size: 20,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSocialButton(IconData icon, String label, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacing8),
      child: Column(
        children: [
          CupertinoButton(
            padding: EdgeInsets.zero,
            onPressed: onTap,
            child: Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: AppColors.primary600,
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              ),
              child: Icon(
                icon,
                color: CupertinoColors.white,
                size: 28,
              ),
            ),
          ),
          const SizedBox(height: AppTheme.spacing4),
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

  Widget _buildLinkButton(String text, VoidCallback onTap) {
    return CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(
          vertical: AppTheme.spacing16,
          horizontal: AppTheme.spacing20,
        ),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.iosSystemGrey4),
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              text,
              style: AppTypography.bodyLarge.copyWith(
                color: AppColors.primary600,
                fontWeight: FontWeight.w600,
              ),
            ),
            Icon(
              CupertinoIcons.arrow_right,
              color: AppColors.primary600,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
