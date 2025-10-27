import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/controllers/job_controller.dart';
import 'package:rolevateapp/controllers/theme_controller.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/services/graphql_service.dart';
import 'package:rolevateapp/screens/home_screen.dart';
import 'package:rolevateapp/screens/login_screen.dart';
import 'package:rolevateapp/screens/signup_screen.dart';
import 'package:rolevateapp/screens/job_detail_screen.dart';
import 'package:rolevateapp/screens/business_dashboard_screen.dart';
import 'package:rolevateapp/screens/candidate_dashboard_screen.dart';
import 'package:rolevateapp/screens/profile_screen.dart';
import 'package:rolevateapp/screens/business/post_job_screen.dart';
import 'package:rolevateapp/screens/business/business_jobs_screen.dart';
import 'package:rolevateapp/screens/business/applications_screen.dart';
import 'package:rolevateapp/screens/business/schedule_interview_screen.dart';
import 'package:rolevateapp/screens/business/interviews_screen.dart';
import 'package:rolevateapp/screens/browse_jobs_screen.dart';
import 'package:rolevateapp/screens/saved_jobs_screen.dart';
import 'package:rolevateapp/screens/notifications_screen.dart';
import 'package:rolevateapp/screens/settings_screen.dart';
import 'package:rolevateapp/screens/my_applications_screen.dart';
import 'package:rolevateapp/screens/edit_profile_screen.dart';
import 'package:rolevateapp/screens/change_password_screen.dart';
import 'package:rolevateapp/screens/company_settings_screen.dart';
import 'package:rolevateapp/screens/job_application_screen.dart';
import 'package:rolevateapp/screens/help_support_screen.dart';
import 'package:rolevateapp/screens/about_screen.dart';
import 'package:rolevateapp/screens/privacy_security_screen.dart';
import 'package:rolevateapp/screens/notification_preferences_screen.dart';
import 'package:rolevateapp/screens/dark_mode_settings_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize storage
  await GetStorage.init();
  
  // Initialize Hive for GraphQL
  await initHiveForFlutter();

  // Initialize GraphQL service
  GraphQLService.initialize('https://rolevate.com/api/graphql');
  
  // Initialize controllers
  Get.put(AuthController());
  Get.put(JobController());
  Get.put(ThemeController());

  runApp(const MyApp());
}

// Middleware to restrict access to business users only
class BusinessOnlyMiddleware extends GetMiddleware {
  @override
  RouteSettings? redirect(String? route) {
    final authController = Get.find<AuthController>();
    
    if (!authController.isAuthenticated.value || authController.user.value == null) {
      // Not authenticated, redirect to login
      return const RouteSettings(name: '/login');
    }
    
    final userType = authController.user.value!['userType'] as String?;
    if (userType?.toLowerCase() != 'business') {
      // Not a business user, redirect to appropriate dashboard
      Get.snackbar(
        'Access Denied',
        'This feature is only available for business accounts',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: CupertinoColors.destructiveRed,
        colorText: CupertinoColors.white,
        duration: const Duration(seconds: 3),
      );
      return RouteSettings(
        name: userType?.toLowerCase() == 'candidate' 
          ? '/candidate-dashboard' 
          : '/',
      );
    }
    
    return null; // Allow access
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  String _getInitialRoute() {
    final authController = Get.find<AuthController>();
    
    // Check if user is authenticated and has valid data
    if (authController.isAuthenticated.value && 
        authController.user.value != null && 
        authController.token.value.isNotEmpty) {
      final userType = authController.user.value!['userType'] as String?;
      
      if (userType != null) {
        if (userType.toLowerCase() == 'business') {
          return '/business-dashboard';
        } else if (userType.toLowerCase() == 'candidate') {
          return '/candidate-dashboard';
        }
      }
    }
    
    // Default to home screen for unauthenticated users
    return '/';
  }

  @override
  Widget build(BuildContext context) {
    final themeController = Get.find<ThemeController>();
    
    return Obx(() {
      return GraphQLProvider(
        client: ValueNotifier(GraphQLService.client),
        child: GetCupertinoApp(
          title: 'RoleVate',
          theme: themeController.isDarkMode ? AppTheme.darkTheme : AppTheme.lightTheme,
          initialRoute: _getInitialRoute(),
        getPages: [
          GetPage(name: '/', page: () => const HomeScreen()),
          GetPage(name: '/home', page: () => const HomeScreen()),
          GetPage(name: '/login', page: () => const LoginScreen()),
          GetPage(name: '/signup', page: () => const SignupScreen()),
          GetPage(name: '/business-dashboard', page: () => const BusinessDashboardScreen()),
          GetPage(name: '/candidate-dashboard', page: () => const CandidateDashboardScreen()),
          GetPage(name: '/profile', page: () => const ProfileScreen()),
          GetPage(
            name: '/post-job', 
            page: () => const PostJobScreen(),
            middlewares: [BusinessOnlyMiddleware()],
          ),
          GetPage(
            name: '/jobs', 
            page: () => const BusinessJobsScreen(),
            middlewares: [BusinessOnlyMiddleware()],
          ),
          GetPage(
            name: '/applications', 
            page: () => const ApplicationsScreen(),
            middlewares: [BusinessOnlyMiddleware()],
          ),
          GetPage(
            name: '/schedule-interview', 
            page: () => const ScheduleInterviewScreen(),
            middlewares: [BusinessOnlyMiddleware()],
          ),
          GetPage(
            name: '/interviews', 
            page: () => const InterviewsScreen(),
          ),
          GetPage(name: '/browse-jobs', page: () => const BrowseJobsScreen()),
          GetPage(name: '/saved-jobs', page: () => const SavedJobsScreen()),
          GetPage(name: '/notifications', page: () => const NotificationsScreen()),
          GetPage(name: '/settings', page: () => const SettingsScreen()),
          GetPage(name: '/my-applications', page: () => MyApplicationsScreen()),
          GetPage(name: '/edit-profile', page: () => const EditProfileScreen()),
          GetPage(name: '/change-password', page: () => const ChangePasswordScreen()),
          GetPage(name: '/company-settings', page: () => const CompanySettingsScreen()),
          GetPage(name: '/support', page: () => const HelpSupportScreen()),
          GetPage(name: '/help-support', page: () => const HelpSupportScreen()),
          GetPage(name: '/about', page: () => const AboutScreen()),
          GetPage(name: '/privacy-security', page: () => const PrivacySecurityScreen()),
          GetPage(name: '/notification-preferences', page: () => const NotificationPreferencesScreen()),
          GetPage(name: '/dark-mode-settings', page: () => const DarkModeSettingsScreen()),
          GetPage(
            name: '/job-application',
            page: () {
              final args = Get.arguments as Map<String, dynamic>;
              return JobApplicationScreen(
                jobId: args['jobId'] as String,
                jobTitle: args['jobTitle'] as String,
                companyName: args['companyName'] as String,
              );
            },
          ),
          GetPage(
            name: '/job-detail',
            page: () {
              final jobId = Get.arguments as String;
              return JobDetailScreen(jobId: jobId);
            },
          ),
        ],
        defaultTransition: Transition.cupertino,
        ),
      );
    });
  }
}
