"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Briefcase,
  FileText,
  MessageSquare,
  Settings,
  Search,
  Menu,
  X,
  Home,
  Bookmark,
  Send,
  Bell,
  LogOut,
  Calendar,
  Shield,
} from "lucide-react";
import { useAuthContext } from "@/providers/auth-provider";
import ThemeSwitcher from "@/components/common/themeSwitcher";

interface CandidateSidebarProps {
  locale: string;
}

export default function CandidateSidebar({ locale }: CandidateSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthContext();

  const getUserInitials = () => {
    if (!user?.name) return user?.email?.charAt(0).toUpperCase() || "U";
    return user.name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase();
  };

  const navigationItems = [
    {
      title: locale === "ar" ? "الرئيسية" : "Dashboard",
      href: `/${locale}/dashboard`,
      icon: Home,
      isActive: pathname === `/${locale}/dashboard`,
    },
    {
      title: locale === "ar" ? "الملف الشخصي" : "Profile",
      href: `/${locale}/dashboard/profile`,
      icon: User,
      isActive: pathname.includes("/profile"),
    },
    {
      title: locale === "ar" ? "الوظائف" : "Jobs",
      href: `/${locale}/dashboard/jobs`,
      icon: Briefcase,
      isActive: pathname.includes("/jobs"),
    },
    {
      title: locale === "ar" ? "الطلبات" : "Applications",
      href: `/${locale}/dashboard/applications`,
      icon: Send,
      badge: "2",
      isActive: pathname.includes("/applications"),
    },
    {
      title: locale === "ar" ? "المحفوظات" : "Saved Jobs",
      href: `/${locale}/dashboard/saved`,
      icon: Bookmark,
      badge: "5",
      isActive: pathname.includes("/saved"),
    },
    {
      title: locale === "ar" ? "السيرة الذاتية" : "Resume",
      href: `/${locale}/dashboard/resume`,
      icon: FileText,
      isActive: pathname.includes("/resume"),
    },
    {
      title: locale === "ar" ? "الرسائل" : "Messages",
      href: `/${locale}/dashboard/messages`,
      icon: MessageSquare,
      badge: "1",
      isActive: pathname.includes("/messages"),
    },
    {
      title: locale === "ar" ? "الإشعارات" : "Notifications",
      href: `/${locale}/dashboard/notifications`,
      icon: Bell,
      badge: "3",
      isActive: pathname.includes("/notifications"),
    },
    {
      title: locale === "ar" ? "التقويم" : "Calendar",
      href: `/${locale}/dashboard/calendar`,
      icon: Calendar,
      isActive: pathname.includes("/calendar"),
    },
    {
      title: locale === "ar" ? "المستندات" : "Documents",
      href: `/${locale}/dashboard/documents`,
      icon: FileText,
      isActive: pathname.includes("/documents"),
    },
  ];

  const bottomItems = [
    {
      title: locale === "ar" ? "الإعدادات" : "Settings",
      href: `/${locale}/dashboard/settings`,
      icon: Settings,
      isActive: pathname.includes("/settings"),
    },
    {
      title: locale === "ar" ? "الأمان" : "Security",
      href: `/${locale}/dashboard/security`,
      icon: Shield,
      isActive: pathname.includes("/security"),
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-background border-r border-border/50 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <User className="w-6 h-6 text-primary" />
            <span className="font-semibold text-foreground">
              {locale === "ar" ? "لوحة المرشح" : "Candidate Dashboard"}
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <Menu className="w-4 h-4" />
          ) : (
            <X className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={
                locale === "ar" ? "البحث عن وظائف..." : "Search jobs..."
              }
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              item.isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      <Separator className="mx-4" />

      {/* Bottom Navigation */}
      <nav className="px-4 py-2 space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              item.isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="flex-1">{item.title}</span>}
          </Link>
        ))}
      </nav>

      {/* Theme Switcher */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-center">
          {!isCollapsed && (
            <span className="text-xs text-muted-foreground mr-2">
              {locale === "ar" ? "المظهر" : "Theme"}
            </span>
          )}
          <ThemeSwitcher />
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={user?.image || undefined}
              alt={user?.name || user?.email}
            />
            <AvatarFallback className="text-xs">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {locale === "ar" ? "مرشح" : "Candidate"}
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {locale === "ar" ? "تسجيل الخروج" : "Logout"}
          </Button>
        )}
      </div>
    </div>
  );
}
