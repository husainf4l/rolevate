import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/job_controller.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/services/job_service.dart';
import 'package:rolevateapp/models/models.dart';

class JobDetailScreen extends StatefulWidget {
  final String jobId;

  const JobDetailScreen({super.key, required this.jobId});

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  final JobController jobController = Get.find<JobController>();
  final AuthController authController = Get.find<AuthController>();
  final _jobService = JobService();
  
  bool _isLoading = true;
  Job? _job;
  String? _errorMessage;
  bool _hasApplied = false;

  @override
  void initState() {
    super.initState();
    _loadJob();
  }
  
  Future<void> _loadJob() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    
    try {
      final job = await _jobService.getJob(widget.jobId);
      
      if (job == null) {
        setState(() {
          _errorMessage = 'Job not found';
          _isLoading = false;
        });
        return;
      }
      
      setState(() {
        _job = job;
        _isLoading = false;
      });
      
      // Check if user has already applied
      _checkApplicationStatus();
    } catch (e) {
      debugPrint('❌ Error loading job: $e');
      setState(() {
        _errorMessage = 'Failed to load job details';
        _isLoading = false;
      });
    }
  }

  void _checkApplicationStatus() {
    _hasApplied = jobController.hasApplied(widget.jobId);
  }
  
  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const CupertinoPageScaffold(
        navigationBar: CupertinoNavigationBar(
          middle: Text('Job Details'),
        ),
        child: Center(
          child: CupertinoActivityIndicator(),
        ),
      );
    }
    
    if (_errorMessage != null || _job == null) {
      return CupertinoPageScaffold(
        navigationBar: const CupertinoNavigationBar(
          middle: Text('Job Details'),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                CupertinoIcons.exclamationmark_triangle,
                size: 64,
                color: AppColors.error,
              ),
              const SizedBox(height: 16),
              Text(_errorMessage ?? 'Job not found'),
              const SizedBox(height: 24),
              CupertinoButton(
                color: AppColors.primary600,
                onPressed: () => Get.back(),
                child: const Text('Go Back'),
              ),
            ],
          ),
        ),
      );
    }
    
    final job = _job!;
    
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: Text(job.title),
        trailing: Obx(() => CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () {
            jobController.toggleSaveJob(widget.jobId);
          },
          child: Icon(
            jobController.isJobSaved(widget.jobId)
                ? CupertinoIcons.bookmark_fill
                : CupertinoIcons.bookmark,
            color: jobController.isJobSaved(widget.jobId)
                ? AppColors.primary600
                : AppColors.textTertiary,
            size: 20,
          ),
        )),
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Company info
              Row(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: AppColors.iosSystemGrey5,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      CupertinoIcons.building_2_fill,
                      color: AppColors.primary600,
                      size: 30,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          job.company.name,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          job.location,
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              
              // Job title
              Text(
                job.title,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              
              // Job meta info
              Wrap(
                spacing: 12,
                runSpacing: 8,
                children: [
                  _buildInfoChip(CupertinoIcons.briefcase, job.type.displayName),
                  _buildInfoChip(CupertinoIcons.location, job.location),
                  _buildInfoChip(CupertinoIcons.money_dollar, job.salary),
                ],
              ),
              const SizedBox(height: 24),
              
              // Short description
              Text(
                job.shortDescription,
                style: const TextStyle(
                  fontSize: 16,
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
              
              // Description
              if (job.description != null && job.description!.isNotEmpty) ...[
                const Text(
                  'About the Job',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  job.description!,
                  style: const TextStyle(
                    fontSize: 16,
                    color: AppColors.textSecondary,
                    height: 1.6,
                  ),
                ),
                const SizedBox(height: 24),
              ],
              
              // Responsibilities
              if (job.responsibilities != null && job.responsibilities!.isNotEmpty) ...[
                const Text(
                  'Responsibilities',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  job.responsibilities!,
                  style: const TextStyle(
                    fontSize: 16,
                    color: AppColors.textSecondary,
                    height: 1.6,
                  ),
                ),
                const SizedBox(height: 24),
              ],
              
              // Requirements
              if (job.requirements != null && job.requirements!.isNotEmpty) ...[
                const Text(
                  'Requirements',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  job.requirements!,
                  style: const TextStyle(
                    fontSize: 16,
                    color: AppColors.textSecondary,
                    height: 1.6,
                  ),
                ),
                const SizedBox(height: 24),
              ],
              
              // Benefits
              if (job.benefits != null && job.benefits!.isNotEmpty) ...[
                const Text(
                  'Benefits',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  job.benefits!,
                  style: const TextStyle(
                    fontSize: 16,
                    color: AppColors.textSecondary,
                    height: 1.6,
                  ),
                ),
                const SizedBox(height: 24),
              ],
              
              // Skills
              if (job.skills != null && job.skills!.isNotEmpty) ...[
                const Text(
                  'Required Skills',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: job.skills!.map((skill) => Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primary600.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      skill,
                      style: const TextStyle(
                        color: AppColors.primary600,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  )).toList(),
                ),
                const SizedBox(height: 32),
              ],
              
              // Apply button (only for candidates)
              if (authController.user.value?['userType'] == 'CANDIDATE')
                SizedBox(
                  width: double.infinity,
                  child: CupertinoButton(
                    color: _hasApplied ? AppColors.iosSystemGrey : AppColors.primary600,
                    onPressed: _hasApplied ? null : () {
                      Get.toNamed('/job-application', arguments: {
                        'jobId': widget.jobId,
                        'jobTitle': _job?.title ?? 'Job',
                        'companyName': _job?.company.name ?? 'Company',
                      });
                    },
                    child: Text(
                      _hasApplied ? 'Already Applied' : 'Apply Now',
                      style: const TextStyle(
                        color: CupertinoColors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildInfoChip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.iosSystemGrey6,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: AppColors.textSecondary),
          const SizedBox(width: 6),
          Text(
            text,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}
