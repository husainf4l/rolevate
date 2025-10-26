import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:rolevateapp/controllers/job_controller.dart';
import 'package:rolevateapp/core/theme/app_colors.dart';
import 'package:rolevateapp/core/theme/app_theme.dart';
import 'package:rolevateapp/core/theme/app_typography.dart';
import 'package:rolevateapp/widgets/app_nav_bar.dart';
import 'package:rolevateapp/widgets/app_drawer.dart';
import 'package:rolevateapp/widgets/job_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  late AnimationController _drawerController;
  late Animation<Offset> _drawerAnimation;
  bool _isDrawerOpen = false;

  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _drawerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );
    _drawerAnimation = Tween<Offset>(
      begin: const Offset(-1.0, 0.0),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _drawerController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _drawerController.dispose();
    super.dispose();
  }

  void _toggleDrawer() {
    setState(() {
      _isDrawerOpen = !_isDrawerOpen;
      if (_isDrawerOpen) {
        _drawerController.forward();
      } else {
        _drawerController.reverse();
      }
    });
  }

  void _closeDrawer() {
    if (_isDrawerOpen) {
      _toggleDrawer();
    }
  }

  void _performSearch() {
    final query = _searchController.text.trim();
    if (query.isNotEmpty) {
      // Navigate to browse jobs with search query
      Get.toNamed('/browse-jobs', arguments: {'search': query});
    } else {
      // Navigate to browse jobs without search
      Get.toNamed('/browse-jobs');
    }
  }

  @override
  Widget build(BuildContext context) {
    final jobController = Get.put(JobController());

    return CupertinoPageScaffold(
      navigationBar: AppNavBar(onMenuTap: _toggleDrawer),
      child: Stack(
        children: [
          SafeArea(
        child: CustomScrollView(
          slivers: [
            // Hero Section
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppTheme.spacing20,
                  vertical: AppTheme.spacing48,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primary600,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Land Your Dream Job\n10x Faster',
                      style: AppTypography.displayLarge.copyWith(
                        fontSize: 32,
                        height: 1.2,
                        color: CupertinoColors.white,
                      ),
                    ),
                    const SizedBox(height: AppTheme.spacing16),
                    Text(
                      'AI-powered interviews and intelligent matching.\nConnect with top Middle East employers.',
                      style: AppTypography.bodyMedium.copyWith(
                        color: CupertinoColors.white.withValues(alpha: 0.9),
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: AppTheme.spacing32),
                    // Search bar
                    Container(
                      decoration: AppTheme.cardDecoration(
                        color: CupertinoColors.white,
                        borderRadius: AppTheme.radiusLg,
                      ),
                      child: CupertinoTextField(
                        controller: _searchController,
                        placeholder: 'Search jobs, companies, or keywords...',
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppTheme.spacing16,
                          vertical: AppTheme.spacing16,
                        ),
                        decoration: const BoxDecoration(),
                        style: AppTypography.bodyMedium,
                        prefix: const Padding(
                          padding: EdgeInsets.only(left: AppTheme.spacing16),
                          child: Icon(
                            CupertinoIcons.search,
                            color: AppColors.iosSystemGrey,
                          ),
                        ),
                        suffix: Padding(
                          padding: const EdgeInsets.only(right: AppTheme.spacing8),
                          child: CupertinoButton(
                            padding: EdgeInsets.zero,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppTheme.spacing16,
                                vertical: AppTheme.spacing8,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.primary600,
                                borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                              ),
                              child: Text(
                                'Search',
                                style: AppTypography.button.copyWith(
                                  color: CupertinoColors.white,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                            onPressed: () {
                              _performSearch();
                            },
                          ),
                        ),
                        onSubmitted: (value) {
                          _performSearch();
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Featured jobs section header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(AppTheme.spacing20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Featured Jobs',
                      style: AppTypography.headlineLarge,
                    ),
                    CupertinoButton(
                      padding: EdgeInsets.zero,
                      child: Text(
                        'See All',
                        style: AppTypography.button.copyWith(
                          color: AppColors.primary600,
                        ),
                      ),
                      onPressed: () {
                        Get.toNamed('/browse-jobs');
                      },
                    ),
                  ],
                ),
              ),
            ),
            // Jobs list
            Obx(() {
              if (jobController.error.value.isNotEmpty) {
                return SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(AppTheme.spacing20),
                    child: Text(
                      'Error: ${jobController.error.value}',
                      style: AppTypography.bodyMedium.copyWith(
                        color: AppColors.error,
                      ),
                    ),
                  ),
                );
              }

              if (jobController.isLoading.value) {
                return const SliverToBoxAdapter(
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(AppTheme.spacing40),
                      child: CupertinoActivityIndicator(),
                    ),
                  ),
                );
              }

              if (jobController.jobs.isEmpty) {
                return const SliverToBoxAdapter(
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(AppTheme.spacing40),
                      child: Text('No jobs available'),
                    ),
                  ),
                );
              }

              return SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacing20),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final job = jobController.jobs[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: AppTheme.spacing16),
                        child: JobCard(job: job),
                      );
                    },
                    childCount: jobController.jobs.length,
                  ),
                ),
              );
            }),
            const SliverToBoxAdapter(
              child: SizedBox(height: AppTheme.spacing20),
            ),
          ],
        ),
      ),
          // Drawer overlay
          if (_isDrawerOpen)
            GestureDetector(
              onTap: _closeDrawer,
              child: Container(
                color: CupertinoColors.black.withValues(alpha: 0.4),
              ),
            ),
          // Drawer
          SlideTransition(
            position: _drawerAnimation,
            child: AppDrawer(onClose: _closeDrawer),
          ),
        ],
      ),
    );
  }
}
