import 'package:flutter/cupertino.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:rolevateapp/services/graphql_service.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/job_controller.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';

class JobDetailScreen extends StatefulWidget {
  final String jobId;

  const JobDetailScreen({super.key, required this.jobId});

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  final JobController jobController = Get.find<JobController>();
  final AuthController authController = Get.find<AuthController>();
  
  final bool _isApplying = false;
  bool _hasApplied = false;

  @override
  void initState() {
    super.initState();
    // Check if user has already applied to this job
    _checkApplicationStatus();
  }

  void _checkApplicationStatus() {
    _hasApplied = jobController.hasApplied(widget.jobId);
  }
    @override
  Widget build(BuildContext context) {
    return Query(
      options: QueryOptions(
        document: gql(GraphQLService.jobByIdQuery),
        variables: {'id': widget.jobId},
      ),
      builder: (QueryResult result, {VoidCallback? refetch, FetchMore? fetchMore}) {
        if (result.hasException) {
          return CupertinoPageScaffold(
            navigationBar: const CupertinoNavigationBar(
              middle: Text('Job Details'),
            ),
            child: Center(
              child: Text('Error: ${result.exception.toString()}'),
            ),
          );
        }

        if (result.isLoading) {
          return const CupertinoPageScaffold(
            navigationBar: CupertinoNavigationBar(
              middle: Text('Job Details'),
            ),
            child: Center(
              child: CupertinoActivityIndicator(),
            ),
          );
        }

        final job = result.data?['job'];
        if (job == null) {
          return const CupertinoPageScaffold(
            navigationBar: CupertinoNavigationBar(
              middle: Text('Job Details'),
            ),
            child: Center(
              child: Text('Job not found'),
            ),
          );
        }

        return CupertinoPageScaffold(
          navigationBar: CupertinoNavigationBar(
            middle: Text(job['title']),
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
                          color: CupertinoColors.systemGrey6,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Icon(
                          CupertinoIcons.building_2_fill,
                          color: CupertinoColors.systemBlue,
                          size: 32,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              job['company']?['name'] ?? 'Company',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              job['location'] ?? 'Location',
                              style: const TextStyle(
                                fontSize: 14,
                                color: CupertinoColors.systemGrey,
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
                    job['title'],
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Tags
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildTag(job['type'] ?? 'Full-time'),
                      _buildTag(job['workType'] ?? 'On-site'),
                      _buildTag(job['jobLevel'] ?? 'Mid-level'),
                    ],
                  ),
                  const SizedBox(height: 24),
                  // Salary
                  _buildSection(
                    'Salary',
                    job['salary'] ?? 'Competitive salary',
                  ),
                  const SizedBox(height: 20),
                  // Description
                  _buildSection(
                    'Description',
                    job['description'] ?? 'No description available',
                  ),
                  const SizedBox(height: 20),
                  // Responsibilities
                  if (job['responsibilities'] != null)
                    _buildSection(
                      'Responsibilities',
                      job['responsibilities'],
                    ),
                  const SizedBox(height: 20),
                  // Requirements
                  if (job['requirements'] != null)
                    _buildSection(
                      'Requirements',
                      job['requirements'],
                    ),
                  const SizedBox(height: 20),
                  // Benefits
                  if (job['benefits'] != null)
                    _buildSection(
                      'Benefits',
                      job['benefits'],
                    ),
                  const SizedBox(height: 40),
                  // Apply button
                  SizedBox(
                    width: double.infinity,
                    child: CupertinoButton(
                      color: _hasApplied ? AppColors.iosSystemGrey : AppColors.primary600,
                      borderRadius: BorderRadius.circular(12),
                      onPressed: _hasApplied || _isApplying ? null : () {
                        Get.toNamed('/job-application', arguments: {
                          'jobId': widget.jobId,
                          'jobTitle': job['title'] ?? 'Job Title',
                          'companyName': job['company']?['name'] ?? 'Company Name',
                        });
                      },
                      child: _isApplying
                          ? const CupertinoActivityIndicator(color: CupertinoColors.white)
                          : Text(
                              _hasApplied ? 'Already Applied' : 'Apply Now',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: CupertinoColors.white,
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildTag(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: CupertinoColors.systemBlue.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: CupertinoColors.systemBlue,
        ),
      ),
    );
  }

  Widget _buildSection(String title, String content) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          content,
          style: const TextStyle(
            fontSize: 16,
            color: CupertinoColors.systemGrey,
            height: 1.5,
          ),
        ),
      ],
    );
  }
}
