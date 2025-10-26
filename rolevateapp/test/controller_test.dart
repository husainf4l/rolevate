import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/controllers/job_controller.dart';
import 'package:rolevateapp/services/job_service.dart';
import 'package:rolevateapp/models/enums.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    // Initialize controllers like in main.dart
    Get.put(AuthController());
    Get.put(JobController());
  });

  tearDown(() {
    Get.reset();
  });

  test('Controllers are properly initialized', () {
    // Test that controllers can be found
    final authController = Get.find<AuthController>();
    final jobController = Get.find<JobController>();

    expect(authController, isNotNull);
    expect(jobController, isNotNull);
  });

  test('JobController can fetch jobs', () async {
    final jobController = Get.find<JobController>();

    // This should work with our mock implementation
    await jobController.fetchJobs();

    // Check that jobs list is populated (mock data)
    expect(jobController.jobs.isNotEmpty, true);
  });

  test('JobService can create and retrieve jobs', () async {
    final jobService = JobService();

    // Create a test job
    final testJob = await jobService.createJob(
      title: 'Test Job',
      department: 'Engineering',
      location: 'Test Location',
      salary: '50000',
      type: JobType.fullTime,
      jobLevel: JobLevel.mid,
      workType: WorkType.remote,
      description: 'Test Description',
      shortDescription: 'Test Short Description',
      deadline: DateTime.now().add(const Duration(days: 30)),
    );

    expect(testJob, isNotNull);
    expect(testJob.title, 'Test Job');
    expect(testJob.description, 'Test Description');

    // Test retrieval
    final retrievedJob = await jobService.getJob(testJob.id);
    expect(retrievedJob!.id, testJob.id);
    expect(retrievedJob.title, 'Test Job');
  });
}