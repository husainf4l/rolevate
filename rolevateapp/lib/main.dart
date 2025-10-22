import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:rolevateapp/controllers/auth_controller.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/services/graphql_service.dart';
import 'package:rolevateapp/screens/home_screen.dart';
import 'package:rolevateapp/screens/login_screen.dart';
import 'package:rolevateapp/screens/job_detail_screen.dart';
import 'package:rolevateapp/screens/business_dashboard_screen.dart';
import 'package:rolevateapp/screens/candidate_dashboard_screen.dart';
import 'package:rolevateapp/screens/profile_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize storage
  await GetStorage.init();
  
  // Initialize Hive for GraphQL
  await initHiveForFlutter();

  // Initialize GraphQL service
  GraphQLService.initialize('http://192.168.1.210:4005/api/graphql');
  
  // Initialize controllers
  Get.put(AuthController());

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  String _getInitialRoute() {
    final authController = Get.find<AuthController>();
    
    if (authController.isAuthenticated.value && authController.user.value != null) {
      final userType = authController.user.value!['userType'] as String;
      
      if (userType.toLowerCase() == 'business') {
        return '/business-dashboard';
      } else if (userType.toLowerCase() == 'candidate') {
        return '/candidate-dashboard';
      }
    }
    
    return '/';
  }

  @override
  Widget build(BuildContext context) {
    return GraphQLProvider(
      client: ValueNotifier(GraphQLService.client),
      child: GetCupertinoApp(
        title: 'RoleVate',
        theme: AppTheme.lightTheme,
        initialRoute: _getInitialRoute(),
        getPages: [
          GetPage(name: '/', page: () => const HomeScreen()),
          GetPage(name: '/home', page: () => const HomeScreen()),
          GetPage(name: '/login', page: () => const LoginScreen()),
          GetPage(name: '/business-dashboard', page: () => const BusinessDashboardScreen()),
          GetPage(name: '/candidate-dashboard', page: () => const CandidateDashboardScreen()),
          GetPage(name: '/profile', page: () => const ProfileScreen()),
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
  }
}
