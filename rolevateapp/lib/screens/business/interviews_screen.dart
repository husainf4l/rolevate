import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/models/interview.dart';
import 'package:rolevateapp/services/interview_service.dart';
import 'package:intl/intl.dart';

class InterviewsScreen extends StatefulWidget {
  const InterviewsScreen({super.key});

  @override
  State<InterviewsScreen> createState() => _InterviewsScreenState();
}

class _InterviewsScreenState extends State<InterviewsScreen> {
  final InterviewService _interviewService = InterviewService();
  List<Interview> _interviews = [];
  bool _isLoading = true;
  String _selectedFilter = 'All Status';

  @override
  void initState() {
    super.initState();
    _loadInterviews();
  }

  Future<void> _loadInterviews() async {
    setState(() => _isLoading = true);
    try {
      // For now, using mock data. Replace with actual backend call
      final interviews = await _interviewService.getInterviewsForApplication('mock-app-1');
      setState(() {
        _interviews = interviews;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      Get.snackbar(
        'Error',
        'Failed to load interviews: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.error,
        colorText: CupertinoColors.white,
      );
    }
  }

  List<Interview> get _filteredInterviews {
    if (_selectedFilter == 'All Status') {
      return _interviews;
    }
    return _interviews.where((interview) {
      switch (_selectedFilter) {
        case 'Upcoming':
          return interview.status == InterviewStatus.scheduled &&
              interview.scheduledAt.isAfter(DateTime.now());
        case 'Completed':
          return interview.status == InterviewStatus.completed;
        case 'Cancelled':
          return interview.status == InterviewStatus.cancelled;
        default:
          return true;
      }
    }).toList();
  }

  List<Interview> get _upcomingInterviews {
    return _interviews.where((interview) => 
      interview.status == InterviewStatus.scheduled &&
      interview.scheduledAt.isAfter(DateTime.now())
    ).toList();
  }

  List<Interview> get _completedInterviews {
    return _interviews.where((interview) => 
      interview.status == InterviewStatus.completed
    ).toList();
  }

  List<Interview> get _cancelledInterviews {
    return _interviews.where((interview) => 
      interview.status == InterviewStatus.cancelled
    ).toList();
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        middle: Text('Interview Schedule'),
        previousPageTitle: 'Dashboard',
      ),
      child: SafeArea(
        child: _isLoading
            ? const Center(child: CupertinoActivityIndicator())
            : CustomScrollView(
                  slivers: [
                    // Header
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.all(AppTheme.spacing16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Manage your interview schedule and track your progress.',
                              style: AppTypography.bodyMedium.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: AppTheme.spacing20),
                            
                            // Stats Cards
                            Row(
                              children: [
                                Expanded(
                                  child: _StatCard(
                                    icon: CupertinoIcons.calendar,
                                    label: 'Total',
                                    value: _interviews.length.toString(),
                                    color: AppColors.primary600,
                                  ),
                                ),
                                const SizedBox(width: AppTheme.spacing12),
                                Expanded(
                                  child: _StatCard(
                                    icon: CupertinoIcons.clock,
                                    label: 'Upcoming',
                                    value: _upcomingInterviews.length.toString(),
                                    color: const Color(0xFFEAB308),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: AppTheme.spacing12),
                            Row(
                              children: [
                                Expanded(
                                  child: _StatCard(
                                    icon: CupertinoIcons.check_mark_circled,
                                    label: 'Completed',
                                    value: _completedInterviews.length.toString(),
                                    color: AppColors.success,
                                  ),
                                ),
                                const SizedBox(width: AppTheme.spacing12),
                                Expanded(
                                  child: _StatCard(
                                    icon: CupertinoIcons.xmark_circle,
                                    label: 'Cancelled',
                                    value: _cancelledInterviews.length.toString(),
                                    color: AppColors.error,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: AppTheme.spacing20),

                            // Quick Actions
                            Row(
                              children: [
                                Expanded(
                                  child: CupertinoButton(
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                    color: AppColors.primary600,
                                    borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                                    onPressed: () {
                                      Get.toNamed('/schedule-interview')?.then((_) => _loadInterviews());
                                    },
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        const Icon(CupertinoIcons.add, size: 18),
                                        const SizedBox(width: 8),
                                        Text(
                                          'Add Interview',
                                          style: AppTypography.button.copyWith(
                                            color: CupertinoColors.white,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(width: AppTheme.spacing12),
                                CupertinoButton(
                                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                                  color: AppColors.iosSystemGrey6,
                                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                                  onPressed: () {
                                    // TODO: Show calendar view
                                  },
                                  child: const Icon(
                                    CupertinoIcons.calendar,
                                    color: AppColors.textPrimary,
                                    size: 20,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Upcoming Interviews Section
                    if (_upcomingInterviews.isNotEmpty) ...[
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                          child: Text(
                            'Upcoming Interviews (${_upcomingInterviews.length})',
                            style: AppTypography.headlineSmall,
                          ),
                        ),
                      ),
                      SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            return Padding(
                              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                              child: _InterviewCard(
                                interview: _upcomingInterviews[index],
                                onTap: () => _showInterviewDetails(_upcomingInterviews[index]),
                              ),
                            );
                          },
                          childCount: _upcomingInterviews.length,
                        ),
                      ),
                    ],

                    // All Interviews Section
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.all(AppTheme.spacing16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'All Interviews',
                                  style: AppTypography.headlineSmall,
                                ),
                                CupertinoButton(
                                  padding: EdgeInsets.zero,
                                  onPressed: () => _showFilterPicker(),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: AppColors.iosSystemGrey6,
                                      borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                                    ),
                                    child: Row(
                                      children: [
                                        Text(
                                          _selectedFilter,
                                          style: AppTypography.bodySmall.copyWith(
                                            color: AppColors.textPrimary,
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                        const Icon(
                                          CupertinoIcons.chevron_down,
                                          size: 14,
                                          color: AppColors.textPrimary,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Interview History List
                    if (_filteredInterviews.isEmpty)
                      SliverToBoxAdapter(
                        child: Container(
                          margin: const EdgeInsets.all(AppTheme.spacing16),
                          padding: const EdgeInsets.all(AppTheme.spacing32),
                          decoration: BoxDecoration(
                            color: AppColors.iosSystemGrey6,
                            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                          ),
                          child: Column(
                            children: [
                              const Icon(
                                CupertinoIcons.calendar,
                                size: 48,
                                color: AppColors.textSecondary,
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'No interviews found',
                                style: AppTypography.bodyMedium.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      )
                    else
                      SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            return _InterviewListItem(
                              interview: _filteredInterviews[index],
                              onTap: () => _showInterviewDetails(_filteredInterviews[index]),
                            );
                          },
                          childCount: _filteredInterviews.length,
                        ),
                      ),

                    // Interview Tips
                    SliverToBoxAdapter(
                      child: Container(
                        margin: const EdgeInsets.all(AppTheme.spacing16),
                        padding: const EdgeInsets.all(AppTheme.spacing16),
                        decoration: BoxDecoration(
                          color: AppColors.primary600.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                          border: Border.all(
                            color: AppColors.primary600.withValues(alpha: 0.3),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(
                                  CupertinoIcons.checkmark_circle,
                                  color: AppColors.primary600,
                                  size: 20,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Interview Preparation Tips',
                                  style: AppTypography.bodyLarge.copyWith(
                                    color: AppColors.primary600,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            _TipItem(
                              title: 'Research the Company',
                              description: 'Learn about the company\'s mission, values, and recent news.',
                            ),
                            const SizedBox(height: 8),
                            _TipItem(
                              title: 'Prepare Your Questions',
                              description: 'Have thoughtful questions ready about the role and company.',
                            ),
                            const SizedBox(height: 8),
                            _TipItem(
                              title: 'Practice Common Questions',
                              description: 'Review typical interview questions and practice your responses.',
                            ),
                            const SizedBox(height: 8),
                            _TipItem(
                              title: 'Test Your Setup',
                              description: 'For video interviews, test your camera, microphone, and internet.',
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SliverToBoxAdapter(child: SizedBox(height: 20)),
                  ],
                ),
      ),
    );
  }

  void _showFilterPicker() {
    final filters = ['All Status', 'Upcoming', 'Completed', 'Cancelled'];
    showCupertinoModalPopup(
      context: context,
      builder: (context) => Container(
        height: 250,
        color: CupertinoColors.systemBackground.resolveFrom(context),
        child: Column(
          children: [
            Container(
              height: 44,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: CupertinoColors.systemGrey6.resolveFrom(context),
                border: Border(
                  bottom: BorderSide(
                    color: CupertinoColors.separator.resolveFrom(context),
                  ),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  CupertinoButton(
                    padding: EdgeInsets.zero,
                    child: const Text('Cancel'),
                    onPressed: () => Navigator.pop(context),
                  ),
                  CupertinoButton(
                    padding: EdgeInsets.zero,
                    child: const Text('Done'),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            Expanded(
              child: CupertinoPicker(
                itemExtent: 40,
                scrollController: FixedExtentScrollController(
                  initialItem: filters.indexOf(_selectedFilter),
                ),
                onSelectedItemChanged: (index) {
                  setState(() => _selectedFilter = filters[index]);
                },
                children: filters.map((filter) => Center(child: Text(filter))).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showInterviewDetails(Interview interview) {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => _InterviewDetailsSheet(interview: interview),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.spacing16),
      decoration: BoxDecoration(
        color: AppColors.iosSystemGrey6,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                ),
                child: Icon(icon, size: 18, color: color),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTypography.headlineLarge.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

class _InterviewCard extends StatelessWidget {
  final Interview interview;
  final VoidCallback onTap;

  const _InterviewCard({
    required this.interview,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        decoration: BoxDecoration(
          color: AppColors.iosSystemGrey6,
          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              interview.applicationId, // TODO: Replace with job title
                              style: AppTypography.bodyLarge.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.primary600.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                            ),
                            child: Text(
                              'Round 1', // TODO: Get from interview
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.primary600,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Company Name', // TODO: Get from application
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.primary600,
                        ),
                      ),
                    ],
                  ),
                ),
                _getStatusIcon(interview.status),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 8,
              children: [
                _InfoChip(
                  icon: CupertinoIcons.calendar,
                  label: DateFormat('MMM d, y').format(interview.scheduledAt),
                ),
                _InfoChip(
                  icon: CupertinoIcons.clock,
                  label: DateFormat('h:mm a').format(interview.scheduledAt),
                ),
                _InfoChip(
                  icon: _getTypeIcon(interview.type),
                  label: interview.type.name.toUpperCase(),
                ),
                _InfoChip(
                  icon: CupertinoIcons.time,
                  label: 'Duration: ${interview.duration}min',
                ),
              ],
            ),
            if (interview.notes != null && interview.notes!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                'Notes: ${interview.notes}',
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            const SizedBox(height: 12),
            Container(
              height: 1,
              color: AppColors.iosSystemGrey4,
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (interview.interviewLink != null)
                  CupertinoButton(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    color: AppColors.primary600,
                    borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                    minSize: 0,
                    onPressed: () {
                      // TODO: Open interview link
                    },
                    child: Text(
                      'Join Meeting',
                      style: AppTypography.bodySmall.copyWith(
                        color: CupertinoColors.white,
                      ),
                    ),
                  ),
                const SizedBox(width: 8),
                CupertinoButton(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  color: AppColors.iosSystemGrey5,
                  borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                  minSize: 0,
                  onPressed: () {
                    // TODO: Reschedule
                  },
                  child: Text(
                    'Reschedule',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                CupertinoButton(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  color: AppColors.iosSystemGrey5,
                  borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                  minSize: 0,
                  onPressed: onTap,
                  child: Text(
                    'Details',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  IconData _getTypeIcon(InterviewType type) {
    switch (type) {
      case InterviewType.video:
        return CupertinoIcons.videocam;
      case InterviewType.technical:
        return CupertinoIcons.gear_alt;
      case InterviewType.hr:
        return CupertinoIcons.person_2;
      default:
        return CupertinoIcons.clock;
    }
  }

  Widget _getStatusIcon(InterviewStatus status) {
    IconData icon;
    Color color;
    
    switch (status) {
      case InterviewStatus.scheduled:
        icon = CupertinoIcons.clock;
        color = const Color(0xFFEAB308);
        break;
      case InterviewStatus.completed:
        icon = CupertinoIcons.check_mark_circled;
        color = AppColors.success;
        break;
      case InterviewStatus.cancelled:
        icon = CupertinoIcons.xmark_circle;
        color = AppColors.error;
        break;
      case InterviewStatus.noShow:
        icon = CupertinoIcons.exclamationmark_triangle;
        color = AppColors.warning;
        break;
      case InterviewStatus.inProgress:
        icon = CupertinoIcons.play_circle;
        color = AppColors.primary600;
        break;
    }

    return Icon(icon, color: color, size: 20);
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _InfoChip({
    required this.icon,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AppColors.textSecondary),
        const SizedBox(width: 4),
        Text(
          label,
          style: AppTypography.bodySmall.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}

class _InterviewListItem extends StatelessWidget {
  final Interview interview;
  final VoidCallback onTap;

  const _InterviewListItem({
    required this.interview,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 1),
        decoration: const BoxDecoration(
          color: AppColors.iosSystemGrey6,
          border: Border(
            bottom: BorderSide(
              color: AppColors.iosSystemGrey4,
              width: 0.5,
            ),
          ),
        ),
        child: Row(
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _getStatusIcon(interview.status),
                const SizedBox(width: 12),
                _getTypeIcon(interview.type),
              ],
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    interview.applicationId, // TODO: Replace with job title
                    style: AppTypography.bodyMedium.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Company Name', // TODO: Get from application
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${interview.interviewerId} • Round 1', // TODO: Get interviewer name
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  DateFormat('MMM d, y').format(interview.scheduledAt),
                  style: AppTypography.bodySmall,
                ),
                const SizedBox(height: 2),
                Text(
                  DateFormat('h:mm a').format(interview.scheduledAt),
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 4),
                _getStatusBadge(interview.status),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _getStatusIcon(InterviewStatus status) {
    IconData icon;
    Color color;
    
    switch (status) {
      case InterviewStatus.scheduled:
        icon = CupertinoIcons.clock;
        color = const Color(0xFFEAB308);
        break;
      case InterviewStatus.completed:
        icon = CupertinoIcons.check_mark_circled;
        color = AppColors.success;
        break;
      case InterviewStatus.cancelled:
        icon = CupertinoIcons.xmark_circle;
        color = AppColors.error;
        break;
      case InterviewStatus.noShow:
        icon = CupertinoIcons.exclamationmark_triangle;
        color = AppColors.warning;
        break;
      case InterviewStatus.inProgress:
        icon = CupertinoIcons.play_circle;
        color = AppColors.primary600;
        break;
    }

    return Icon(icon, color: color, size: 20);
  }

  Widget _getTypeIcon(InterviewType type) {
    IconData icon;
    Color color;
    
    switch (type) {
      case InterviewType.video:
        icon = CupertinoIcons.videocam;
        color = AppColors.primary600;
        break;
      case InterviewType.technical:
        icon = CupertinoIcons.gear_alt;
        color = AppColors.success;
        break;
      case InterviewType.hr:
        icon = CupertinoIcons.person_2;
        color = const Color(0xFF9333EA);
        break;
      default:
        icon = CupertinoIcons.clock;
        color = AppColors.textSecondary;
    }

    return Icon(icon, color: color, size: 20);
  }

  Widget _getStatusBadge(InterviewStatus status) {
    String text;
    Color backgroundColor;
    Color textColor;
    
    switch (status) {
      case InterviewStatus.scheduled:
        text = 'Upcoming';
        backgroundColor = const Color(0xFFEAB308).withValues(alpha: 0.1);
        textColor = const Color(0xFFEAB308);
        break;
      case InterviewStatus.completed:
        text = 'Completed';
        backgroundColor = AppColors.success.withValues(alpha: 0.1);
        textColor = AppColors.success;
        break;
      case InterviewStatus.cancelled:
        text = 'Cancelled';
        backgroundColor = AppColors.error.withValues(alpha: 0.1);
        textColor = AppColors.error;
        break;
      case InterviewStatus.noShow:
        text = 'No Show';
        backgroundColor = AppColors.warning.withValues(alpha: 0.1);
        textColor = AppColors.warning;
        break;
      case InterviewStatus.inProgress:
        text = 'In Progress';
        backgroundColor = AppColors.primary600.withValues(alpha: 0.1);
        textColor = AppColors.primary600;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(AppTheme.radiusSm),
      ),
      child: Text(
        text,
        style: AppTypography.bodySmall.copyWith(
          color: textColor,
          fontWeight: FontWeight.w600,
          fontSize: 11,
        ),
      ),
    );
  }
}

class _TipItem extends StatelessWidget {
  final String title;
  final String description;

  const _TipItem({
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: AppTypography.bodySmall.copyWith(
            color: AppColors.primary600,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          description,
          style: AppTypography.bodySmall.copyWith(
            color: AppColors.primary600.withValues(alpha: 0.8),
          ),
        ),
      ],
    );
  }
}

class _InterviewDetailsSheet extends StatelessWidget {
  final Interview interview;

  const _InterviewDetailsSheet({required this.interview});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: BoxDecoration(
        color: CupertinoColors.systemBackground.resolveFrom(context),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
      ),
      child: Column(
        children: [
          // Handle bar
          Container(
            margin: const EdgeInsets.symmetric(vertical: 8),
            width: 36,
            height: 5,
            decoration: BoxDecoration(
              color: CupertinoColors.systemGrey3.resolveFrom(context),
              borderRadius: BorderRadius.circular(2.5),
            ),
          ),
          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Interview Details',
                  style: AppTypography.headlineSmall,
                ),
                CupertinoButton(
                  padding: EdgeInsets.zero,
                  onPressed: () => Navigator.pop(context),
                  child: const Icon(CupertinoIcons.xmark_circle_fill),
                ),
              ],
            ),
          ),
          Container(
            height: 1,
            color: AppColors.iosSystemGrey4,
          ),
          // Content
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _DetailRow(
                  label: 'Scheduled At',
                  value: DateFormat('MMM d, y - h:mm a').format(interview.scheduledAt),
                ),
                _DetailRow(label: 'Duration', value: '${interview.duration} minutes'),
                _DetailRow(label: 'Type', value: interview.type.name.toUpperCase()),
                _DetailRow(label: 'Status', value: interview.status.name.toUpperCase()),
                if (interview.notes != null && interview.notes!.isNotEmpty)
                  _DetailRow(label: 'Notes', value: interview.notes!),
                if (interview.feedback != null && interview.feedback!.isNotEmpty)
                  _DetailRow(label: 'Feedback', value: interview.feedback!),
                if (interview.rating != null)
                  _DetailRow(label: 'Rating', value: '${interview.rating}/5'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow({
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: AppTypography.bodyMedium.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
