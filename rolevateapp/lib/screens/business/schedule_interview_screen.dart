import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/services/interview_service.dart';
import 'package:rolevateapp/models/interview.dart';

class ScheduleInterviewScreen extends StatefulWidget {
  const ScheduleInterviewScreen({super.key});

  @override
  State<ScheduleInterviewScreen> createState() => _ScheduleInterviewScreenState();
}

class _ScheduleInterviewScreenState extends State<ScheduleInterviewScreen> {
  final InterviewService _interviewService = InterviewService();
  
  String? _applicationId;
  String? _candidateName;
  String? _candidateTitle;
  
  DateTime selectedDate = DateTime.now().add(const Duration(days: 1));
  DateTime selectedTime = DateTime.now().add(const Duration(hours: 2));
  InterviewType _selectedType = InterviewType.video;
  int _selectedDuration = 45;
  
  final TextEditingController _notesController = TextEditingController();
  
  bool _isScheduling = false;

  final List<int> _durationOptions = [15, 30, 45, 60, 90, 120];

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
      final applicationId = _applicationId ?? 'mock-application-1';
      
      // Schedule interview with Rolevate AI agent
      final interview = await _interviewService.scheduleInterview(
        applicationId: applicationId,
        employerId: 'current_employer_id', // TODO: Get from auth
        scheduledAt: interviewDateTime,
        duration: _selectedDuration,
        type: _selectedType,
        notes: _notesController.text.trim().isNotEmpty 
            ? _notesController.text.trim() 
            : null,
      );

      Get.snackbar(
        'Interview Scheduled',
        'Rolevate AI interview scheduled successfully',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.success,
        colorText: CupertinoColors.white,
        duration: const Duration(seconds: 5),
        messageText: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Interview link sent to candidate',
              style: TextStyle(
                color: CupertinoColors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              interview.interviewLink ?? '',
              style: const TextStyle(
                color: CupertinoColors.white,
                fontSize: 12,
              ),
            ),
          ],
        ),
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

              // Rolevate AI Info Card
              Container(
                padding: const EdgeInsets.all(AppTheme.spacing16),
                decoration: BoxDecoration(
                  color: AppColors.primary600.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                  border: Border.all(
                    color: AppColors.primary600.withValues(alpha: 0.3),
                    width: 1,
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(
                      CupertinoIcons.sparkles,
                      color: AppColors.primary600,
                      size: 24,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Rolevate AI Interview',
                            style: AppTypography.bodyLarge.copyWith(
                              color: AppColors.primary600,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'AI agent will conduct the interview and provide detailed analysis',
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppTheme.spacing24),

              // Interview Type
              Text(
                'Interview Type',
                style: AppTypography.labelLarge,
              ),
              const SizedBox(height: AppTheme.spacing8),
              Container(
                decoration: BoxDecoration(
                  color: AppColors.iosSystemGrey6,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                ),
                child: CupertinoSegmentedControl<InterviewType>(
                  children: {
                    InterviewType.video: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                      child: Column(
                        children: [
                          Icon(CupertinoIcons.videocam, size: 20),
                          SizedBox(height: 4),
                          Text('Video', style: TextStyle(fontSize: 11)),
                        ],
                      ),
                    ),
                    InterviewType.technical: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                      child: Column(
                        children: [
                          Icon(CupertinoIcons.gear_alt, size: 20),
                          SizedBox(height: 4),
                          Text('Technical', style: TextStyle(fontSize: 11)),
                        ],
                      ),
                    ),
                    InterviewType.hr: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                      child: Column(
                        children: [
                          Icon(CupertinoIcons.person_2, size: 20),
                          SizedBox(height: 4),
                          Text('HR', style: TextStyle(fontSize: 11)),
                        ],
                      ),
                    ),
                  },
                  groupValue: _selectedType,
                  onValueChanged: (InterviewType value) {
                    setState(() => _selectedType = value);
                  },
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

              // Duration
              Text(
                'Duration',
                style: AppTypography.labelLarge,
              ),
              const SizedBox(height: AppTheme.spacing8),
              Container(
                height: 150,
                decoration: BoxDecoration(
                  color: AppColors.iosSystemGrey6,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                ),
                child: CupertinoPicker(
                  itemExtent: 40,
                  scrollController: FixedExtentScrollController(
                    initialItem: _durationOptions.indexOf(_selectedDuration),
                  ),
                  onSelectedItemChanged: (int index) {
                    setState(() => _selectedDuration = _durationOptions[index]);
                  },
                  children: _durationOptions.map((duration) {
                    return Center(
                      child: Text(
                        duration < 60 
                            ? '$duration minutes' 
                            : '${duration ~/ 60} hour${duration > 60 ? 's' : ''}',
                        style: const TextStyle(fontSize: 16),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: AppTheme.spacing24),

              // Notes
              Text(
                'Additional Notes (Optional)',
                style: AppTypography.labelLarge,
              ),
              const SizedBox(height: AppTheme.spacing8),
              CupertinoTextField(
                controller: _notesController,
                placeholder: 'Add any special instructions or notes...',
                maxLines: 3,
                padding: const EdgeInsets.all(AppTheme.spacing16),
                decoration: BoxDecoration(
                  color: AppColors.iosSystemGrey6,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                ),
              ),
              const SizedBox(height: AppTheme.spacing12),
              
              // Info Text
              Text(
                'The candidate will receive an email with the Rolevate interview link. They can join 5 minutes before the scheduled time.',
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
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
