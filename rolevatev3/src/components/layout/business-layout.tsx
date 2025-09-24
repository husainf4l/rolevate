"use client";

import { Link } from '@/i18n/navigation';
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Building2,
  Users,
  Briefcase,
  BarChart3,
  Settings,
  Bell,
  Search,
  Home,
  FileText,
  Calendar,
  MessageSquare,
  Shield,
  User,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import { useAuthContext } from "@/providers/auth-provider";
import { useState, useEffect } from "react";

interface BusinessLayoutProps {
  children: React.ReactNode;
  locale: string;
}

function BusinessSidebarContent({ locale, notificationCount }: { locale: string; notificationCount: number }) {
  const pathname = usePathname();

  const navigationItems = [
    {
      title: locale === 'ar' ? 'الرئيسية' : 'Dashboard',
      href: `/${locale}/business`,
      icon: Home,
      isActive: pathname === `/${locale}/business`
    },
    {
      title: locale === 'ar' ? 'المواهب' : 'Talents',
      href: `/${locale}/business/talents`,
      icon: Users,
      badge: '12',
      isActive: pathname.includes('/talents')
    },
    {
      title: locale === 'ar' ? 'الوظائف' : 'Jobs',
      href: `/${locale}/business/jobs`,
      icon: Briefcase,
      badge: '5',
      isActive: pathname.includes('/jobs')
    },
    {
      title: locale === 'ar' ? 'التقارير' : 'Reports',
      href: `/${locale}/business/reports`,
      icon: BarChart3,
      isActive: pathname.includes('/reports')
    },
    {
      title: locale === 'ar' ? 'الرسائل' : 'Messages',
      href: `/${locale}/business/messages`,
      icon: MessageSquare,
      badge: '3',
      isActive: pathname.includes('/messages')
    },
    {
      title: locale === 'ar' ? 'الإشعارات' : 'Notifications',
      href: `/${locale}/business/notifications`,
      icon: Bell,
      badge: notificationCount > 0 ? notificationCount.toString() : undefined,
      isActive: pathname.includes('/notifications')
    },
    {
      title: locale === 'ar' ? 'التقويم' : 'Calendar',
      href: `/${locale}/business/calendar`,
      icon: Calendar,
      isActive: pathname.includes('/calendar')
    },
    {
      title: locale === 'ar' ? 'المستندات' : 'Documents',
      href: `/${locale}/business/documents`,
      icon: FileText,
      isActive: pathname.includes('/documents')
    }
  ];

  const bottomItems = [
    {
      title: locale === 'ar' ? 'الإعدادات' : 'Settings',
      href: `/${locale}/business/settings`,
      icon: Settings,
      isActive: pathname.includes('/settings')
    },
    {
      title: locale === 'ar' ? 'الأمان' : 'Security',
      href: `/${locale}/business/security`,
      icon: Shield,
      isActive: pathname.includes('/security')
    }
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Building2 className="h-6 w-6" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {locale === 'ar' ? 'روليفيت' : 'Rolevate'}
            </span>
            <span className="truncate text-xs">
              {locale === 'ar' ? 'منصة التوظيف' : 'Recruitment Platform'}
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {locale === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={item.isActive}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                      {item.badge && (
                        <SidebarMenuBadge>
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={item.isActive}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </>
  );
}

export default function BusinessLayout({ children, locale }: BusinessLayoutProps) {
  const { user, logout, isAuthenticated } = useAuthContext();
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch notification count from API
      const fetchNotificationCount = async () => {
        try {
          // Replace with your actual API endpoint
          const response = await fetch('http://localhost:4005/notifications/count?userId=' + user.id + '&isRead=false', {
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            setNotificationCount(data.count || 0);
          }
        } catch (error) {
          console.error('Failed to fetch notification count:', error);
          setNotificationCount(0);
        }
      };

      // Fetch recent notifications
      const fetchNotifications = async () => {
        try {
          const response = await fetch('http://localhost:4005/notifications?userId=' + user.id + '&limit=5', {
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            setNotifications(data.notifications || []);
          }
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
          setNotifications([]);
        }
      };

      fetchNotificationCount();
      fetchNotifications();
    } else {
      setNotificationCount(0);
      setNotifications([]);
    }
  }, [isAuthenticated, user]);
  return (
    <SidebarProvider>
      <Sidebar>
        <BusinessSidebarContent locale={locale} notificationCount={notificationCount} />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-semibold">
              {locale === 'ar' ? 'لوحة تحكم الأعمال' : 'Business Dashboard'}
            </h1>
          </div>
          
          <div className="ml-auto flex items-center gap-2 px-4">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={locale === 'ar' ? 'البحث...' : 'Search...'}
                className="w-64 pl-10 pr-4 py-2 bg-muted/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-primary text-primary-foreground"
                  >
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>
                  {locale === 'ar' ? 'الإشعارات' : 'Notifications'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification: { id: string; title?: string; message?: string; content?: string; createdAt: string }) => (
                      <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                        <div className="font-medium text-sm">
                          {notification.title || (locale === 'ar' ? 'إشعار جديد' : 'New Notification')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {notification.message || notification.content}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      {locale === 'ar' ? 'لا توجد إشعارات جديدة' : 'No new notifications'}
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-center">
                  <Link href={`/${locale}/business/notifications`}>
                    <span className="text-sm text-primary">
                      {locale === 'ar' ? 'عرض جميع الإشعارات' : 'View All Notifications'}
                    </span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 px-2 py-1.5 h-auto">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center border">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium hidden sm:block">
                    {user?.name || (locale === 'ar' ? 'المستخدم' : 'User')}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {locale === 'ar' ? 'حسابي' : 'My Account'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAuthenticated && user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/business`}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>{locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>{locale === 'ar' ? 'الملف الشخصي' : 'Profile'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{locale === 'ar' ? 'الإعدادات' : 'Settings'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Log out'}</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>{locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
