"use client";

import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Send,
  Bookmark,
  MessageSquare,
  Bell,
  User,
  FileText,
  Search,
  Edit,
  Settings,
  Clock,
  Eye,
} from "lucide-react";

interface DashboardContentProps {
  locale: string;
}

export default function DashboardContent({ locale }: DashboardContentProps) {
  // Note: These will be replaced with real data from API calls
  const dashboardStats = [
    {
      title: locale === "ar" ? "الطلبات المرسلة" : "Applications Sent",
      value: "0", // TODO: Get from applications API
      description: locale === "ar" ? "لا توجد طلبات بعد" : "No applications yet",
      change: locale === "ar" ? "ابدأ بالتقديم للوظائف" : "Start applying to jobs",
      changeType: "neutral" as const,
      icon: Send,
      color: "text-primary",
    },
    {
      title: locale === "ar" ? "الوظائف المحفوظة" : "Saved Jobs",
      value: "0", // TODO: Get from saved jobs API
      description: locale === "ar" ? "لا توجد وظائف محفوظة" : "No saved jobs",
      change: locale === "ar" ? "احفظ الوظائف المفضلة" : "Save favorite jobs",
      changeType: "neutral" as const,
      icon: Bookmark,
      color: "text-primary",
    },
    {
      title: locale === "ar" ? "الرسائل الجديدة" : "New Messages",
      value: "0", // TODO: Get from messages API
      description: locale === "ar" ? "لا توجد رسائل" : "No messages",
      change: locale === "ar" ? "ستظهر هنا رسائل أصحاب العمل" : "Employer messages will appear here",
      changeType: "neutral" as const,
      icon: MessageSquare,
      color: "text-primary",
    },
    {
      title: locale === "ar" ? "الإشعارات" : "Notifications",
      value: "0", // TODO: Get from notifications API
      description: locale === "ar" ? "لا توجد إشعارات" : "No notifications",
      change: locale === "ar" ? "ستظهر هنا التحديثات المهمة" : "Important updates will appear here",
      changeType: "neutral" as const,
      icon: Bell,
      color: "text-primary",
    },
    {
      title: locale === "ar" ? "الملف الشخصي" : "Profile Completion",
      value: "0%", // TODO: Calculate based on filled profile fields
      description: locale === "ar" ? "أكمل ملفك الشخصي" : "Complete your profile",
      change: locale === "ar" ? "أضف المزيد من المعلومات" : "Add more information",
      changeType: "neutral" as const,
      icon: User,
      color: "text-primary",
    },
    {
      title: locale === "ar" ? "السيرة الذاتية" : "Resume Score",
      value: "0", // TODO: Calculate resume completeness score
      description: locale === "ar" ? "من 100" : "out of 100",
      change: locale === "ar" ? "أضف سيرتك الذاتية" : "Add your resume",
      changeType: "neutral" as const,
      icon: FileText,
      color: "text-primary",
    },
  ];

  const quickActions = [
    {
      title: locale === "ar" ? "البحث عن وظائف" : "Search Jobs",
      description:
        locale === "ar"
          ? "العثور على فرص عمل جديدة"
          : "Find new job opportunities",
      icon: Search,
      href: `/${locale}/jobs`,
    },
    {
      title: locale === "ar" ? "تحديث السيرة الذاتية" : "Update Resume",
      description:
        locale === "ar"
          ? "اجعل سيرتك الذاتية مميزة"
          : "Make your resume stand out",
      icon: Edit,
      href: `/${locale}/dashboard/resume`,
    },
    {
      title: locale === "ar" ? "إدارة الملف الشخصي" : "Manage Profile",
      description:
        locale === "ar"
          ? "أكمل معلوماتك الشخصية"
          : "Complete your personal information",
      icon: Settings,
      href: `/${locale}/dashboard/profile`,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {locale === "ar" ? "لوحة التحكم" : "Dashboard"}
        </h1>
        <p className="text-muted-foreground">
          {locale === "ar"
            ? "مرحباً بك في لوحة تحكمك الشخصية"
            : "Welcome to your personal dashboard"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {dashboardStats.map((stat, index) => (
          <Card
            key={index}
            className="relative overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mb-1">
                {stat.description}
              </p>
              {stat.change && (
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.change}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Application Status Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {locale === "ar" ? "حالة الطلبات" : "Application Status"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            // TODO: Replace with real application status data from API
            {
              status: locale === "ar" ? "قيد المراجعة" : "Under Review",
              count: 0, // TODO: Get from applications API
              color: "bg-yellow-50 text-yellow-700 border-yellow-200",
              icon: Clock,
            },
            {
              status: locale === "ar" ? "مقابلة" : "Interview",
              count: 0, // TODO: Get from applications API
              color: "bg-orange-50 text-orange-700 border-orange-200",
              icon: MessageSquare,
            },
            {
              status: locale === "ar" ? "مرفوض" : "Rejected",
              count: 0, // TODO: Get from applications API
              color: "bg-red-50 text-red-700 border-red-200",
              icon: Send,
            },
            {
              status: locale === "ar" ? "مقبول" : "Accepted",
              count: 0, // TODO: Get from applications API
              color: "bg-green-50 text-green-700 border-green-200",
              icon: Bookmark,
            },
          ].map((item, index) => (
            <Card key={index} className={`${item.color} border-2`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{item.count}</p>
                    <p className="text-sm font-medium">{item.status}</p>
                  </div>
                  <item.icon className="h-8 w-8 opacity-75" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {locale === "ar" ? "الإجراءات السريعة" : "Quick Actions"}
        </h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="p-2 rounded-full bg-muted">
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}