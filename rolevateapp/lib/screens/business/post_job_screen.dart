import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/services/job_service.dart';
import 'package:rolevateapp/models/enums.dart';
import 'package:rolevateapp/utils/connection_test.dart';

class PostJobScreen extends StatefulWidget {
  const PostJobScreen({super.key});

  @override
  State<PostJobScreen> createState() => _PostJobScreenState();
}

class _PostJobScreenState extends State<PostJobScreen> {
  final _formKey = GlobalKey<FormState>();
  final _jobService = JobService();

  // Form controllers
  final _titleController = TextEditingController();
  final _departmentController = TextEditingController();
  final _locationController = TextEditingController();
  final _salaryController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _shortDescriptionController = TextEditingController();
  final _responsibilitiesController = TextEditingController();
  final _requirementsController = TextEditingController();
  final _benefitsController = TextEditingController();
  final _skillsController = TextEditingController();
  final _experienceController = TextEditingController();
  final _educationController = TextEditingController();
  final _industryController = TextEditingController();
  final _companyDescriptionController = TextEditingController();

  // Form state
  JobType _selectedJobType = JobType.fullTime;
  JobLevel _selectedJobLevel = JobLevel.entry;
  WorkType _selectedWorkType = WorkType.onsite;
  DateTime _selectedDeadline = DateTime.now().add(const Duration(days: 30));
  bool _isLoading = false;
  bool _isGenerating = false;

  @override
  void initState() {
    super.initState();
    debugPrint('🎯 PostJobScreen initialized');
  }

  @override
  void dispose() {
    _titleController.dispose();
    _departmentController.dispose();
    _locationController.dispose();
    _salaryController.dispose();
    _descriptionController.dispose();
    _shortDescriptionController.dispose();
    _responsibilitiesController.dispose();
    _requirementsController.dispose();
    _benefitsController.dispose();
    _skillsController.dispose();
    _experienceController.dispose();
    _educationController.dispose();
    _industryController.dispose();
    _companyDescriptionController.dispose();
    super.dispose();
  }

  Future<void> _runDiagnostics() async {
    debugPrint('🔍 Running diagnostics...');
    
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Running Diagnostics...'),
        content: const Column(
          children: [
            SizedBox(height: 16),
            CupertinoActivityIndicator(),
            SizedBox(height: 16),
            Text('Testing backend connection and authentication'),
          ],
        ),
      ),
      barrierDismissible: false,
    );
    
    try {
      final results = await ConnectionTest.testConnection().timeout(
        const Duration(seconds: 15),
        onTimeout: () {
          return {
            'connection': false,
            'authentication': false,
            'userType': null,
            'hasCompany': false,
            'errors': ['Diagnostic test timed out - backend may be unreachable'],
          };
        },
      );
      
      Navigator.of(context).pop(); // Close loading dialog
      
      // Show results
      final hasIssues = (results['errors'] as List).isNotEmpty;
      
      showCupertinoDialog(
        context: context,
        builder: (context) => CupertinoAlertDialog(
          title: Text(hasIssues ? '⚠️ Issues Found' : '✅ All Checks Passed'),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 16),
                _buildDiagnosticRow('Connection', results['connection'] ?? false),
                _buildDiagnosticRow('Authentication', results['authentication'] ?? false),
                _buildDiagnosticRow('Business User', results['userType'] == 'BUSINESS'),
                _buildDiagnosticRow('Has Company', results['hasCompany'] ?? false),
                if (hasIssues) ...[
                  const SizedBox(height: 16),
                  const Text(
                    'Errors:',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  ...(results['errors'] as List).map((error) => Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Text(
                      '• $error',
                      style: const TextStyle(
                        color: CupertinoColors.destructiveRed,
                        fontSize: 12,
                      ),
                    ),
                  )),
                ],
              ],
            ),
          ),
          actions: [
            CupertinoDialogAction(
              child: const Text('OK'),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        ),
      );
    } catch (e) {
      debugPrint('❌ Diagnostics failed: $e');
      Navigator.of(context).pop(); // Close loading dialog
      
      showCupertinoDialog(
        context: context,
        builder: (context) => CupertinoAlertDialog(
          title: const Text('Diagnostic Error'),
          content: Text('Failed to run diagnostics: $e'),
          actions: [
            CupertinoDialogAction(
              child: const Text('OK'),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        ),
      );
    }
  }
  
  Widget _buildDiagnosticRow(String label, bool passed) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(
            passed ? CupertinoIcons.check_mark_circled_solid : CupertinoIcons.xmark_circle_fill,
            color: passed ? CupertinoColors.systemGreen : CupertinoColors.destructiveRed,
            size: 16,
          ),
          const SizedBox(width: 8),
          Text(label),
        ],
      ),
    );
  }

  Future<void> _generateWithAI() async {
    debugPrint('🤖 _generateWithAI called');
    
    // Validate that we have at least title and location
    if (_titleController.text.trim().isEmpty) {
      showCupertinoDialog(
        context: context,
        builder: (context) => CupertinoAlertDialog(
          title: const Text('Missing Information'),
          content: const Text('Please enter a job title first before using AI generation.'),
          actions: [
            CupertinoDialogAction(
              child: const Text('OK'),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        ),
      );
      return;
    }
    
    if (_locationController.text.trim().isEmpty) {
      showCupertinoDialog(
        context: context,
        builder: (context) => CupertinoAlertDialog(
          title: const Text('Missing Information'),
          content: const Text('Please enter a location first before using AI generation.'),
          actions: [
            CupertinoDialogAction(
              child: const Text('OK'),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        ),
      );
      return;
    }

    setState(() => _isGenerating = true);

    try {
      debugPrint('🤖 Calling AI generation service...');
      
      final analysis = await _jobService.generateJobAnalysis(
        jobTitle: _titleController.text.trim(),
        location: _locationController.text.trim(),
        employeeType: _selectedJobType.toJson(),
        department: _departmentController.text.trim().isNotEmpty 
            ? _departmentController.text.trim() 
            : null,
        industry: _industryController.text.trim().isNotEmpty
            ? _industryController.text.trim()
            : null,
        jobLevel: _selectedJobLevel.name.toUpperCase(),
        workType: _selectedWorkType.name.toUpperCase(),
      );

      debugPrint('✅ AI analysis received');
      
      // Fill in the form fields with AI-generated content
      setState(() {
        _descriptionController.text = analysis['description'] ?? '';
        _shortDescriptionController.text = analysis['shortDescription'] ?? '';
        _responsibilitiesController.text = analysis['responsibilities'] ?? '';
        _requirementsController.text = analysis['requirements'] ?? '';
        _benefitsController.text = analysis['benefits'] ?? '';
        
        // Only set salary if it's provided and not empty
        if (analysis['suggestedSalary'] != null && 
            analysis['suggestedSalary'].toString().isNotEmpty) {
          _salaryController.text = analysis['suggestedSalary'];
        }
        
        _experienceController.text = analysis['experienceLevel'] ?? '';
        _educationController.text = analysis['educationLevel'] ?? '';
        
        // Parse skills array
        if (analysis['skills'] != null && analysis['skills'] is List) {
          _skillsController.text = (analysis['skills'] as List).join(', ');
        }
      });

      showCupertinoDialog(
        context: context,
        builder: (context) => CupertinoAlertDialog(
          title: const Text('✨ AI Generated'),
          content: const Text('Job details have been auto-filled. Please review and edit as needed before posting.'),
          actions: [
            CupertinoDialogAction(
              child: const Text('OK'),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        ),
      );
    } catch (e) {
      debugPrint('❌ Error generating with AI: $e');
      
      showCupertinoDialog(
        context: context,
        builder: (context) => CupertinoAlertDialog(
          title: const Text('⚠️ AI Generation Failed'),
          content: Text(
            e.toString().replaceAll('Exception: ', ''),
          ),
          actions: [
            CupertinoDialogAction(
              isDefaultAction: true,
              child: const Text('Fill Manually'),
              onPressed: () => Navigator.of(context).pop(),
            ),
            CupertinoDialogAction(
              child: const Text('Try Again'),
              onPressed: () {
                Navigator.of(context).pop();
                Future.delayed(const Duration(milliseconds: 300), () {
                  _generateWithAI();
                });
              },
            ),
          ],
        ),
      );
    } finally {
      setState(() => _isGenerating = false);
    }
  }

  Future<void> _postJob() async {
    debugPrint('🚀 _postJob called');
    
    if (!_formKey.currentState!.validate()) {
      debugPrint('❌ Form validation failed');
      
      // Show which fields are missing
      String errorMessage = 'Please fill in all required fields:\n';
      if (_titleController.text.trim().isEmpty) errorMessage += '• Job Title\n';
      if (_departmentController.text.trim().isEmpty) errorMessage += '• Department\n';
      if (_locationController.text.trim().isEmpty) errorMessage += '• Location\n';
      if (_salaryController.text.trim().isEmpty) errorMessage += '• Salary\n';
      if (_descriptionController.text.trim().isEmpty) errorMessage += '• Description\n';
      if (_shortDescriptionController.text.trim().isEmpty) errorMessage += '• Short Description\n';
      
      Get.snackbar(
        'Validation Error',
        errorMessage,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: CupertinoColors.destructiveRed,
        colorText: CupertinoColors.white,
        duration: const Duration(seconds: 4),
      );
      return;
    }

    debugPrint('✅ Form validation passed');
    setState(() => _isLoading = true);

    try {
      // Parse skills
      List<String> skills = _skillsController.text.isNotEmpty
          ? _skillsController.text.split(',').map((s) => s.trim()).toList()
          : [];

      debugPrint('📝 Creating job with title: ${_titleController.text}');
      
      await _jobService.createJob(
        title: _titleController.text.trim(),
        department: _departmentController.text.trim(),
        location: _locationController.text.trim(),
        salary: _salaryController.text.trim(),
        type: _selectedJobType,
        jobLevel: _selectedJobLevel,
        workType: _selectedWorkType,
        description: _descriptionController.text.trim(),
        shortDescription: _shortDescriptionController.text.trim(),
        responsibilities: _responsibilitiesController.text.trim().isNotEmpty
            ? _responsibilitiesController.text.trim()
            : null,
        requirements: _requirementsController.text.trim().isNotEmpty
            ? _requirementsController.text.trim()
            : null,
        benefits: _benefitsController.text.trim().isNotEmpty
            ? _benefitsController.text.trim()
            : null,
        skills: skills.isNotEmpty ? skills : null,
        experience: _experienceController.text.trim().isNotEmpty
            ? _experienceController.text.trim()
            : null,
        education: _educationController.text.trim().isNotEmpty
            ? _educationController.text.trim()
            : null,
        industry: _industryController.text.trim().isNotEmpty
            ? _industryController.text.trim()
            : null,
        companyDescription: _companyDescriptionController.text.trim().isNotEmpty
            ? _companyDescriptionController.text.trim()
            : null,
        deadline: _selectedDeadline,
      );

      debugPrint('✅ Job created successfully');
      
      Get.snackbar(
        'Success',
        'Job posted successfully!',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: CupertinoColors.systemGreen,
        colorText: CupertinoColors.white,
        duration: const Duration(seconds: 2),
      );
      
      // Navigate to business jobs screen with result to trigger refresh
      Get.offAllNamed('/jobs', arguments: {'refresh': true});
    } catch (e) {
      debugPrint('❌ Error creating job: $e');
      debugPrint('❌ Error type: ${e.runtimeType}');
      debugPrint('❌ Stack trace: ${StackTrace.current}');
      
      // Show detailed error information
      final detailedError = ConnectionTest.getDetailedError(e);
      debugPrint('📋 Detailed error: $detailedError');
      
      // Check if it's a timeout error
      final isTimeout = e.toString().contains('timeout') || e.toString().contains('Timeout');
      
      // Check if it's an authentication error
      final isAuthError = e.toString().toLowerCase().contains('unauthorized') || 
                         e.toString().toLowerCase().contains('authentication') ||
                         e.toString().toLowerCase().contains('token');
      
      showCupertinoDialog(
        context: context,
        builder: (context) => CupertinoAlertDialog(
          title: Text(
            isTimeout ? 'Connection Timeout' : 
            isAuthError ? 'Authentication Error' :
            'Failed to Post Job'
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 16),
                Text(
                  isTimeout 
                    ? 'The request took too long. Please check:\n\n• Your internet connection\n• Backend server status\n• Try again in a moment'
                    : isAuthError
                      ? 'Authentication failed. Please:\n\n• Log out and log back in\n• Check if you are a business user\n• Verify your company is registered'
                      : detailedError,
                  style: const TextStyle(fontSize: 13),
                ),
              ],
            ),
          ),
          actions: [
            CupertinoDialogAction(
              child: const Text('Copy Error'),
              onPressed: () {
                // Copy full error to clipboard (you'll need clipboard package)
                debugPrint('Full error for copying: $e');
                Navigator.of(context).pop();
              },
            ),
            if (!isTimeout && !isAuthError)
              CupertinoDialogAction(
                child: const Text('Run Diagnostics'),
                onPressed: () {
                  Navigator.of(context).pop();
                  _runDiagnostics();
                },
              ),
            CupertinoDialogAction(
              isDefaultAction: true,
              child: const Text('OK'),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        ),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: const Text('Post New Job'),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          child: const Icon(CupertinoIcons.back),
          onPressed: () => Get.back(),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Diagnostic button
            CupertinoButton(
              padding: EdgeInsets.zero,
              onPressed: _runDiagnostics,
              child: const Icon(
                CupertinoIcons.info_circle,
                color: AppColors.primary600,
              ),
            ),
            const SizedBox(width: 8),
            // Post button
            CupertinoButton(
              padding: EdgeInsets.zero,
              onPressed: _isLoading ? null : _postJob,
              child: _isLoading
                  ? const CupertinoActivityIndicator()
                  : const Text('Post'),
            ),
          ],
        ),
      ),
      child: SafeArea(
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppTheme.spacing20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Job Title
                _buildTextField(
                  controller: _titleController,
                  label: 'Job Title *',
                  placeholder: 'e.g. Senior Software Engineer',
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Job title is required';
                    }
                    if (value.trim().length < 3) {
                      return 'Job title must be at least 3 characters';
                    }
                    return null;
                  },
                ),

                // Department
                _buildTextField(
                  controller: _departmentController,
                  label: 'Department *',
                  placeholder: 'e.g. Engineering',
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Department is required';
                    }
                    return null;
                  },
                ),

                // Location
                _buildTextField(
                  controller: _locationController,
                  label: 'Location *',
                  placeholder: 'e.g. Dubai, UAE',
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Location is required';
                    }
                    return null;
                  },
                ),

                // Salary
                _buildTextField(
                  controller: _salaryController,
                  label: 'Salary Range *',
                  placeholder: 'e.g. AED 15,000 - 20,000',
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Salary is required';
                    }
                    return null;
                  },
                ),

                // Job Type Dropdown
                _buildDropdownField(
                  label: 'Job Type *',
                  value: _selectedJobType,
                  items: JobType.values,
                  onChanged: (value) => setState(() => _selectedJobType = value!),
                  itemBuilder: (type) => Text(type.displayName),
                ),

                // Job Level Dropdown
                _buildDropdownField(
                  label: 'Job Level *',
                  value: _selectedJobLevel,
                  items: JobLevel.values,
                  onChanged: (value) => setState(() => _selectedJobLevel = value!),
                  itemBuilder: (level) => Text(level.displayName),
                ),

                // Work Type Dropdown
                _buildDropdownField(
                  label: 'Work Type *',
                  value: _selectedWorkType,
                  items: WorkType.values,
                  onChanged: (value) => setState(() => _selectedWorkType = value!),
                  itemBuilder: (workType) => Text(workType.displayName),
                ),

                // AI Generate Button
                Container(
                  margin: const EdgeInsets.only(bottom: AppTheme.spacing20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(AppTheme.spacing16),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              AppColors.primary600.withOpacity(0.1),
                              AppColors.primary400.withOpacity(0.05),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                          border: Border.all(
                            color: AppColors.primary600.withOpacity(0.3),
                            width: 1,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  CupertinoIcons.sparkles,
                                  color: AppColors.primary600,
                                  size: 20,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'AI Auto-Complete',
                                  style: AppTypography.labelLarge.copyWith(
                                    color: AppColors.primary600,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Let AI generate job description, requirements, benefits, and more based on the job title and location you\'ve entered.',
                              style: AppTypography.labelMedium.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 12),
                            SizedBox(
                              width: double.infinity,
                              child: CupertinoButton(
                                color: AppColors.primary600,
                                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                onPressed: _isGenerating ? null : _generateWithAI,
                                child: _isGenerating
                                    ? const Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          CupertinoActivityIndicator(color: CupertinoColors.white),
                                          SizedBox(width: 12),
                                          Text(
                                            'Generating...',
                                            style: TextStyle(
                                              color: CupertinoColors.white,
                                              fontSize: 15,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ],
                                      )
                                    : Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          const Icon(
                                            CupertinoIcons.sparkles,
                                            color: CupertinoColors.white,
                                            size: 18,
                                          ),
                                          const SizedBox(width: 8),
                                          const Text(
                                            'Generate with AI',
                                            style: TextStyle(
                                              color: CupertinoColors.white,
                                              fontSize: 15,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ],
                                      ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Application Deadline
                _buildDatePickerField(),

                // Short Description
                _buildTextField(
                  controller: _shortDescriptionController,
                  label: 'Short Description *',
                  placeholder: 'Brief overview of the role...',
                  maxLines: 2,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Short description is required';
                    }
                    if (value.trim().length < 10) {
                      return 'Short description must be at least 10 characters';
                    }
                    return null;
                  },
                ),

                // Full Description
                _buildTextField(
                  controller: _descriptionController,
                  label: 'Full Description *',
                  placeholder: 'Detailed job description...',
                  maxLines: 5,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Job description is required';
                    }
                    if (value.trim().length < 50) {
                      return 'Job description must be at least 50 characters';
                    }
                    return null;
                  },
                ),

                // Responsibilities
                _buildTextField(
                  controller: _responsibilitiesController,
                  label: 'Responsibilities',
                  placeholder: 'Key responsibilities and duties...',
                  maxLines: 4,
                ),

                // Requirements
                _buildTextField(
                  controller: _requirementsController,
                  label: 'Requirements',
                  placeholder: 'Required skills and qualifications...',
                  maxLines: 4,
                ),

                // Benefits
                _buildTextField(
                  controller: _benefitsController,
                  label: 'Benefits',
                  placeholder: 'What we offer...',
                  maxLines: 3,
                ),

                // Skills
                _buildTextField(
                  controller: _skillsController,
                  label: 'Skills (comma-separated)',
                  placeholder: 'e.g. React, Node.js, Python',
                  maxLines: 2,
                ),

                const SizedBox(height: AppTheme.spacing32),

                // Post Button
                SizedBox(
                  width: double.infinity,
                  child: CupertinoButton(
                    color: CupertinoColors.systemBlue,
                    borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                    onPressed: _isLoading ? null : _postJob,
                    child: _isLoading
                        ? const CupertinoActivityIndicator(color: CupertinoColors.white)
                        : const Text(
                            'Post Job',
                            style: TextStyle(
                              color: CupertinoColors.white,
                              fontSize: 17,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String placeholder,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTypography.labelLarge,
        ),
        const SizedBox(height: AppTheme.spacing8),
        CupertinoTextFormFieldRow(
          controller: controller,
          placeholder: placeholder,
          maxLines: maxLines,
          padding: const EdgeInsets.all(AppTheme.spacing16),
          decoration: BoxDecoration(
            color: AppColors.iosSystemGrey6,
            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          ),
          validator: validator,
        ),
        const SizedBox(height: AppTheme.spacing20),
      ],
    );
  }

  Widget _buildDropdownField<T>({
    required String label,
    required T value,
    required List<T> items,
    required ValueChanged<T?> onChanged,
    required Widget Function(T) itemBuilder,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTypography.labelLarge,
        ),
        const SizedBox(height: AppTheme.spacing8),
        Container(
          decoration: BoxDecoration(
            color: AppColors.iosSystemGrey6,
            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          ),
          child: CupertinoButton(
            padding: EdgeInsets.zero,
            onPressed: () => _showPicker<T>(
              context,
              items,
              value,
              onChanged,
              itemBuilder,
            ),
            child: Container(
              padding: const EdgeInsets.all(AppTheme.spacing16),
              child: Row(
                children: [
                  Expanded(
                    child: itemBuilder(value),
                  ),
                  const Icon(
                    CupertinoIcons.chevron_down,
                    color: AppColors.iosSystemGrey,
                    size: 16,
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: AppTheme.spacing20),
      ],
    );
  }

  Widget _buildDatePickerField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Application Deadline *',
          style: AppTypography.labelLarge,
        ),
        const SizedBox(height: AppTheme.spacing12),

        // Quick selection buttons
        Container(
          padding: const EdgeInsets.all(AppTheme.spacing16),
          decoration: BoxDecoration(
            color: AppColors.iosSystemGrey6,
            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Quick Select',
                style: AppTypography.labelMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: AppTheme.spacing12),
              Wrap(
                spacing: AppTheme.spacing8,
                runSpacing: AppTheme.spacing8,
                children: [
                  _buildQuickSelectButton('1 Week', 7),
                  _buildQuickSelectButton('2 Weeks', 14),
                  _buildQuickSelectButton('1 Month', 30),
                  _buildQuickSelectButton('3 Months', 90),
                  _buildQuickSelectButton('6 Months', 180),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: AppTheme.spacing12),

        // Custom date picker
        Container(
          decoration: BoxDecoration(
            color: AppColors.iosSystemGrey6,
            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          ),
          child: CupertinoButton(
            padding: EdgeInsets.zero,
            onPressed: () => _showEnhancedDatePicker(),
            child: Container(
              padding: const EdgeInsets.all(AppTheme.spacing16),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Custom Date',
                          style: AppTypography.labelMedium.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: AppTheme.spacing4),
                        Text(
                          _formatSelectedDate(_selectedDeadline),
                          style: AppTypography.bodyLarge.copyWith(
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          _getDaysFromNow(_selectedDeadline),
                          style: AppTypography.labelSmall.copyWith(
                            color: AppColors.primary600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(
                    CupertinoIcons.calendar,
                    color: AppColors.primary600,
                    size: 24,
                  ),
                ],
              ),
            ),
          ),
        ),

        const SizedBox(height: AppTheme.spacing20),
      ],
    );
  }

  Widget _buildQuickSelectButton(String label, int days) {
    final targetDate = DateTime.now().add(Duration(days: days));
    final isSelected = _selectedDeadline.year == targetDate.year &&
                      _selectedDeadline.month == targetDate.month &&
                      _selectedDeadline.day == targetDate.day;

    return CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: () => setState(() => _selectedDeadline = targetDate),
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppTheme.spacing12,
          vertical: AppTheme.spacing8,
        ),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary600 : AppColors.iosSystemGrey5,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          border: Border.all(
            color: isSelected ? AppColors.primary600 : AppColors.iosSystemGrey4,
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: AppTypography.labelSmall.copyWith(
            color: isSelected ? CupertinoColors.white : AppColors.textPrimary,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  String _formatSelectedDate(DateTime date) {
    final now = DateTime.now();
    final difference = date.difference(now).inDays;

    if (difference == 0) return 'Today';
    if (difference == 1) return 'Tomorrow';
    if (difference == 7) return '1 week from today';
    if (difference == 14) return '2 weeks from today';
    if (difference == 30) return '1 month from today';
    if (difference == 90) return '3 months from today';
    if (difference == 180) return '6 months from today';

    // Format as day, month year
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  String _getDaysFromNow(DateTime date) {
    final now = DateTime.now();
    final difference = date.difference(now).inDays;

    if (difference < 0) return 'Expired';
    if (difference == 0) return 'Due today';
    if (difference == 1) return '1 day remaining';
    if (difference < 7) return '$difference days remaining';
    if (difference < 30) return '${(difference / 7).round()} weeks remaining';
    if (difference < 365) return '${(difference / 30).round()} months remaining';
    return '${(difference / 365).round()} years remaining';
  }

  void _showPicker<T>(
    BuildContext context,
    List<T> items,
    T currentValue,
    ValueChanged<T?> onChanged,
    Widget Function(T) itemBuilder,
  ) {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => Container(
        height: 200,
        color: CupertinoColors.systemBackground,
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                CupertinoButton(
                  child: const Text('Cancel'),
                  onPressed: () => Navigator.of(context).pop(),
                ),
                CupertinoButton(
                  child: const Text('Done'),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            Expanded(
              child: CupertinoPicker(
                itemExtent: 32,
                onSelectedItemChanged: (index) => onChanged(items[index]),
                children: items.map(itemBuilder).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showEnhancedDatePicker() {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => Container(
        height: 300,
        color: CupertinoColors.systemBackground,
        child: Column(
          children: [
            // Header with title and done button
            Container(
              padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacing16),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: AppColors.iosSystemGrey5,
                    width: 0.5,
                  ),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Select Application Deadline',
                    style: AppTypography.headlineSmall,
                  ),
                  CupertinoButton(
                    padding: EdgeInsets.zero,
                    child: const Text('Done'),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),

            // Date picker
            Expanded(
              child: CupertinoDatePicker(
                mode: CupertinoDatePickerMode.date,
                initialDateTime: _selectedDeadline,
                minimumDate: DateTime.now().add(const Duration(days: 1)),
                maximumDate: DateTime.now().add(const Duration(days: 365)),
                onDateTimeChanged: (date) => setState(() => _selectedDeadline = date),
              ),
            ),

            // Footer with selected date info
            Container(
              padding: const EdgeInsets.all(AppTheme.spacing16),
              decoration: BoxDecoration(
                color: AppColors.iosSystemGrey6,
                border: Border(
                  top: BorderSide(
                    color: AppColors.iosSystemGrey5,
                    width: 0.5,
                  ),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Selected Date',
                        style: AppTypography.labelSmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      Text(
                        _formatSelectedDate(_selectedDeadline),
                        style: AppTypography.bodyMedium,
                      ),
                    ],
                  ),
                  Text(
                    _getDaysFromNow(_selectedDeadline),
                    style: AppTypography.labelMedium.copyWith(
                      color: AppColors.primary600,
                      fontWeight: FontWeight.w600,
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
}
