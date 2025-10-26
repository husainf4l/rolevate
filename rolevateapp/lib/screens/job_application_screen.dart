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

    if (_selectedResume == null) {
      Get.snackbar(
        'Validation Error',
        'Resume/CV is required',
        snackPosition: SnackPosition.BOTTOM,
      );
      return false;
    }

    return true;
  }

  Future<void> _submitApplication() async {
    if (!_validateForm()) return;

    setState(() {
      _isSubmitting = true;
    });

    try {
      // Convert resume file to base64 or upload URL
      String? resumeUrl;
      if (_selectedResume != null) {
        // For now, we'll just use the file path as a placeholder
        // In a real implementation, you'd upload the file to a server
        resumeUrl = _selectedResume!.path;
      }

      await _applicationService.createApplication(
        jobId: widget.jobId,
        coverLetter: _coverLetterController.text.trim().isNotEmpty
            ? _coverLetterController.text.trim()
            : null,
        resumeUrl: resumeUrl,
        expectedSalary: null, // Could be added later
        noticePeriod: _noticePeriodController.text.trim().isNotEmpty
            ? _noticePeriodController.text.trim()
            : null,
        source: 'mobile_app',
        firstName: _isGuestApplication ? _fullNameController.text.trim() : null,
        lastName: null, // Could split full name
        email: _isGuestApplication ? _emailController.text.trim() : null,
        phone: _phoneController.text.trim(),
        linkedin: _linkedinController.text.trim().isNotEmpty
            ? _linkedinController.text.trim()
            : null,
        portfolioUrl: _portfolioController.text.trim().isNotEmpty
            ? _portfolioController.text.trim()
            : null,
      );

      // Refresh applications in controller
      await jobController.fetchMyApplications();

      // Show success message and navigate back
      Get.back();
      Get.snackbar(
        'Application Submitted',
        'Your application has been submitted successfully!',
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 3),
      );
    } catch (e) {
      Get.snackbar(
        'Application Failed',
        'Failed to submit application. Please try again.',
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 3),
      );
    } finally {
      setState(() {
        _isSubmitting = false;
      });
    }
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
                    color: AppColors.warning.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                    border: Border.all(
                      color: AppColors.warning.withValues(alpha: 0.3),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            CupertinoIcons.exclamationmark_triangle,
                            color: AppColors.warning,
                            size: 20,
                          ),
                          const SizedBox(width: AppTheme.spacing8),
                          Text(
                            'Applying as a guest',
                            style: AppTypography.labelLarge.copyWith(
                              color: AppColors.warning,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppTheme.spacing8),
                      Text(
                        'You can apply without an account. However, creating an account lets you track your applications, save jobs, and get notified about updates.',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
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

              // Phone
              _buildTextField(
                controller: _phoneController,
                label: 'Phone Number *',
                placeholder: '+1 (555) 123-4567',
                keyboardType: TextInputType.phone,
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
              _buildSectionHeader('Resume / CV'),
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
                        'PDF or Word (Max 5MB)',
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