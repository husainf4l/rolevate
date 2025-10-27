import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/models/models.dart';
import 'package:rolevateapp/services/job_service.dart';
import 'package:rolevateapp/services/application_service.dart';

class JobController extends GetxController {
  final JobService _jobService = JobService();
  final ApplicationService _applicationService = ApplicationService();

  // Observable state
  final RxList<Job> jobs = <Job>[].obs;
  final RxList<SavedJob> savedJobs = <SavedJob>[].obs;
  final RxList<Application> myApplications = <Application>[].obs;
  final Rx<Job?> currentJob = Rx<Job?>(null);
  final RxBool isLoading = false.obs;
  final RxBool isLoadingMore = false.obs;
  final RxString error = ''.obs;

  // Filters
  final Rx<JobType?> selectedType = Rx<JobType?>(null);
  final Rx<JobLevel?> selectedLevel = Rx<JobLevel?>(null);
  final Rx<WorkType?> selectedWorkType = Rx<WorkType?>(null);
  final RxString searchLocation = ''.obs;
  final RxString searchDepartment = ''.obs;
  final RxBool featuredOnly = false.obs;

  // Pagination
  final RxInt currentPage = 0.obs;
  final RxInt pageSize = 20.obs;
  final RxBool hasMore = true.obs;

  // Saved job IDs for quick lookup
  final RxSet<String> savedJobIds = <String>{}.obs;

  @override
  void onInit() {
    super.onInit();
    fetchJobs();
    // Don't auto-fetch saved jobs on init - let screens fetch when needed
    // fetchSavedJobs();
    fetchMyApplications();
  }

  /// Fetch jobs with current filters
  Future<void> fetchJobs({bool loadMore = false}) async {
    if (loadMore) {
      if (!hasMore.value || isLoadingMore.value) return;
      isLoadingMore.value = true;
    } else {
      isLoading.value = true;
      currentPage.value = 0;
      hasMore.value = true;
      error.value = '';
    }

    try {
      final page = loadMore ? currentPage.value + 1 : 1;

      final fetchedJobs = await _jobService.getJobs(
        type: selectedType.value,
        jobLevel: selectedLevel.value,
        workType: selectedWorkType.value,
        status: JobStatus.active,
        location: searchLocation.value.isNotEmpty ? searchLocation.value : null,
        department: searchDepartment.value.isNotEmpty ? searchDepartment.value : null,
        featured: featuredOnly.value ? true : null,
        limit: pageSize.value,
        page: page,
      );

      if (loadMore) {
        jobs.addAll(fetchedJobs);
        currentPage.value++;
      } else {
        jobs.assignAll(fetchedJobs);
        currentPage.value = 1;
      }

      hasMore.value = fetchedJobs.length >= pageSize.value;
    } catch (e) {
      error.value = e.toString();
      debugPrint('❌ Error fetching jobs: $e');
      
      // Show user-friendly error message
      Get.snackbar(
        'Error Loading Jobs',
        'Failed to load jobs. Please try again.',
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 3),
      );
    } finally {
      isLoading.value = false;
      isLoadingMore.value = false;
    }
  }

  /// Fetch a single job by ID
  Future<void> fetchJob(String id) async {
    isLoading.value = true;
    error.value = '';

    try {
      final job = await _jobService.getJob(id);
      currentJob.value = job;
    } catch (e) {
      error.value = e.toString();
      debugPrint('Error fetching job: $e');
    } finally {
      isLoading.value = false;
    }
  }

  /// Fetch a single job by slug
  Future<void> fetchJobBySlug(String slug) async {
    isLoading.value = true;
    error.value = '';

    try {
      final job = await _jobService.getJobBySlug(slug);
      currentJob.value = job;
    } catch (e) {
      error.value = e.toString();
      debugPrint('Error fetching job by slug: $e');
    } finally {
      isLoading.value = false;
    }
  }

  /// Save/bookmark a job
  Future<bool> saveJob(String jobId, {String? notes}) async {
    try {
      final success = await _jobService.saveJob(jobId, notes: notes);
      if (success) {
        savedJobIds.add(jobId);
        
        // Find the job in the jobs list and add it to savedJobs
        final job = jobs.firstWhereOrNull((j) => j.id == jobId);
        if (job != null) {
          // Create a SavedJob entry
          final savedJob = SavedJob(
            id: 'saved_${DateTime.now().millisecondsSinceEpoch}',
            userId: 'current_user',
            jobId: jobId,
            savedAt: DateTime.now(),
            notes: notes,
            job: job,
          );
          
          // Add to the beginning of the list
          savedJobs.insert(0, savedJob);
          debugPrint('✅ Job added to savedJobs list, total: ${savedJobs.length}');
        }
      }
      return success;
    } catch (e) {
      debugPrint('Error saving job: $e');
      return false;
    }
  }

  /// Unsave/unbookmark a job
  Future<bool> unsaveJob(String jobId) async {
    try {
      final success = await _jobService.unsaveJob(jobId);
      if (success) {
        savedJobIds.remove(jobId);
        
        // Remove from savedJobs list
        savedJobs.removeWhere((savedJob) => savedJob.jobId == jobId);
        
        debugPrint('✅ Job removed from savedJobs list, total: ${savedJobs.length}');
      }
      return success;
    } catch (e) {
      debugPrint('Error unsaving job: $e');
      return false;
    }
  }

  /// Toggle save status of a job
  Future<bool> toggleSaveJob(String jobId, {String? notes}) async {
    final wasSaved = isJobSaved(jobId);
    
    if (wasSaved) {
      final success = await unsaveJob(jobId);
      if (success) {
        debugPrint('✅ Job unsaved successfully, total saved jobs: ${savedJobs.length}');
        Get.snackbar(
          'Job Removed',
          'Job removed from saved jobs',
          snackPosition: SnackPosition.BOTTOM,
          duration: const Duration(seconds: 2),
        );
      } else {
        Get.snackbar(
          'Error',
          'Failed to remove job. Please try again.',
          snackPosition: SnackPosition.BOTTOM,
          duration: const Duration(seconds: 3),
        );
      }
      return success;
    } else {
      final success = await saveJob(jobId, notes: notes);
      if (success) {
        debugPrint('✅ Job saved successfully, total saved jobs: ${savedJobs.length}');
        Get.snackbar(
          'Job Saved',
          'Job added to your saved jobs',
          snackPosition: SnackPosition.BOTTOM,
          duration: const Duration(seconds: 2),
        );
      } else {
        Get.snackbar(
          'Error',
          'Failed to save job. Please try again.',
          snackPosition: SnackPosition.BOTTOM,
          duration: const Duration(seconds: 3),
        );
      }
      return success;
    }
  }

  /// Check if a job is saved
  bool isJobSaved(String jobId) {
    return savedJobIds.contains(jobId);
  }

  /// Fetch all saved jobs
  Future<void> fetchSavedJobs() async {
    try {
      debugPrint('🔄 Fetching saved jobs from API...');
      final saved = await _jobService.getSavedJobs();
      debugPrint('📦 Received ${saved.length} saved jobs from API');
      
      savedJobs.assignAll(saved);
      
      // Update saved job IDs set
      savedJobIds.clear();
      for (final savedJob in saved) {
        savedJobIds.add(savedJob.jobId);
        debugPrint('  - Saved job: ${savedJob.job?.title ?? savedJob.jobId}');
      }
      
      debugPrint('✅ Saved jobs updated: ${savedJobIds.length} total');
    } catch (e) {
      debugPrint('❌ Error fetching saved jobs: $e');
    }
  }

  /// Fetch user's applications
  Future<void> fetchMyApplications() async {
    try {
      final applications = await _applicationService.getMyApplications();
      myApplications.assignAll(applications);
    } catch (e) {
      debugPrint('Error fetching applications: $e');
    }
  }

  /// Check if user has already applied to a job
  bool hasApplied(String jobId) {
    return myApplications.any((app) => app.job.id == jobId);
  }

  /// Apply filters
  void applyFilters({
    JobType? type,
    JobLevel? level,
    WorkType? workType,
    String? location,
    String? department,
    bool? featured,
  }) {
    selectedType.value = type;
    selectedLevel.value = level;
    selectedWorkType.value = workType;
    searchLocation.value = location ?? '';
    searchDepartment.value = department ?? '';
    featuredOnly.value = featured ?? false;
    fetchJobs();
  }

  /// Clear all filters
  void clearFilters() {
    selectedType.value = null;
    selectedLevel.value = null;
    selectedWorkType.value = null;
    searchLocation.value = '';
    searchDepartment.value = '';
    featuredOnly.value = false;
    fetchJobs();
  }

  /// Check if any filters are active
  bool get hasActiveFilters {
    return selectedType.value != null ||
        selectedLevel.value != null ||
        selectedWorkType.value != null ||
        searchLocation.value.isNotEmpty ||
        searchDepartment.value.isNotEmpty ||
        featuredOnly.value;
  }

  /// Get filter count
  int get activeFilterCount {
    int count = 0;
    if (selectedType.value != null) count++;
    if (selectedLevel.value != null) count++;
    if (selectedWorkType.value != null) count++;
    if (searchLocation.value.isNotEmpty) count++;
    if (searchDepartment.value.isNotEmpty) count++;
    if (featuredOnly.value) count++;
    return count;
  }
}
