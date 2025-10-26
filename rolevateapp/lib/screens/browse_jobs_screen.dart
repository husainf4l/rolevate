import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/job_controller.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/widgets/job_card.dart';
import 'package:rolevateapp/models/models.dart';

class BrowseJobsScreen extends StatefulWidget {
  const BrowseJobsScreen({super.key});

  @override
  State<BrowseJobsScreen> createState() => _BrowseJobsScreenState();
}

class _BrowseJobsScreenState extends State<BrowseJobsScreen> {
  final JobController jobController = Get.find<JobController>();
  final TextEditingController _searchController = TextEditingController();

  // Filter states
  JobType? _selectedType;
  WorkType? _selectedWorkType;

  @override
  void initState() {
    super.initState();
    // Initialize with current filter values from controller
    _selectedType = jobController.selectedType.value;
    _selectedWorkType = jobController.selectedWorkType.value;
    
    // Set up search controller listener
    _searchController.addListener(_onSearchChanged);
    
    // Check if search query was passed as argument
    final args = Get.arguments as Map<String, dynamic>?;
    if (args != null && args.containsKey('search')) {
      final searchQuery = args['search'] as String;
      _searchController.text = searchQuery;
      // Trigger search
      _onSearchChanged();
    }
    
    // Fetch jobs if not already loaded
    if (jobController.jobs.isEmpty) {
      jobController.fetchJobs();
    }
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    // Debounce search - implement if needed
    final query = _searchController.text.trim();
    if (query.isNotEmpty) {
      // For now, we'll search by department or location
      // In a full implementation, you'd want a dedicated search endpoint
      jobController.searchDepartment.value = query;
      jobController.fetchJobs();
    } else {
      jobController.searchDepartment.value = '';
      jobController.fetchJobs();
    }
  }

  void _onFilterChanged(JobType? type, WorkType? workType) {
    setState(() {
      _selectedType = type;
      _selectedWorkType = workType;
    });
    
    // Apply filters through job controller
    jobController.applyFilters(
      type: type,
      workType: workType,
    );
  }

  void _clearFilters() {
    setState(() {
      _selectedType = null;
      _selectedWorkType = null;
    });
    
    jobController.clearFilters();
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: Text('Browse Jobs'),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          child: const Icon(CupertinoIcons.back),
          onPressed: () => Get.back(),
        ),
      ),
      child: SafeArea(
        child: Column(
          children: [
            // Search bar
            Padding(
              padding: const EdgeInsets.all(AppTheme.spacing16),
              child: CupertinoSearchTextField(
                controller: _searchController,
                placeholder: 'Search jobs, companies, or keywords...',
                onChanged: (value) {
                  _onSearchChanged();
                },
                onSubmitted: (value) {
                  _onSearchChanged();
                },
              ),
            ),

            // Filter buttons (placeholder for now)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacing16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Filter header with clear button
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Filters',
                        style: AppTypography.headlineSmall,
                      ),
                      if (jobController.hasActiveFilters)
                        CupertinoButton(
                          padding: EdgeInsets.zero,
                          onPressed: _clearFilters,
                          child: Text(
                            'Clear All',
                            style: AppTypography.button.copyWith(
                              color: AppColors.primary600,
                              fontSize: 14,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: AppTheme.spacing8),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildFilterChip('All', _selectedType == null && _selectedWorkType == null, () {
                          _onFilterChanged(null, null);
                        }),
                        const SizedBox(width: AppTheme.spacing8),
                        _buildFilterChip('Full-time', _selectedType == JobType.fullTime, () {
                          _onFilterChanged(_selectedType == JobType.fullTime ? null : JobType.fullTime, _selectedWorkType);
                        }),
                        const SizedBox(width: AppTheme.spacing8),
                        _buildFilterChip('Part-time', _selectedType == JobType.partTime, () {
                          _onFilterChanged(_selectedType == JobType.partTime ? null : JobType.partTime, _selectedWorkType);
                        }),
                        const SizedBox(width: AppTheme.spacing8),
                        _buildFilterChip('Remote', _selectedWorkType == WorkType.remote, () {
                          _onFilterChanged(_selectedType, _selectedWorkType == WorkType.remote ? null : WorkType.remote);
                        }),
                        const SizedBox(width: AppTheme.spacing8),
                        _buildFilterChip('On-site', _selectedWorkType == WorkType.onsite, () {
                          _onFilterChanged(_selectedType, _selectedWorkType == WorkType.onsite ? null : WorkType.onsite);
                        }),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Jobs list
            Expanded(
              child: Obx(() {
                if (jobController.isLoading.value) {
                  return const Center(
                    child: CupertinoActivityIndicator(),
                  );
                }

                if (jobController.error.value.isNotEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          CupertinoIcons.exclamationmark_triangle,
                          size: 48,
                          color: AppColors.error,
                        ),
                        const SizedBox(height: AppTheme.spacing16),
                        Text(
                          'Error loading jobs',
                          style: AppTypography.headlineMedium,
                        ),
                        const SizedBox(height: AppTheme.spacing8),
                        Text(
                          jobController.error.value,
                          style: AppTypography.bodyMedium.copyWith(
                            color: AppColors.textSecondary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: AppTheme.spacing16),
                        CupertinoButton(
                          color: AppColors.primary600,
                          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                          child: Text(
                            'Retry',
                            style: AppTypography.button.copyWith(
                              color: CupertinoColors.white,
                            ),
                          ),
                          onPressed: () => jobController.fetchJobs(),
                        ),
                      ],
                    ),
                  );
                }

                if (jobController.jobs.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          CupertinoIcons.briefcase,
                          size: 48,
                          color: AppColors.iosSystemGrey,
                        ),
                        const SizedBox(height: AppTheme.spacing16),
                        Text(
                          'No jobs available',
                          style: AppTypography.headlineMedium,
                        ),
                        const SizedBox(height: AppTheme.spacing8),
                        Text(
                          'Check back later for new opportunities',
                          style: AppTypography.bodyMedium.copyWith(
                            color: AppColors.textSecondary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: AppTheme.spacing16),
                        CupertinoButton(
                          color: AppColors.primary600,
                          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                          child: Text(
                            'Refresh',
                            style: AppTypography.button.copyWith(
                              color: CupertinoColors.white,
                            ),
                          ),
                          onPressed: () => jobController.fetchJobs(),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(AppTheme.spacing16),
                  itemCount: jobController.jobs.length,
                  itemBuilder: (context, index) {
                    final job = jobController.jobs[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: AppTheme.spacing16),
                      child: JobCard(job: job),
                    );
                  },
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isSelected, VoidCallback onPressed) {
    return CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: onPressed,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppTheme.spacing16,
          vertical: AppTheme.spacing8,
        ),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary600 : AppColors.iosSystemGrey6,
          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        ),
        child: Text(
          label,
          style: AppTypography.bodyMedium.copyWith(
            color: isSelected ? CupertinoColors.white : AppColors.textPrimary,
          ),
        ),
      ),
    );
  }
}