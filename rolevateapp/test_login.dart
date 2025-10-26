import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/controllers/job_controller.dart';
import 'package:rolevateapp/services/graphql_service.dart';
import 'package:rolevateapp/services/job_service.dart';
import 'package:rolevateapp/services/application_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize GetStorage
  await GetStorage.init();

  // Initialize GraphQL
  GraphQLService.initialize('https://rolevate.com/api/graphql');

  // Initialize controllers
  Get.put(AuthController());
  Get.put(JobController());

  // Test login
  await testLogin();
}

Future<void> testLogin() async {
  final authController = Get.find<AuthController>();

  debugPrint('🔐 Testing login with provided credentials...');

  try {
    await authController.login('shadialblaawe@gmail.com', 'Shadi1234*');

    // Wait a bit for the login to complete
    await Future.delayed(const Duration(seconds: 2));

    if (authController.isAuthenticated.value) {
      debugPrint('✅ Login successful!');
      debugPrint('👤 User: ${authController.user.value}');
      debugPrint('🔑 Token: ${authController.token.value.substring(0, 20)}...');

      // Test dashboard data loading
      await testDashboardData();
    } else {
      debugPrint('❌ Login failed');
    }
  } catch (e) {
    debugPrint('❌ Login error: $e');
  }
}

Future<void> testDashboardData() async {
  final authController = Get.find<AuthController>();
  final jobController = Get.find<JobController>();
  final jobService = JobService();
  final applicationService = ApplicationService();

  final userType = authController.user.value?['userType'] as String?;
  debugPrint('🎯 Testing dashboard for user type: $userType');

  try {
    if (userType?.toLowerCase() == 'candidate') {
      debugPrint('📊 Testing Candidate Dashboard...');

      // Test fetching jobs
      await jobController.fetchJobs();
      debugPrint('✅ Jobs fetched: ${jobController.jobs.length} jobs');

      // Test fetching saved jobs
      await jobController.fetchSavedJobs();
      debugPrint('✅ Saved jobs: ${jobController.savedJobs.length} jobs');

      // Test fetching applications
      await jobController.fetchMyApplications();
      debugPrint('✅ My applications: ${jobController.myApplications.length} applications');

    } else if (userType?.toLowerCase() == 'business') {
      debugPrint('📊 Testing Business Dashboard...');

      // Test fetching company jobs
      final companyJobs = await jobService.getCompanyJobs();
      debugPrint('✅ Company jobs: ${companyJobs.length} jobs');

      // Test fetching applications for company jobs
      List applications = [];
      for (var job in companyJobs.take(3)) { // Test first 3 jobs
        try {
          final apps = await applicationService.getApplicationsByJob(job.id);
          applications.addAll(apps);
          debugPrint('✅ Applications for job "${job.title}": ${apps.length}');
        } catch (e) {
          debugPrint('⚠️ Error fetching applications for job ${job.id}: $e');
        }
      }

      debugPrint('✅ Total applications across jobs: ${applications.length}');

    } else {
      debugPrint('❓ Unknown user type: $userType');
    }

    debugPrint('🎉 Dashboard data test completed successfully!');

  } catch (e) {
    debugPrint('❌ Dashboard data test failed: $e');
  }
}