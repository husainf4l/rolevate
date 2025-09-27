import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import CandidateSidebar from "@/components/layout/candidate-sidebar";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Send,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Building,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Applications - Rolevate",
  description: "Track your job applications and their status",
};

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('dashboard.applications');

  const applications = [
    {
      id: 1,
      jobTitle: t('mockData.job1.title'),
      company: t('mockData.job1.company'),
      location: t('mockData.job1.location'),
      appliedDate: "2024-01-15",
      status: "under_review",
      statusText: t('status.underReview'),
      statusColor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      statusIcon: Clock,
      nextStep: t('status.waitingHR'),
      lastUpdate: t('timeAgo.days', { count: 2 }),
    },
    {
      id: 2,
      jobTitle: t('mockData.job2.title'),
      company: t('mockData.job2.company'),
      location: t('mockData.job2.location'),
      appliedDate: "2024-01-10",
      status: "interview_scheduled",
      statusText: t('status.interviewScheduled'),
      statusColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      statusIcon: Calendar,
      nextStep: t('status.videoInterview'),
      lastUpdate: t('timeAgo.days', { count: 1 }),
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "under_review":
        return Clock;
      case "interview_scheduled":
        return Calendar;
      case "accepted":
        return CheckCircle;
      case "rejected":
        return XCircle;
      default:
        return AlertCircle;
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
              {locale === "ar" ? "طلباتي" : "My Applications"}
            </h1>
            <p className="text-muted-foreground">
              {locale === "ar"
                ? "تتبع حالة طلباتك وتقدمك في العملية التوظيفية"
                : "Track your application status and progress in the hiring process"}
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {locale === "ar"
                        ? "إجمالي الطلبات"
                        : "Total Applications"}
                    </p>
                    <p className="text-2xl font-bold">2</p>
                  </div>
                  <Send className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {locale === "ar" ? "قيد المراجعة" : "Under Review"}
                    </p>
                    <p className="text-2xl font-bold">1</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {locale === "ar" ? "مقابلات" : "Interviews"}
                    </p>
                    <p className="text-2xl font-bold">1</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {locale === "ar" ? "معدل النجاح" : "Success Rate"}
                    </p>
                    <p className="text-2xl font-bold">50%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Applications List */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">
                {locale === "ar" ? "الكل" : "All"} ({applications.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                {locale === "ar" ? "نشط" : "Active"} (2)
              </TabsTrigger>
              <TabsTrigger value="archived">
                {locale === "ar" ? "مؤرشف" : "Archived"} (0)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {applications.map((application) => {
                const StatusIcon = getStatusIcon(application.status);
                return (
                  <Card
                    key={application.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
                                {application.jobTitle}
                              </h3>
                              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Building className="h-4 w-4" />
                                <span>{application.company}</span>
                                <span>•</span>
                                <span>{application.location}</span>
                              </div>
                            </div>
                            <Badge className={application.statusColor}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {application.statusText}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">
                                {locale === "ar"
                                  ? "تاريخ التقديم"
                                  : "Applied Date"}
                              </p>
                              <p className="font-medium">
                                {application.appliedDate}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                {locale === "ar" ? "آخر تحديث" : "Last Update"}
                              </p>
                              <p className="font-medium">
                                {application.lastUpdate}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                {locale === "ar"
                                  ? "الخطوة التالية"
                                  : "Next Step"}
                              </p>
                              <p className="font-medium">
                                {application.nextStep}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            {locale === "ar" ? "عرض التفاصيل" : "View Details"}
                          </Button>
                          <Button variant="ghost" size="sm">
                            {locale === "ar"
                              ? "إلغاء الطلب"
                              : "Withdraw Application"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {applications.map((application) => {
                const StatusIcon = getStatusIcon(application.status);
                return (
                  <Card
                    key={application.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
                                {application.jobTitle}
                              </h3>
                              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Building className="h-4 w-4" />
                                <span>{application.company}</span>
                                <span>•</span>
                                <span>{application.location}</span>
                              </div>
                            </div>
                            <Badge className={application.statusColor}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {application.statusText}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">
                                {locale === "ar"
                                  ? "تاريخ التقديم"
                                  : "Applied Date"}
                              </p>
                              <p className="font-medium">
                                {application.appliedDate}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                {locale === "ar" ? "آخر تحديث" : "Last Update"}
                              </p>
                              <p className="font-medium">
                                {application.lastUpdate}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                {locale === "ar"
                                  ? "الخطوة التالية"
                                  : "Next Step"}
                              </p>
                              <p className="font-medium">
                                {application.nextStep}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            {locale === "ar" ? "عرض التفاصيل" : "View Details"}
                          </Button>
                          <Button variant="ghost" size="sm">
                            {locale === "ar"
                              ? "إلغاء الطلب"
                              : "Withdraw Application"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="archived" className="space-y-4">
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {locale === "ar"
                    ? "لا توجد طلبات مؤرشفة"
                    : "No archived applications"}
                </h3>
                <p className="text-muted-foreground">
                  {locale === "ar"
                    ? "ستظهر هنا الطلبات المؤرشفة"
                    : "Archived applications will appear here"}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
