import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/services/application_service.dart';

class ScheduleInterviewScreen extends StatefulWidget {
  const ScheduleInterviewScreen({super.key});

  @override
  State<ScheduleInterviewScreen> createState() => _ScheduleInterviewScreenState();
}

class _ScheduleInterviewScreenState extends State<ScheduleInterviewScreen> {
  final ApplicationService _applicationService = ApplicationService();
  
  String? _applicationId;
  String? _candidateName;
  String? _candidateTitle;
  
  DateTime selectedDate = DateTime.now().add(const Duration(days: 1));
  DateTime selectedTime = DateTime.now().add(const Duration(hours: 2));
  
  final TextEditingController _meetingLinkController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  
  bool _isScheduling = false;

  @override
  void initState() {
    super.initState();
    
    // Get application data from navigation arguments
    final args = Get.arguments as Map<String, dynamic>?;
    if (args != null) {
      _applicationId = args['applicationId'] as String?;
      _candidateName = args['candidateName'] as String? ?? 'Candidate';
      _candidateTitle = args['candidateTitle'] as String? ?? 'Applicant';
    }
  }

  @override
  void dispose() {
    _meetingLinkController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _scheduleInterview() async {
    // Combine selected date and time
    final interviewDateTime = DateTime(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day,
      selectedTime.hour,
      selectedTime.minute,
    );

    // Validate that interview is in the future
    if (interviewDateTime.isBefore(DateTime.now())) {
      Get.snackbar(
        'Invalid Time',
        'Please select a future date and time for the interview.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.error,
        colorText: CupertinoColors.white,
      );
      return;
    }

    setState(() {
      _isScheduling = true;
    });

    try {
      // Use the application ID from navigation arguments
      final applicationId = _applicationId ?? 'mock-application-1';

      await _applicationService.scheduleInterview(
        applicationId: applicationId,
        interviewDateTime: interviewDateTime,
        meetingLink: _meetingLinkController.text.trim().isNotEmpty 
            ? _meetingLinkController.text.trim() 
            : null,
        notes: _notesController.text.trim().isNotEmpty 
            ? _notesController.text.trim() 
            : null,
      );

      Get.snackbar(
        'Success',
        'Interview scheduled successfully!',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.success,
        colorText: CupertinoColors.white,
      );
      
      // Go back to previous screen
      Get.back();
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to schedule interview: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.error,
        colorText: CupertinoColors.white,
      );
    } finally {
      setState(() {
        _isScheduling = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: const Text('Schedule Interview'),
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
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Candidate
              Text(
                'Candidate',
                style: AppTypography.labelLarge,
              ),
              const SizedBox(height: AppTheme.spacing8),
              Container(
                padding: const EdgeInsets.all(AppTheme.spacing16),
                decoration: BoxDecoration(
                  color: AppColors.iosSystemGrey6,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: AppColors.primary600.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      ),
                      child: Center(
                        child: Text(
                          _candidateName?.isNotEmpty == true 
                              ? _candidateName![0].toUpperCase() 
                              : 'A',
                          style: AppTypography.headlineSmall.copyWith(
                            color: AppColors.primary600,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: AppTheme.spacing12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _candidateName ?? 'Ahmed Hassan',
                          style: AppTypography.bodyLarge,
                        ),
                        Text(
                          _candidateTitle ?? 'Senior Software Engineer',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppTheme.spacing24),

              // Date
              Text(
                'Interview Date',
                style: AppTypography.labelLarge,
              ),
              const SizedBox(height: AppTheme.spacing8),
              Container(
                height: 200,
                decoration: BoxDecoration(
                  color: AppColors.iosSystemGrey6,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                ),
                child: CupertinoDatePicker(
                  mode: CupertinoDatePickerMode.date,
                  initialDateTime: selectedDate,
                  minimumDate: DateTime.now(),
                  onDateTimeChanged: (DateTime newDate) {
                    setState(() {
                      selectedDate = newDate;
                    });
                  },
                ),
              ),
              const SizedBox(height: AppTheme.spacing24),

              // Time
              Text(
                'Interview Time',
                style: AppTypography.labelLarge,
              ),
              const SizedBox(height: AppTheme.spacing8),
              Container(
                height: 200,
                decoration: BoxDecoration(
                  color: AppColors.iosSystemGrey6,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                ),
                child: CupertinoDatePicker(
                  mode: CupertinoDatePickerMode.time,
                  initialDateTime: selectedTime,
                  onDateTimeChanged: (DateTime newTime) {
                    setState(() {
                      selectedTime = newTime;
                    });
                  },
                ),
              ),
              const SizedBox(height: AppTheme.spacing24),

              // Meeting Link
              Text(
                'Meeting Link (Optional)',
                style: AppTypography.labelLarge,
              ),
              const SizedBox(height: AppTheme.spacing8),
              CupertinoTextField(
                controller: _meetingLinkController,
                placeholder: 'e.g. Zoom or Teams link',
                padding: const EdgeInsets.all(AppTheme.spacing16),
                decoration: BoxDecoration(
                  color: AppColors.iosSystemGrey6,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                ),
              ),
              const SizedBox(height: AppTheme.spacing24),

              // Notes
              Text(
                'Additional Notes',
                style: AppTypography.labelLarge,
              ),
              const SizedBox(height: AppTheme.spacing8),
              CupertinoTextField(
                controller: _notesController,
                placeholder: 'Any special instructions...',
                maxLines: 3,
                padding: const EdgeInsets.all(AppTheme.spacing16),
                decoration: BoxDecoration(
                  color: AppColors.iosSystemGrey6,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                ),
              ),
              const SizedBox(height: AppTheme.spacing32),

              // Schedule Button
              CupertinoButton(
                color: AppColors.primary600,
                borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                onPressed: _isScheduling ? null : _scheduleInterview,
                child: _isScheduling
                    ? const CupertinoActivityIndicator(color: CupertinoColors.white)
                    : Text(
                        'Schedule Interview',
                        style: AppTypography.button.copyWith(
                          color: CupertinoColors.white,
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
