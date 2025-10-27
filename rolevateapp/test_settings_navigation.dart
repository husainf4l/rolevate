// Quick test file to verify settings navigation
// Run with: flutter run test_settings_navigation.dart

import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/screens/about_screen.dart';
import 'package:rolevateapp/screens/privacy_security_screen.dart';
import 'package:rolevateapp/screens/notification_preferences_screen.dart';
import 'package:rolevateapp/screens/dark_mode_settings_screen.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';

void main() {
  runApp(const TestSettingsApp());
}

class TestSettingsApp extends StatelessWidget {
  const TestSettingsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetCupertinoApp(
      title: 'Test Settings Navigation',
      theme: AppTheme.lightTheme,
      home: const TestHomeScreen(),
      getPages: [
        GetPage(name: '/about', page: () => const AboutScreen()),
        GetPage(name: '/privacy-security', page: () => const PrivacySecurityScreen()),
        GetPage(name: '/notification-preferences', page: () => const NotificationPreferencesScreen()),
        GetPage(name: '/dark-mode-settings', page: () => const DarkModeSettingsScreen()),
      ],
    );
  }
}

class TestHomeScreen extends StatelessWidget {
  const TestHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        middle: Text('Test Settings Navigation'),
      ),
      child: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'Test Settings Screens',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 40),
              
              CupertinoButton.filled(
                onPressed: () {
                  debugPrint('🔔 Testing Notification Preferences navigation');
                  Get.toNamed('/notification-preferences');
                },
                child: const Text('Notification Preferences'),
              ),
              const SizedBox(height: 20),
              
              CupertinoButton.filled(
                onPressed: () {
                  debugPrint('🌙 Testing Dark Mode navigation');
                  Get.toNamed('/dark-mode-settings');
                },
                child: const Text('Dark Mode Settings'),
              ),
              const SizedBox(height: 20),
              
              CupertinoButton.filled(
                onPressed: () {
                  debugPrint('🔒 Testing Privacy & Security navigation');
                  Get.toNamed('/privacy-security');
                },
                child: const Text('Privacy & Security'),
              ),
              const SizedBox(height: 20),
              
              CupertinoButton.filled(
                onPressed: () {
                  debugPrint('ℹ️ Testing About navigation');
                  Get.toNamed('/about');
                },
                child: const Text('About'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
