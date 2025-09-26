import type { Metadata } from "next";
import CandidateSidebar from "@/components/layout/candidate-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  User,
  Briefcase,
  Send,
  Bookmark,
  FileText,
  MessageSquare,
  Bell,
  Clock,
  Eye,
  Search,
  Edit,
  Settings,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard - Rolevate",
  description: "Your personal recruitment dashboard",
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const dashboardStats = [
    {
      title: locale === "ar" ? "الطلبات المرسلة" : "Applications Sent",
      value: "24",
      description: locale === "ar" ? "12 هذا الشهر" : "12 this month",
      change: locale === "ar" ? "+3 من الأسبوع الماضي" : "+3 from last week",
      changeType: "positive",
      icon: Send,
      color: "text-blue-600",
    },
    {
      title: locale === "ar" ? "الوظائف المحفوظة" : "Saved Jobs",
      value: "8",
      description: locale === "ar" ? "5 نشطة" : "5 active",
      change: locale === "ar" ? "+2 جديدة" : "+2 new",
      changeType: "positive",
      icon: Bookmark,
      color: "text-green-600",
    },
    {
      title: locale === "ar" ? "الرسائل الجديدة" : "New Messages",
      value: "3",
      description: locale === "ar" ? "من 5 شركات" : "from 5 companies",
      change: locale === "ar" ? "2 غير مقروءة" : "2 unread",
      changeType: "neutral",
      icon: MessageSquare,
      color: "text-orange-600",
    },
    {
      title: locale === "ar" ? "الإشعارات" : "Notifications",
      value: "7",
      description: locale === "ar" ? "3 جديدة" : "3 new",
      change: locale === "ar" ? "4 اليوم" : "4 today",
      changeType: "neutral",
      icon: Bell,
      color: "text-purple-600",
    },
    {
      title: locale === "ar" ? "الملف الشخصي" : "Profile Completion",
      value: "85%",
      description: locale === "ar" ? "مكتمل" : "Complete",
      change: locale === "ar" ? "+5% هذا الأسبوع" : "+5% this week",
      changeType: "positive",
      icon: User,
      color: "text-indigo-600",
    },
    {
      title: locale === "ar" ? "السيرة الذاتية" : "Resume Score",
      value: "92",
      description: locale === "ar" ? "من 100" : "out of 100",
      change: locale === "ar" ? "+8 نقاط" : "+8 points",
      changeType: "positive",
      icon: FileText,
      color: "text-teal-600",
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

  const recentActivity = [
    {
      type: "application",
      title:
        locale === "ar"
          ? "تقدمت لوظيفة مطور ويب كامل المهارات"
          : "Applied for Senior Web Developer at TechCorp",
      time: locale === "ar" ? "منذ 2 ساعات" : "2 hours ago",
      status: locale === "ar" ? "قيد المراجعة" : "Under Review",
      icon: Send,
      color: "text-blue-600",
    },
    {
      type: "message",
      title:
        locale === "ar"
          ? "رسالة من شركة TechCorp - طلب مقابلة"
          : "Message from TechCorp - Interview Request",
      time: locale === "ar" ? "منذ 4 ساعات" : "4 hours ago",
      status: locale === "ar" ? "جديد" : "New",
      icon: MessageSquare,
      color: "text-orange-600",
    },
    {
      type: "saved",
      title:
        locale === "ar"
          ? "حفظت وظيفة مصمم تجربة المستخدم في Google"
          : "Saved UX Designer position at Google",
      time: locale === "ar" ? "منذ 6 ساعات" : "6 hours ago",
      status: locale === "ar" ? "مطابقة عالية" : "High Match",
      icon: Bookmark,
      color: "text-green-600",
    },
    {
      type: "interview",
      title:
        locale === "ar"
          ? "مقابلة مجدولة مع Microsoft - غداً"
          : "Interview scheduled with Microsoft - Tomorrow",
      time: locale === "ar" ? "منذ 8 ساعات" : "8 hours ago",
      status: locale === "ar" ? "مؤكد" : "Confirmed",
      icon: Clock,
      color: "text-purple-600",
    },
    {
      type: "notification",
      title:
        locale === "ar"
          ? "تم تحديث حالة طلبك في Amazon"
          : "Application status updated at Amazon",
      time: locale === "ar" ? "منذ يوم واحد" : "1 day ago",
      status: locale === "ar" ? "مرحلة المقابلة" : "Interview Stage",
      icon: Bell,
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <CandidateSidebar locale={locale} />
      <div className="flex-1">
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
                    <p
                      className={`text-xs font-medium ${
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : stat.changeType === "negative"
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
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
                {
                  status: locale === "ar" ? "قيد المراجعة" : "Under Review",
                  count: 8,
                  color: "bg-blue-50 text-blue-700 border-blue-200",
                  icon: Clock,
                },
                {
                  status: locale === "ar" ? "مقابلة" : "Interview",
                  count: 3,
                  color: "bg-orange-50 text-orange-700 border-orange-200",
                  icon: MessageSquare,
                },
                {
                  status: locale === "ar" ? "مرفوض" : "Rejected",
                  count: 5,
                  color: "bg-red-50 text-red-700 border-red-200",
                  icon: Send,
                },
                {
                  status: locale === "ar" ? "مقبول" : "Accepted",
                  count: 1,
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

          {/* Application Status Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {locale === "ar" ? "حالة الطلبات" : "Application Status"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  status: locale === "ar" ? "قيد المراجعة" : "Under Review",
                  count: 8,
                  color: "bg-blue-50 text-blue-700 border-blue-200",
                  icon: Clock,
                },
                {
                  status: locale === "ar" ? "مقابلة" : "Interview",
                  count: 3,
                  color: "bg-orange-50 text-orange-700 border-orange-200",
                  icon: MessageSquare,
                },
                {
                  status: locale === "ar" ? "مرفوض" : "Rejected",
                  count: 5,
                  color: "bg-red-50 text-red-700 border-red-200",
                  icon: Send,
                },
                {
                  status: locale === "ar" ? "مقبول" : "Accepted",
                  count: 1,
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

          {/* Recent Activity */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {locale === "ar" ? "النشاط الأخير" : "Recent Activity"}
            </h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={`p-2 rounded-full bg-muted ${activity.color}`}
                      >
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            {activity.time}
                          </p>
                          {activity.status && (
                            <Badge variant="outline" className="text-xs">
                              {activity.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Recommendations */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {locale === "ar" ? "وظائف موصى بها" : "Recommended Jobs"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  id: 1,
                  title:
                    locale === "ar"
                      ? "مطور ويب كامل المهارات"
                      : "Senior Web Developer",
                  company: "TechCorp Inc.",
                  location:
                    locale === "ar"
                      ? "الرياض، السعودية"
                      : "Riyadh, Saudi Arabia",
                  type: locale === "ar" ? "دوام كامل" : "Full-time",
                  salary:
                    locale === "ar"
                      ? "15,000 - 25,000 ريال"
                      : "SAR 15,000 - 25,000",
                  posted: locale === "ar" ? "منذ يومين" : "2 days ago",
                  match: 95,
                  urgent: true,
                  skills: ["React", "Node.js", "TypeScript"],
                },
                {
                  id: 2,
                  title:
                    locale === "ar" ? "مصمم تجربة المستخدم" : "UX/UI Designer",
                  company: "Design Studio",
                  location: locale === "ar" ? "دبي، الإمارات" : "Dubai, UAE",
                  type: locale === "ar" ? "دوام كامل" : "Full-time",
                  salary:
                    locale === "ar"
                      ? "12,000 - 18,000 درهم"
                      : "AED 12,000 - 18,000",
                  posted: locale === "ar" ? "منذ 3 أيام" : "3 days ago",
                  match: 88,
                  urgent: false,
                  skills: ["Figma", "Adobe XD", "Prototyping"],
                },
                {
                  id: 3,
                  title:
                    locale === "ar"
                      ? "مدير مشاريع تقنية"
                      : "Technical Project Manager",
                  company: "Innovate Solutions",
                  location: locale === "ar" ? "القاهرة، مصر" : "Cairo, Egypt",
                  type: locale === "ar" ? "دوام كامل" : "Full-time",
                  salary:
                    locale === "ar"
                      ? "20,000 - 30,000 جنيه"
                      : "EGP 20,000 - 30,000",
                  posted: locale === "ar" ? "منذ أسبوع" : "1 week ago",
                  match: 82,
                  urgent: false,
                  skills: ["Agile", "Scrum", "Jira"],
                },
              ].map((job) => (
                <Card
                  key={job.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg hover:text-primary cursor-pointer">
                          {job.title}
                        </CardTitle>
                        <CardDescription className="font-medium text-foreground">
                          {job.company}
                        </CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {job.match}% {locale === "ar" ? "تطابق" : "Match"}
                          </Badge>
                          {job.urgent && (
                            <Badge variant="destructive" className="text-xs">
                              {locale === "ar" ? "عاجل" : "Urgent"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4 mr-2" />
                        {job.type} • {job.location}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        {job.posted}
                      </div>
                      <div className="flex items-center text-sm font-medium text-green-600">
                        {job.salary}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {job.skills.slice(0, 3).map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
