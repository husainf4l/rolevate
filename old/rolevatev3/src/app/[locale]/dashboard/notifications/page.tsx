import type { Metadata } from "next";
import CandidateSidebar from "@/components/layout/candidate-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  BellRing,
  CheckCircle,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Settings,
  Eye,
  Trash2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Notifications - Rolevate",
  description: "Manage your notifications and stay updated",
};

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const notifications = [
    {
      id: 1,
      type: "job_match",
      title:
        locale === "ar"
          ? "وظيفة جديدة تطابق مهاراتك"
          : "New job matching your skills",
      message:
        locale === "ar"
          ? "تم نشر وظيفة Senior Frontend Developer في TechCorp Inc. تطابق ملفك بنسبة 95%"
          : "Senior Frontend Developer position posted at TechCorp Inc. matches your profile 95%",
      timestamp: "2 hours ago",
      read: false,
      icon: Briefcase,
      color: "text-blue-600",
      action: locale === "ar" ? "عرض الوظيفة" : "View Job",
    },
    {
      id: 2,
      type: "application_update",
      title: locale === "ar" ? "تحديث على طلبك" : "Application update",
      message:
        locale === "ar"
          ? "تم تحديث حالة طلبك لوظيفة Full Stack Developer في StartupXYZ"
          : "Your application status for Full Stack Developer at StartupXYZ has been updated",
      timestamp: "4 hours ago",
      read: false,
      icon: CheckCircle,
      color: "text-green-600",
      action: locale === "ar" ? "عرض التفاصيل" : "View Details",
    },
    {
      id: 3,
      type: "message",
      title: locale === "ar" ? "رسالة جديدة" : "New message",
      message:
        locale === "ar"
          ? "لديك رسالة جديدة من Sarah Johnson في TechCorp Inc."
          : "You have a new message from Sarah Johnson at TechCorp Inc.",
      timestamp: "6 hours ago",
      read: false,
      icon: MessageSquare,
      color: "text-orange-600",
      action: locale === "ar" ? "قراءة الرسالة" : "Read Message",
    },
  ];

  const notificationSettings = [
    {
      category: locale === "ar" ? "الوظائف" : "Jobs",
      items: [
        {
          title:
            locale === "ar"
              ? "وظائف جديدة تطابق ملفي"
              : "New jobs matching my profile",
          description:
            locale === "ar"
              ? "إشعارات عند نشر وظائف تطابق مهاراتك"
              : "Notifications when jobs matching your skills are posted",
          enabled: true,
        },
        {
          title:
            locale === "ar" ? "تحديثات الوظائف المحفوظة" : "Saved job updates",
          description:
            locale === "ar"
              ? "إشعارات عند تحديث الوظائف التي حفظتها"
              : "Notifications when saved jobs are updated",
          enabled: true,
        },
        {
          title:
            locale === "ar" ? "انتهاء صلاحية الوظائف" : "Job expiration alerts",
          description:
            locale === "ar"
              ? "تذكيرات عند اقتراب انتهاء صلاحية الوظائف"
              : "Reminders when job postings are about to expire",
          enabled: false,
        },
      ],
    },
    {
      category: locale === "ar" ? "الطلبات" : "Applications",
      items: [
        {
          title:
            locale === "ar"
              ? "تحديثات حالة الطلبات"
              : "Application status updates",
          description:
            locale === "ar"
              ? "إشعارات عند تغيير حالة طلباتك"
              : "Notifications when your application status changes",
          enabled: true,
        },
        {
          title: locale === "ar" ? "مقابلات مجدولة" : "Interview scheduling",
          description:
            locale === "ar"
              ? "تذكيرات للمقابلات المجدولة"
              : "Reminders for scheduled interviews",
          enabled: true,
        },
        {
          title: locale === "ar" ? "طلبات مرفوضة" : "Application rejections",
          description:
            locale === "ar"
              ? "إشعارات عند رفض طلباتك"
              : "Notifications when applications are rejected",
          enabled: false,
        },
      ],
    },
    {
      category: locale === "ar" ? "الرسائل" : "Messages",
      items: [
        {
          title: locale === "ar" ? "رسائل جديدة" : "New messages",
          description:
            locale === "ar"
              ? "إشعارات للرسائل الجديدة من أصحاب العمل"
              : "Notifications for new messages from employers",
          enabled: true,
        },
        {
          title: locale === "ar" ? "تذكيرات الرد" : "Reply reminders",
          description:
            locale === "ar"
              ? "تذكيرات للرد على الرسائل غير المجابة"
              : "Reminders to reply to unanswered messages",
          enabled: false,
        },
      ],
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "job_match":
        return Briefcase;
      case "application_update":
        return CheckCircle;
      case "message":
        return MessageSquare;
      default:
        return Bell;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <CandidateSidebar locale={locale} />
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {locale === "ar" ? "الإشعارات" : "Notifications"}
            </h1>
            <p className="text-muted-foreground">
              {locale === "ar"
                ? "ابق على اطلاع بأحدث التحديثات والفرص"
                : "Stay updated with the latest updates and opportunities"}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {locale === "ar"
                        ? "إجمالي الإشعارات"
                        : "Total Notifications"}
                    </p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <Bell className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {locale === "ar" ? "غير مقروءة" : "Unread"}
                    </p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <BellRing className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {locale === "ar" ? "هذا الأسبوع" : "This Week"}
                    </p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {locale === "ar" ? "معدل الفتح" : "Open Rate"}
                    </p>
                    <p className="text-2xl font-bold">0%</p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications Tabs */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">
                {locale === "ar" ? "الكل" : "All"} (3)
              </TabsTrigger>
              <TabsTrigger value="unread">
                {locale === "ar" ? "غير مقروءة" : "Unread"} (3)
              </TabsTrigger>
              <TabsTrigger value="jobs">
                {locale === "ar" ? "الوظائف" : "Jobs"} (1)
              </TabsTrigger>
              <TabsTrigger value="applications">
                {locale === "ar" ? "الطلبات" : "Applications"} (1)
              </TabsTrigger>
              <TabsTrigger value="messages">
                {locale === "ar" ? "الرسائل" : "Messages"} (1)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {notifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                return (
                  <Card
                    key={notification.id}
                    className={`hover:shadow-md transition-shadow ${
                      !notification.read ? "border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-2 rounded-full bg-muted ${notification.color}`}
                        >
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold">
                              {notification.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {notification.timestamp}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              {notification.action}
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4 mr-2" />
                              {locale === "ar"
                                ? "تحديد كمقروء"
                                : "Mark as Read"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              {notifications
                .filter((n) => !n.read)
                .map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  return (
                    <Card
                      key={notification.id}
                      className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-2 rounded-full bg-muted ${notification.color}`}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold">
                                {notification.title}
                              </h3>
                              <span className="text-xs text-muted-foreground">
                                {notification.timestamp}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                {notification.action}
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4 mr-2" />
                                {locale === "ar"
                                  ? "تحديد كمقروء"
                                  : "Mark as Read"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </TabsContent>

            <TabsContent value="jobs" className="space-y-4">
              {notifications
                .filter((n) => n.type === "job_match")
                .map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  return (
                    <Card
                      key={notification.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-2 rounded-full bg-muted ${notification.color}`}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              {notification.message}
                            </p>
                            <Button size="sm" variant="outline">
                              {notification.action}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </TabsContent>

            <TabsContent value="applications" className="space-y-4">
              {notifications
                .filter((n) => n.type === "application_update")
                .map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  return (
                    <Card
                      key={notification.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-2 rounded-full bg-muted ${notification.color}`}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              {notification.message}
                            </p>
                            <Button size="sm" variant="outline">
                              {notification.action}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              {notifications
                .filter((n) => n.type === "message")
                .map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  return (
                    <Card
                      key={notification.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-2 rounded-full bg-muted ${notification.color}`}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              {notification.message}
                            </p>
                            <Button size="sm" variant="outline">
                              {notification.action}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </TabsContent>
          </Tabs>

          {/* Notification Settings */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {locale === "ar"
                  ? "إعدادات الإشعارات"
                  : "Notification Settings"}
              </CardTitle>
              <CardDescription>
                {locale === "ar"
                  ? "تخصيص الإشعارات التي تريد تلقيها"
                  : "Customize which notifications you want to receive"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {notificationSettings.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="font-semibold mb-4">{category.category}</h3>
                  <div className="space-y-4">
                    {category.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <Switch checked={item.enabled} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          <div className="mt-6 flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {locale === "ar"
                  ? "3 إشعارات محددة"
                  : "3 notifications selected"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                {locale === "ar" ? "تحديد الكل كمقروء" : "Mark All as Read"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {locale === "ar" ? "حذف المحدد" : "Delete Selected"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
