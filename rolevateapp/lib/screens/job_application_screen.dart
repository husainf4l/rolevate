import 'dart:io';
import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:file_picker/file_picker.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/controllers/job_controller.dart';
import 'package:rolevateapp/services/application_service.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';

class JobApplicationScreen extends StatefulWidget {
  final String jobId;
  final String jobTitle;
  final String companyName;

  const JobApplicationScreen({
    super.key,
    required this.jobId,
    required this.jobTitle,
    required this.companyName,
  });

  @override
  State<JobApplicationScreen> createState() => _JobApplicationScreenState();
}

class _JobApplicationScreenState extends State<JobApplicationScreen> {
  final AuthController authController = Get.find<AuthController>();
  final JobController jobController = Get.find<JobController>();
  final ApplicationService _applicationService = ApplicationService();

  // Form controllers
  final TextEditingController _fullNameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _linkedinController = TextEditingController();
  final TextEditingController _portfolioController = TextEditingController();
  final TextEditingController _coverLetterController = TextEditingController();
  final TextEditingController _noticePeriodController = TextEditingController();

  // Form state
  File? _selectedResume;
  bool _isSubmitting = false;
  bool _isGuestApplication = false;
  String _selectedCountryCode = '+962'; // Default to Jordan

  // All country codes sorted alphabetically
  final List<Map<String, String>> _countryCodes = [
    {'code': '+93', 'country': 'Afghanistan', 'flag': '🇦🇫'},
    {'code': '+355', 'country': 'Albania', 'flag': '🇦🇱'},
    {'code': '+213', 'country': 'Algeria', 'flag': '🇩🇿'},
    {'code': '+1', 'country': 'American Samoa', 'flag': '🇦🇸'},
    {'code': '+376', 'country': 'Andorra', 'flag': '🇦🇩'},
    {'code': '+244', 'country': 'Angola', 'flag': '🇦🇴'},
    {'code': '+1', 'country': 'Antigua and Barbuda', 'flag': '🇦🇬'},
    {'code': '+54', 'country': 'Argentina', 'flag': '🇦🇷'},
    {'code': '+374', 'country': 'Armenia', 'flag': '🇦🇲'},
    {'code': '+297', 'country': 'Aruba', 'flag': '🇦🇼'},
    {'code': '+61', 'country': 'Australia', 'flag': '🇦🇺'},
    {'code': '+43', 'country': 'Austria', 'flag': '🇦🇹'},
    {'code': '+994', 'country': 'Azerbaijan', 'flag': '🇦🇿'},
    {'code': '+1', 'country': 'Bahamas', 'flag': '🇧🇸'},
    {'code': '+973', 'country': 'Bahrain', 'flag': '🇧🇭'},
    {'code': '+880', 'country': 'Bangladesh', 'flag': '🇧🇩'},
    {'code': '+1', 'country': 'Barbados', 'flag': '🇧🇧'},
    {'code': '+375', 'country': 'Belarus', 'flag': '🇧🇾'},
    {'code': '+32', 'country': 'Belgium', 'flag': '🇧🇪'},
    {'code': '+501', 'country': 'Belize', 'flag': '🇧🇿'},
    {'code': '+229', 'country': 'Benin', 'flag': '🇧🇯'},
    {'code': '+1', 'country': 'Bermuda', 'flag': '🇧🇲'},
    {'code': '+975', 'country': 'Bhutan', 'flag': '🇧🇹'},
    {'code': '+591', 'country': 'Bolivia', 'flag': '🇧🇴'},
    {'code': '+387', 'country': 'Bosnia and Herzegovina', 'flag': '🇧🇦'},
    {'code': '+267', 'country': 'Botswana', 'flag': '🇧🇼'},
    {'code': '+55', 'country': 'Brazil', 'flag': '🇧🇷'},
    {'code': '+673', 'country': 'Brunei', 'flag': '🇧🇳'},
    {'code': '+359', 'country': 'Bulgaria', 'flag': '🇧🇬'},
    {'code': '+226', 'country': 'Burkina Faso', 'flag': '🇧🇫'},
    {'code': '+257', 'country': 'Burundi', 'flag': '🇧🇮'},
    {'code': '+855', 'country': 'Cambodia', 'flag': '🇰🇭'},
    {'code': '+237', 'country': 'Cameroon', 'flag': '🇨🇲'},
    {'code': '+1', 'country': 'Canada', 'flag': '🇨🇦'},
    {'code': '+238', 'country': 'Cape Verde', 'flag': '🇨🇻'},
    {'code': '+1', 'country': 'Cayman Islands', 'flag': '🇰🇾'},
    {'code': '+236', 'country': 'Central African Republic', 'flag': '🇨🇫'},
    {'code': '+235', 'country': 'Chad', 'flag': '🇹🇩'},
    {'code': '+56', 'country': 'Chile', 'flag': '🇨🇱'},
    {'code': '+86', 'country': 'China', 'flag': '🇨🇳'},
    {'code': '+57', 'country': 'Colombia', 'flag': '🇨🇴'},
    {'code': '+269', 'country': 'Comoros', 'flag': '🇰🇲'},
    {'code': '+242', 'country': 'Congo', 'flag': '🇨🇬'},
    {'code': '+243', 'country': 'Congo (DRC)', 'flag': '🇨🇩'},
    {'code': '+682', 'country': 'Cook Islands', 'flag': '🇨🇰'},
    {'code': '+506', 'country': 'Costa Rica', 'flag': '🇨🇷'},
    {'code': '+225', 'country': 'Côte d\'Ivoire', 'flag': '🇨🇮'},
    {'code': '+385', 'country': 'Croatia', 'flag': '🇭🇷'},
    {'code': '+53', 'country': 'Cuba', 'flag': '🇨🇺'},
    {'code': '+357', 'country': 'Cyprus', 'flag': '🇨🇾'},
    {'code': '+420', 'country': 'Czech Republic', 'flag': '🇨🇿'},
    {'code': '+45', 'country': 'Denmark', 'flag': '🇩🇰'},
    {'code': '+253', 'country': 'Djibouti', 'flag': '��🇯'},
    {'code': '+1', 'country': 'Dominica', 'flag': '�🇲'},
    {'code': '+1', 'country': 'Dominican Republic', 'flag': '🇩�🇴'},
    {'code': '+593', 'country': 'Ecuador', 'flag': '🇪🇨'},
    {'code': '+20', 'country': 'Egypt', 'flag': '🇪🇬'},
    {'code': '+503', 'country': 'El Salvador', 'flag': '🇸🇻'},
    {'code': '+240', 'country': 'Equatorial Guinea', 'flag': '🇬🇶'},
    {'code': '+291', 'country': 'Eritrea', 'flag': '🇪🇷'},
    {'code': '+372', 'country': 'Estonia', 'flag': '🇪🇪'},
    {'code': '+251', 'country': 'Ethiopia', 'flag': '🇪🇹'},
    {'code': '+500', 'country': 'Falkland Islands', 'flag': '🇫🇰'},
    {'code': '+298', 'country': 'Faroe Islands', 'flag': '🇫🇴'},
    {'code': '+679', 'country': 'Fiji', 'flag': '🇫🇯'},
    {'code': '+358', 'country': 'Finland', 'flag': '🇫�'},
    {'code': '+33', 'country': 'France', 'flag': '🇫🇷'},
    {'code': '+594', 'country': 'French Guiana', 'flag': '🇬🇫'},
    {'code': '+689', 'country': 'French Polynesia', 'flag': '🇵🇫'},
    {'code': '+241', 'country': 'Gabon', 'flag': '🇬�🇦'},
    {'code': '+220', 'country': 'Gambia', 'flag': '🇬🇲'},
    {'code': '+995', 'country': 'Georgia', 'flag': '🇬🇪'},
    {'code': '+49', 'country': 'Germany', 'flag': '🇩🇪'},
    {'code': '+233', 'country': 'Ghana', 'flag': '🇬🇭'},
    {'code': '+350', 'country': 'Gibraltar', 'flag': '🇬🇮'},
    {'code': '+30', 'country': 'Greece', 'flag': '🇬🇷'},
    {'code': '+299', 'country': 'Greenland', 'flag': '🇬🇱'},
    {'code': '+1', 'country': 'Grenada', 'flag': '🇬🇩'},
    {'code': '+590', 'country': 'Guadeloupe', 'flag': '🇬🇵'},
    {'code': '+1', 'country': 'Guam', 'flag': '🇬🇺'},
    {'code': '+502', 'country': 'Guatemala', 'flag': '🇬🇹'},
    {'code': '+224', 'country': 'Guinea', 'flag': '🇬🇳'},
    {'code': '+245', 'country': 'Guinea-Bissau', 'flag': '🇬🇼'},
    {'code': '+592', 'country': 'Guyana', 'flag': '🇬🇾'},
    {'code': '+509', 'country': 'Haiti', 'flag': '🇭🇹'},
    {'code': '+504', 'country': 'Honduras', 'flag': '🇭🇳'},
    {'code': '+852', 'country': 'Hong Kong', 'flag': '🇭🇰'},
    {'code': '+36', 'country': 'Hungary', 'flag': '🇭🇺'},
    {'code': '+354', 'country': 'Iceland', 'flag': '🇮🇸'},
    {'code': '+91', 'country': 'India', 'flag': '🇮🇳'},
    {'code': '+62', 'country': 'Indonesia', 'flag': '🇮🇩'},
    {'code': '+98', 'country': 'Iran', 'flag': '🇮🇷'},
    {'code': '+964', 'country': 'Iraq', 'flag': '🇮🇶'},
    {'code': '+353', 'country': 'Ireland', 'flag': '🇮🇪'},
    {'code': '+972', 'country': 'Israel', 'flag': '🇮🇱'},
    {'code': '+39', 'country': 'Italy', 'flag': '🇮🇹'},
    {'code': '+1', 'country': 'Jamaica', 'flag': '🇯🇲'},
    {'code': '+81', 'country': 'Japan', 'flag': '🇯🇵'},
    {'code': '+962', 'country': 'Jordan', 'flag': '🇯🇴'},
    {'code': '+7', 'country': 'Kazakhstan', 'flag': '🇰🇿'},
    {'code': '+254', 'country': 'Kenya', 'flag': '🇰🇪'},
    {'code': '+686', 'country': 'Kiribati', 'flag': '🇰🇮'},
    {'code': '+383', 'country': 'Kosovo', 'flag': '��'},
    {'code': '+965', 'country': 'Kuwait', 'flag': '🇰🇼'},
    {'code': '+996', 'country': 'Kyrgyzstan', 'flag': '🇰🇬'},
    {'code': '+856', 'country': 'Laos', 'flag': '🇱🇦'},
    {'code': '+371', 'country': 'Latvia', 'flag': '🇱🇻'},
    {'code': '+961', 'country': 'Lebanon', 'flag': '🇱🇧'},
    {'code': '+266', 'country': 'Lesotho', 'flag': '🇱🇸'},
    {'code': '+231', 'country': 'Liberia', 'flag': '🇱🇷'},
    {'code': '+218', 'country': 'Libya', 'flag': '🇱🇾'},
    {'code': '+423', 'country': 'Liechtenstein', 'flag': '🇱🇮'},
    {'code': '+370', 'country': 'Lithuania', 'flag': '🇱🇹'},
    {'code': '+352', 'country': 'Luxembourg', 'flag': '🇱🇺'},
    {'code': '+853', 'country': 'Macao', 'flag': '🇲🇴'},
    {'code': '+389', 'country': 'Macedonia', 'flag': '🇲🇰'},
    {'code': '+261', 'country': 'Madagascar', 'flag': '🇲🇬'},
    {'code': '+265', 'country': 'Malawi', 'flag': '🇲🇼'},
    {'code': '+60', 'country': 'Malaysia', 'flag': '🇲🇾'},
    {'code': '+960', 'country': 'Maldives', 'flag': '🇲🇻'},
    {'code': '+223', 'country': 'Mali', 'flag': '🇲🇱'},
    {'code': '+356', 'country': 'Malta', 'flag': '🇲🇹'},
    {'code': '+692', 'country': 'Marshall Islands', 'flag': '🇲🇭'},
    {'code': '+596', 'country': 'Martinique', 'flag': '��🇶'},
    {'code': '+222', 'country': 'Mauritania', 'flag': '🇲🇷'},
    {'code': '+230', 'country': 'Mauritius', 'flag': '🇲�'},
    {'code': '+262', 'country': 'Mayotte', 'flag': '🇾🇹'},
    {'code': '+52', 'country': 'Mexico', 'flag': '🇲🇽'},
    {'code': '+691', 'country': 'Micronesia', 'flag': '🇫🇲'},
    {'code': '+373', 'country': 'Moldova', 'flag': '🇲🇩'},
    {'code': '+377', 'country': 'Monaco', 'flag': '🇲🇨'},
    {'code': '+976', 'country': 'Mongolia', 'flag': '🇲🇳'},
    {'code': '+382', 'country': 'Montenegro', 'flag': '🇲🇪'},
    {'code': '+1', 'country': 'Montserrat', 'flag': '🇲🇸'},
    {'code': '+212', 'country': 'Morocco', 'flag': '🇲�🇦'},
    {'code': '+258', 'country': 'Mozambique', 'flag': '🇲🇿'},
    {'code': '+95', 'country': 'Myanmar', 'flag': '🇲🇲'},
    {'code': '+264', 'country': 'Namibia', 'flag': '🇳🇦'},
    {'code': '+674', 'country': 'Nauru', 'flag': '🇳🇷'},
    {'code': '+977', 'country': 'Nepal', 'flag': '🇳🇵'},
    {'code': '+31', 'country': 'Netherlands', 'flag': '🇳🇱'},
    {'code': '+687', 'country': 'New Caledonia', 'flag': '🇳🇨'},
    {'code': '+64', 'country': 'New Zealand', 'flag': '��'},
    {'code': '+505', 'country': 'Nicaragua', 'flag': '🇳🇮'},
    {'code': '+227', 'country': 'Niger', 'flag': '🇳🇪'},
    {'code': '+234', 'country': 'Nigeria', 'flag': '🇳🇬'},
    {'code': '+683', 'country': 'Niue', 'flag': '🇳🇺'},
    {'code': '+850', 'country': 'North Korea', 'flag': '🇰🇵'},
    {'code': '+47', 'country': 'Norway', 'flag': '🇳🇴'},
    {'code': '+968', 'country': 'Oman', 'flag': '🇴🇲'},
    {'code': '+92', 'country': 'Pakistan', 'flag': '🇵🇰'},
    {'code': '+680', 'country': 'Palau', 'flag': '🇵🇼'},
    {'code': '+970', 'country': 'Palestine', 'flag': '🇵🇸'},
    {'code': '+507', 'country': 'Panama', 'flag': '🇵🇦'},
    {'code': '+675', 'country': 'Papua New Guinea', 'flag': '🇵🇬'},
    {'code': '+595', 'country': 'Paraguay', 'flag': '🇵🇾'},
    {'code': '+51', 'country': 'Peru', 'flag': '🇵🇪'},
    {'code': '+63', 'country': 'Philippines', 'flag': '🇵🇭'},
    {'code': '+48', 'country': 'Poland', 'flag': '🇵🇱'},
    {'code': '+351', 'country': 'Portugal', 'flag': '🇵🇹'},
    {'code': '+1', 'country': 'Puerto Rico', 'flag': '🇵�'},
    {'code': '+974', 'country': 'Qatar', 'flag': '🇶🇦'},
    {'code': '+262', 'country': 'Réunion', 'flag': '🇷🇪'},
    {'code': '+40', 'country': 'Romania', 'flag': '🇷🇴'},
    {'code': '+7', 'country': 'Russia', 'flag': '🇷🇺'},
    {'code': '+250', 'country': 'Rwanda', 'flag': '🇷🇼'},
    {'code': '+1', 'country': 'Saint Kitts and Nevis', 'flag': '🇰🇳'},
    {'code': '+1', 'country': 'Saint Lucia', 'flag': '🇱🇨'},
    {'code': '+1', 'country': 'Saint Vincent', 'flag': '🇻🇨'},
    {'code': '+685', 'country': 'Samoa', 'flag': '🇼🇸'},
    {'code': '+378', 'country': 'San Marino', 'flag': '🇸🇲'},
    {'code': '+239', 'country': 'São Tomé and Príncipe', 'flag': '🇸🇹'},
    {'code': '+966', 'country': 'Saudi Arabia', 'flag': '🇸🇦'},
    {'code': '+221', 'country': 'Senegal', 'flag': '🇸🇳'},
    {'code': '+381', 'country': 'Serbia', 'flag': '🇷�'},
    {'code': '+248', 'country': 'Seychelles', 'flag': '🇸🇨'},
    {'code': '+232', 'country': 'Sierra Leone', 'flag': '🇸�🇱'},
    {'code': '+65', 'country': 'Singapore', 'flag': '🇸�'},
    {'code': '+421', 'country': 'Slovakia', 'flag': '🇸🇰'},
    {'code': '+386', 'country': 'Slovenia', 'flag': '🇸🇮'},
    {'code': '+677', 'country': 'Solomon Islands', 'flag': '🇸�🇧'},
    {'code': '+252', 'country': 'Somalia', 'flag': '🇸🇴'},
    {'code': '+27', 'country': 'South Africa', 'flag': '🇿🇦'},
    {'code': '+82', 'country': 'South Korea', 'flag': '🇰🇷'},
    {'code': '+211', 'country': 'South Sudan', 'flag': '🇸🇸'},
    {'code': '+34', 'country': 'Spain', 'flag': '🇪🇸'},
    {'code': '+94', 'country': 'Sri Lanka', 'flag': '🇱🇰'},
    {'code': '+249', 'country': 'Sudan', 'flag': '🇸🇩'},
    {'code': '+597', 'country': 'Suriname', 'flag': '🇸🇷'},
    {'code': '+268', 'country': 'Swaziland', 'flag': '🇸🇿'},
    {'code': '+46', 'country': 'Sweden', 'flag': '🇸🇪'},
    {'code': '+41', 'country': 'Switzerland', 'flag': '🇨🇭'},
    {'code': '+963', 'country': 'Syria', 'flag': '🇸🇾'},
    {'code': '+886', 'country': 'Taiwan', 'flag': '🇹🇼'},
    {'code': '+992', 'country': 'Tajikistan', 'flag': '🇹🇯'},
    {'code': '+255', 'country': 'Tanzania', 'flag': '🇹🇿'},
    {'code': '+66', 'country': 'Thailand', 'flag': '🇹🇭'},
    {'code': '+228', 'country': 'Togo', 'flag': '🇹🇬'},
    {'code': '+690', 'country': 'Tokelau', 'flag': '🇹🇰'},
    {'code': '+676', 'country': 'Tonga', 'flag': '🇹🇴'},
    {'code': '+1', 'country': 'Trinidad and Tobago', 'flag': '🇹🇹'},
    {'code': '+216', 'country': 'Tunisia', 'flag': '🇹🇳'},
    {'code': '+90', 'country': 'Turkey', 'flag': '🇹🇷'},
    {'code': '+993', 'country': 'Turkmenistan', 'flag': '🇹🇲'},
    {'code': '+688', 'country': 'Tuvalu', 'flag': '🇹🇻'},
    {'code': '+256', 'country': 'Uganda', 'flag': '🇺🇬'},
    {'code': '+380', 'country': 'Ukraine', 'flag': '🇺🇦'},
    {'code': '+971', 'country': 'United Arab Emirates', 'flag': '🇦�'},
    {'code': '+44', 'country': 'United Kingdom', 'flag': '🇬🇧'},
    {'code': '+1', 'country': 'United States', 'flag': '🇺🇸'},
    {'code': '+598', 'country': 'Uruguay', 'flag': '🇺🇾'},
    {'code': '+998', 'country': 'Uzbekistan', 'flag': '🇺🇿'},
    {'code': '+678', 'country': 'Vanuatu', 'flag': '🇻🇺'},
    {'code': '+379', 'country': 'Vatican City', 'flag': '🇻🇦'},
    {'code': '+58', 'country': 'Venezuela', 'flag': '🇻🇪'},
    {'code': '+84', 'country': 'Vietnam', 'flag': '🇻🇳'},
    {'code': '+1', 'country': 'Virgin Islands (US)', 'flag': '��'},
    {'code': '+681', 'country': 'Wallis and Futuna', 'flag': '🇼🇫'},
    {'code': '+967', 'country': 'Yemen', 'flag': '🇾🇪'},
    {'code': '+260', 'country': 'Zambia', 'flag': '🇿🇲'},
    {'code': '+263', 'country': 'Zimbabwe', 'flag': '��'},
  ];

  @override
  void initState() {
    super.initState();
    // Pre-fill user information if logged in
    _prefillUserInfo();
  }

  void _prefillUserInfo() {
    final user = authController.user.value;
    if (user != null && authController.isAuthenticated.value) {
      _fullNameController.text = user['name'] ?? '';
      _emailController.text = user['email'] ?? '';
      _phoneController.text = user['phone'] ?? '';
    } else {
      _isGuestApplication = true;
    }
  }

  void _showCountryCodePicker() {
    showCupertinoModalPopup(
      context: context,
      builder: (BuildContext context) => Container(
        height: 300,
        decoration: BoxDecoration(
          color: CupertinoColors.systemBackground.resolveFrom(context),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(AppTheme.radiusLg)),
        ),
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(AppTheme.spacing16),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: AppColors.iosSystemGrey4,
                    width: 0.5,
                  ),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  CupertinoButton(
                    padding: EdgeInsets.zero,
                    child: Text(
                      'Cancel',
                      style: TextStyle(color: AppColors.primary600),
                    ),
                    onPressed: () => Navigator.pop(context),
                  ),
                  Text(
                    'Select Country Code',
                    style: AppTypography.headlineSmall.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(width: 60), // Balance the Cancel button
                ],
              ),
            ),
            // Country Code List
            Expanded(
              child: ListView.builder(
                itemCount: _countryCodes.length,
                itemBuilder: (context, index) {
                  final countryData = _countryCodes[index];
                  final isSelected = countryData['code'] == _selectedCountryCode;
                  
                  return CupertinoButton(
                    padding: EdgeInsets.zero,
                    onPressed: () {
                      setState(() {
                        _selectedCountryCode = countryData['code']!;
                      });
                      Navigator.pop(context);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppTheme.spacing20,
                        vertical: AppTheme.spacing16,
                      ),
                      decoration: BoxDecoration(
                        color: isSelected 
                            ? AppColors.primary50 
                            : CupertinoColors.systemBackground.resolveFrom(context),
                        border: Border(
                          bottom: BorderSide(
                            color: AppColors.iosSystemGrey5,
                            width: 0.5,
                          ),
                        ),
                      ),
                      child: Row(
                        children: [
                          Text(
                            countryData['flag']!,
                            style: const TextStyle(fontSize: 28),
                          ),
                          const SizedBox(width: AppTheme.spacing16),
                          Expanded(
                            child: Text(
                              countryData['country']!,
                              style: AppTypography.bodyLarge.copyWith(
                                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                                color: isSelected ? AppColors.primary600 : AppColors.textPrimary,
                              ),
                            ),
                          ),
                          Text(
                            countryData['code']!,
                            style: AppTypography.bodyLarge.copyWith(
                              fontWeight: FontWeight.w600,
                              color: isSelected ? AppColors.primary600 : AppColors.textSecondary,
                            ),
                          ),
                          if (isSelected) ...[
                            const SizedBox(width: AppTheme.spacing12),
                            Icon(
                              CupertinoIcons.check_mark,
                              color: AppColors.primary600,
                              size: 20,
                            ),
                          ],
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _linkedinController.dispose();
    _portfolioController.dispose();
    _coverLetterController.dispose();
    _noticePeriodController.dispose();
    super.dispose();
  }

  Future<void> _pickResume() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'doc', 'docx'],
        allowMultiple: false,
      );

      if (result != null) {
        setState(() {
          _selectedResume = File(result.files.single.path!);
        });
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to pick file. Please try again.',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  bool _validateForm() {
    if (_fullNameController.text.trim().isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Full name is required',
        snackPosition: SnackPosition.BOTTOM,
      );
      return false;
    }

    if (_emailController.text.trim().isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Email address is required',
        snackPosition: SnackPosition.BOTTOM,
      );
      return false;
    }

    if (_phoneController.text.trim().isEmpty) {
      Get.snackbar(
        'Validation Error',
        'Phone number is required',
        snackPosition: SnackPosition.BOTTOM,
      );
      return false;
    }

    // Validate phone number format - should be digits only (country code is separate)
    final phoneClean = _phoneController.text.trim()
        .replaceAll(' ', '')
        .replaceAll('-', '')
        .replaceAll('(', '')
        .replaceAll(')', '')
        .replaceAll('.', '')
        .replaceFirst(RegExp(r'^[\+0]+'), ''); // Remove + or leading 0
    
    if (phoneClean.isEmpty || phoneClean.length < 7) {
      Get.snackbar(
        'Validation Error',
        'Please enter a valid phone number (at least 7 digits)',
        snackPosition: SnackPosition.BOTTOM,
      );
      return false;
    }

    // Check if phone contains only digits
    if (!RegExp(r'^[0-9]+$').hasMatch(phoneClean)) {
      Get.snackbar(
        'Validation Error',
        'Phone number should contain only digits',
        snackPosition: SnackPosition.BOTTOM,
      );
      return false;
    }

    // Resume is now optional - user can apply without it
    // if (_selectedResume == null) {
    //   Get.snackbar(
    //     'Validation Error',
    //     'Resume/CV is required',
    //     snackPosition: SnackPosition.BOTTOM,
    //   );
    //   return false;
    // }

    return true;
  }

  Future<void> _submitApplication() async {
    if (!_validateForm()) return;

    // Check if user is authenticated - backend requires authentication
    if (_isGuestApplication || !authController.isAuthenticated.value) {
      _showLoginRequiredDialog();
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      // Upload resume to S3 first if selected
      String? resumeUrl;
      if (_selectedResume != null) {
        debugPrint('📤 Uploading resume to S3...');
        try {
          final filename = _selectedResume!.path.split('/').last;
          resumeUrl = await _applicationService.uploadCVToS3(
            filePath: _selectedResume!.path,
            filename: filename,
            candidateId: null, // Will be set by backend based on user
          );
          debugPrint('✅ Resume uploaded: $resumeUrl');
        } catch (uploadError) {
          debugPrint('❌ Resume upload failed: $uploadError');
          // Show warning but allow submission to continue
          Get.snackbar(
            'Upload Warning',
            'Resume upload failed. Your application will be submitted without a resume. You can update it later.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: CupertinoColors.systemYellow,
            colorText: CupertinoColors.white,
            duration: const Duration(seconds: 3),
          );
          // Continue without resume URL - set to null
          resumeUrl = null;
        }
      } else {
        debugPrint('📝 No resume selected - proceeding without resume');
      }

      debugPrint('📤 Submitting application for job: ${widget.jobId}');
      debugPrint('📝 Cover letter length: ${_coverLetterController.text.trim().length}');
      debugPrint('📄 Resume URL: ${resumeUrl ?? 'none'}');

      // Clean phone number - remove spaces, dashes, parentheses
      String? cleanPhone;
      if (_phoneController.text.trim().isNotEmpty) {
        // Get the phone number without country code
        String phoneNumber = _phoneController.text.trim()
            .replaceAll(' ', '')
            .replaceAll('-', '')
            .replaceAll('(', '')
            .replaceAll(')', '')
            .replaceAll('.', '');
        
        // Remove leading + or 0 if present (user might have added it)
        phoneNumber = phoneNumber.replaceFirst(RegExp(r'^[\+0]+'), '');
        
        // Combine selected country code with phone number
        cleanPhone = '$_selectedCountryCode$phoneNumber';
        
        debugPrint('📞 Selected country code: $_selectedCountryCode');
        debugPrint('📞 Original phone: ${_phoneController.text.trim()}');
        debugPrint('📞 Final phone: $cleanPhone');
      }

      await _applicationService.createApplication(
        jobId: widget.jobId,
        coverLetter: _coverLetterController.text.trim().isNotEmpty
            ? _coverLetterController.text.trim()
            : null,
        resumeUrl: resumeUrl,
        expectedSalary: null,
        noticePeriod: _noticePeriodController.text.trim().isNotEmpty
            ? _noticePeriodController.text.trim()
            : null,
        source: 'mobile_app',
        firstName: _isGuestApplication ? _fullNameController.text.trim() : null,
        lastName: null,
        email: _isGuestApplication ? _emailController.text.trim() : null,
        phone: cleanPhone,
        linkedin: _linkedinController.text.trim().isNotEmpty
            ? _linkedinController.text.trim()
            : null,
        portfolioUrl: _portfolioController.text.trim().isNotEmpty
            ? _portfolioController.text.trim()
            : null,
      );

      debugPrint('✅ Application submitted successfully');

      // Refresh applications in controller
      await jobController.fetchMyApplications();

      // Show success message and navigate back
      Get.back();
      Get.snackbar(
        'Application Submitted',
        'Your application has been submitted successfully!',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: CupertinoColors.systemGreen,
        colorText: CupertinoColors.white,
        duration: const Duration(seconds: 3),
      );
    } catch (e) {
      debugPrint('❌ Application submission failed: $e');
      
      // Parse error message for better user feedback
      String errorMessage = 'Failed to submit application. Please try again.';
      final errorStr = e.toString();
      
      if (errorStr.contains('network') || errorStr.contains('SocketException')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (errorStr.contains('authenticate') || errorStr.contains('token') || errorStr.contains('Unauthorized')) {
        _showLoginRequiredDialog();
        return;
      } else if (errorStr.contains('already applied')) {
        errorMessage = 'You have already applied for this job.';
      } else if (errorStr.contains('must be a valid URL')) {
        errorMessage = 'Resume upload error. Please try again without resume.';
      } else if (errorStr.contains('Forbidden') || errorStr.contains('403')) {
        _showLoginRequiredDialog();
        return;
      }
      
      Get.snackbar(
        'Application Failed',
        errorMessage,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: CupertinoColors.destructiveRed,
        colorText: CupertinoColors.white,
        duration: const Duration(seconds: 4),
      );
    } finally {
      setState(() {
        _isSubmitting = false;
      });
    }
  }

  void _showLoginRequiredDialog() {
    showCupertinoDialog(
      context: context,
      builder: (BuildContext context) => CupertinoAlertDialog(
        title: const Text('Login Required'),
        content: const Text(
          'You need to be logged in to submit a job application. Would you like to login or create an account now?',
        ),
        actions: <CupertinoDialogAction>[
          CupertinoDialogAction(
            child: const Text('Cancel'),
            onPressed: () {
              Navigator.pop(context);
            },
          ),
          CupertinoDialogAction(
            child: const Text('Create Account'),
            onPressed: () {
              Navigator.pop(context);
              Get.toNamed('/register');
            },
          ),
          CupertinoDialogAction(
            isDefaultAction: true,
            child: const Text('Login'),
            onPressed: () {
              Navigator.pop(context);
              Get.toNamed('/login');
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: const Text('Submit Your Application'),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          child: const Icon(CupertinoIcons.back),
          onPressed: () => Get.back(),
        ),
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppTheme.spacing20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Text(
                'Fill in the form below to apply for this position. All fields marked with * are required.',
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: AppTheme.spacing24),

              // Guest application notice
              if (_isGuestApplication)
                Container(
                  padding: const EdgeInsets.all(AppTheme.spacing16),
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                    border: Border.all(
                      color: AppColors.error.withValues(alpha: 0.3),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            CupertinoIcons.lock_fill,
                            color: AppColors.error,
                            size: 20,
                          ),
                          const SizedBox(width: AppTheme.spacing8),
                          Text(
                            'Login Required to Apply',
                            style: AppTypography.labelLarge.copyWith(
                              color: AppColors.error,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppTheme.spacing8),
                      Text(
                        'You must create an account or login to submit a job application. This helps us track your applications and notify you about updates.',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: AppTheme.spacing12),
                      Row(
                        children: [
                          Expanded(
                            child: CupertinoButton(
                              padding: const EdgeInsets.symmetric(vertical: AppTheme.spacing8),
                              color: AppColors.primary600,
                              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                              onPressed: () => Get.toNamed('/login'),
                              child: const Text(
                                'Login',
                                style: TextStyle(
                                  color: CupertinoColors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: AppTheme.spacing12),
                          Expanded(
                            child: CupertinoButton(
                              padding: const EdgeInsets.symmetric(vertical: AppTheme.spacing8),
                              color: AppColors.iosSystemGrey5,
                              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                              onPressed: () => Get.toNamed('/register'),
                              child: Text(
                                'Create Account',
                                style: TextStyle(
                                  color: AppColors.textPrimary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: AppTheme.spacing32),

              // Personal Information Section
              _buildSectionHeader('Personal Information'),
              const SizedBox(height: AppTheme.spacing16),

              // Full Name
              _buildTextField(
                controller: _fullNameController,
                label: 'Full Name *',
                placeholder: 'John Doe',
                keyboardType: TextInputType.name,
              ),
              const SizedBox(height: AppTheme.spacing16),

              // Email
              _buildTextField(
                controller: _emailController,
                label: 'Email Address *',
                placeholder: 'john.doe@example.com',
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: AppTheme.spacing16),

              // Phone with Country Code Picker
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Phone Number *',
                    style: AppTypography.bodyMedium.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: AppTheme.spacing8),
                  Row(
                    children: [
                      // Country Code Dropdown
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppTheme.spacing12,
                          vertical: AppTheme.spacing4,
                        ),
                        decoration: BoxDecoration(
                          border: Border.all(color: AppColors.iosSystemGrey4),
                          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        ),
                        child: GestureDetector(
                          onTap: () => _showCountryCodePicker(),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _countryCodes.firstWhere(
                                  (c) => c['code'] == _selectedCountryCode,
                                  orElse: () => _countryCodes[0],
                                )['flag']!,
                                style: const TextStyle(fontSize: 24),
                              ),
                              const SizedBox(width: AppTheme.spacing8),
                              Text(
                                _selectedCountryCode,
                                style: AppTypography.bodyLarge.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(width: AppTheme.spacing4),
                              Icon(
                                CupertinoIcons.chevron_down,
                                size: 16,
                                color: AppColors.textSecondary,
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: AppTheme.spacing12),
                      // Phone Number Input
                      Expanded(
                        child: CupertinoTextField(
                          controller: _phoneController,
                          placeholder: '123456789',
                          keyboardType: TextInputType.phone,
                          padding: const EdgeInsets.all(AppTheme.spacing16),
                          decoration: BoxDecoration(
                            border: Border.all(color: AppColors.iosSystemGrey4),
                            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppTheme.spacing8),
                  Text(
                    'Enter your phone number without country code',
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppTheme.spacing16),

              // LinkedIn
              _buildTextField(
                controller: _linkedinController,
                label: 'LinkedIn Profile',
                placeholder: 'https://linkedin.com/in/johndoe',
                keyboardType: TextInputType.url,
              ),
              const SizedBox(height: AppTheme.spacing16),

              // Portfolio
              _buildTextField(
                controller: _portfolioController,
                label: 'Portfolio / Website',
                placeholder: 'https://johndoe.com',
                keyboardType: TextInputType.url,
              ),
              const SizedBox(height: AppTheme.spacing32),

              // Resume Section
              _buildSectionHeader('Resume / CV (Optional)'),
              const SizedBox(height: AppTheme.spacing16),

              // Resume Upload
              GestureDetector(
                onTap: _pickResume,
                child: Container(
                  padding: const EdgeInsets.all(AppTheme.spacing20),
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: _selectedResume != null
                          ? AppColors.primary600
                          : AppColors.iosSystemGrey4,
                    ),
                    borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                    color: _selectedResume != null
                        ? AppColors.primary50
                        : AppColors.iosSystemGrey6,
                  ),
                  child: Column(
                    children: [
                      Icon(
                        _selectedResume != null
                            ? CupertinoIcons.doc_fill
                            : CupertinoIcons.cloud_upload,
                        size: 48,
                        color: _selectedResume != null
                            ? AppColors.primary600
                            : AppColors.textSecondary,
                      ),
                      const SizedBox(height: AppTheme.spacing12),
                      Text(
                        _selectedResume != null
                            ? 'Resume Selected: ${_selectedResume!.path.split('/').last}'
                            : 'Click to upload or drag and drop',
                        style: AppTypography.bodyMedium.copyWith(
                          color: _selectedResume != null
                              ? AppColors.primary600
                              : AppColors.textSecondary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AppTheme.spacing8),
                      Text(
                        'PDF or Word (Max 5MB) - Optional',
                        style: AppTypography.labelSmall.copyWith(
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppTheme.spacing32),

              // Cover Letter Section
              _buildSectionHeader('Cover Letter (Optional)'),
              const SizedBox(height: AppTheme.spacing16),

              Text(
                'Why are you interested in this role?',
                style: AppTypography.bodyLarge.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: AppTheme.spacing8),

              CupertinoTextField(
                controller: _coverLetterController,
                placeholder: 'Tell us why you\'re a great fit for this position...',
                maxLines: 6,
                padding: const EdgeInsets.all(AppTheme.spacing16),
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.iosSystemGrey4),
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                ),
              ),
              const SizedBox(height: AppTheme.spacing8),

              Text(
                'Optional: Share your motivation and why you\'d be a great fit',
                style: AppTypography.labelSmall.copyWith(
                  color: AppColors.textTertiary,
                ),
              ),
              const SizedBox(height: AppTheme.spacing32),

              // Additional Information Section
              _buildSectionHeader('Additional Information'),
              const SizedBox(height: AppTheme.spacing16),

              // Notice Period
              _buildTextField(
                controller: _noticePeriodController,
                label: 'Notice Period',
                placeholder: 'e.g., 2 weeks, Immediate',
              ),
              const SizedBox(height: AppTheme.spacing8),

              Text(
                'Optional: Let us know your availability',
                style: AppTypography.labelSmall.copyWith(
                  color: AppColors.textTertiary,
                ),
              ),
              const SizedBox(height: AppTheme.spacing40),

              // Submit Buttons
              Row(
                children: [
                  Expanded(
                    child: CupertinoButton(
                      color: AppColors.primary600,
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      padding: const EdgeInsets.symmetric(vertical: AppTheme.spacing16),
                      onPressed: _isSubmitting ? null : _submitApplication,
                      child: _isSubmitting
                          ? const CupertinoActivityIndicator(color: CupertinoColors.white)
                          : Text(
                              'Submit Application',
                              style: AppTypography.button.copyWith(
                                color: CupertinoColors.white,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(width: AppTheme.spacing16),
                  Expanded(
                    child: CupertinoButton(
                      color: AppColors.iosSystemGrey4,
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      padding: const EdgeInsets.symmetric(vertical: AppTheme.spacing16),
                      onPressed: _isSubmitting ? null : () => Get.back(),
                      child: Text(
                        'Cancel',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppTheme.spacing40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: AppTypography.headlineMedium.copyWith(
        fontWeight: FontWeight.w600,
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String placeholder,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTypography.bodyMedium.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: AppTheme.spacing8),
        CupertinoTextField(
          controller: controller,
          placeholder: placeholder,
          keyboardType: keyboardType,
          padding: const EdgeInsets.all(AppTheme.spacing16),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.iosSystemGrey4),
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          ),
        ),
      ],
    );
  }
}