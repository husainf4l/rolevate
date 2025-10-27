import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:flutter/cupertino.dart';

class ThemeController extends GetxController {
  final _storage = GetStorage();
  static const String _themeKey = 'theme_mode';
  
  // Observable theme mode: 'light', 'dark', 'system'
  final Rx<String> themeMode = 'system'.obs;
  
  // Observable for actual brightness being used
  final Rx<Brightness> currentBrightness = Brightness.light.obs;
  
  @override
  void onInit() {
    super.onInit();
    loadThemeMode();
  }
  
  void loadThemeMode() {
    final savedTheme = _storage.read(_themeKey);
    if (savedTheme != null) {
      themeMode.value = savedTheme;
    } else {
      themeMode.value = 'system';
    }
    _updateBrightness();
  }
  
  void setThemeMode(String mode) {
    themeMode.value = mode;
    _storage.write(_themeKey, mode);
    _updateBrightness();
    Get.forceAppUpdate(); // Force rebuild entire app
  }
  
  void _updateBrightness() {
    if (themeMode.value == 'light') {
      currentBrightness.value = Brightness.light;
    } else if (themeMode.value == 'dark') {
      currentBrightness.value = Brightness.dark;
    } else {
      // System mode - check system brightness
      currentBrightness.value = Get.isDarkMode ? Brightness.dark : Brightness.light;
    }
  }
  
  bool get isDarkMode => currentBrightness.value == Brightness.dark;
  bool get isLightMode => currentBrightness.value == Brightness.light;
}
