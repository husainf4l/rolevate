import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/services/job_service.dart';
import 'package:rolevateapp/models/enums.dart';

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

  // Form state
  JobType _selectedJobType = JobType.fullTime;
  JobLevel _selectedJobLevel = JobLevel.entry;
  WorkType _selectedWorkType = WorkType.onsite;
  DateTime _selectedDeadline = DateTime.now().add(const Duration(days: 30));
  bool _isLoading = false;

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
    super.dispose();
  }

  Future<void> _postJob() async {
    debugPrint('🚀 _postJob called');
    
    if (!_formKey.currentState!.validate()) {
      debugPrint('❌ Form validation failed');
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
        deadline: _selectedDeadline,
      );

      debugPrint('✅ Job created successfully');
      
      Get.snackbar(
        'Success',
        'Job posted successfully!',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: CupertinoColors.systemGreen,
        colorText: CupertinoColors.white,
      );
      
      // Navigate to jobs list instead of back to dashboard
      Get.offNamed('/jobs');
    } catch (e) {
      debugPrint('❌ Error creating job: $e');
      Get.snackbar(
        'Error',
        'Failed to post job: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: CupertinoColors.destructiveRed,
        colorText: CupertinoColors.white,
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
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: _isLoading ? null : _postJob,
          child: _isLoading
              ? const CupertinoActivityIndicator()
              : const Text('Post'),
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
                CupertinoButton.filled(
                  onPressed: _isLoading ? null : _postJob,
                  child: _isLoading
                      ? const CupertinoActivityIndicator()
                      : const Text('Post Job'),
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
