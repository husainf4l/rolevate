import type { Metadata } from "next";
import CandidateSidebar from "@/components/layout/candidate-sidebar";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bookmark,
  Clock,
  DollarSign,
  ExternalLink,
  Trash2,
  Send,
  Building,
  Briefcase,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Saved Jobs - Rolevate",
  description: "View and manage your saved job listings",
};

export default async function SavedJobsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

    // Saved jobs will be loaded from API - no demo data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockSavedJobs: any[] = [];

  return (
    <div className="flex min-h-screen bg-background">
      <CandidateSidebar locale={locale} />
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {locale === "ar" ? "الوظائف المحفوظة" : "Saved Jobs"}
            </h1>
            <p className="text-muted-foreground">
              {locale === "ar"
                ? "إدارة الوظائف التي حفظتها للرجوع إليها لاحقاً"
                : "Manage jobs you've saved for later reference"}
            </p>
          </div>

          {/* Stats and Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Bookmark className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {locale === "ar" ? "إجمالي المحفوظات" : "Total Saved"}
                      </p>
                      <p className="text-xl font-bold">5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center gap-4">
              <Select defaultValue="recent">
                <SelectTrigger className="w-48">
                  <SelectValue
                    placeholder={locale === "ar" ? "ترتيب حسب" : "Sort by"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">
                    {locale === "ar" ? "الأحدث" : "Most Recent"}
                  </SelectItem>
                  <SelectItem value="match">
                    {locale === "ar" ? "أفضل تطابق" : "Best Match"}
                  </SelectItem>
                  <SelectItem value="company">
                    {locale === "ar" ? "الشركة" : "Company"}
                  </SelectItem>
                  <SelectItem value="location">
                    {locale === "ar" ? "الموقع" : "Location"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Saved Jobs List */}
          <div className="space-y-4">
            {mockSavedJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
                              {job.title}
                            </h3>
                            {job.urgent && (
                              <Badge variant="destructive" className="text-xs">
                                {locale === "ar" ? "عاجل" : "Urgent"}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Building className="h-4 w-4" />
                            <span>{job.company}</span>
                            <span>•</span>
                            <span>{job.location}</span>
                            {job.isRemote && (
                              <Badge variant="outline" className="text-xs">
                                {locale === "ar" ? "عن بعد" : "Remote"}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              {locale === "ar" ? "نسبة التطابق" : "Match Score"}
                            </div>
                            <div className="text-lg font-bold text-green-600">
                              {job.matchScore}%
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.type}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {job.salary}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {locale === "ar" ? "محفوظ في" : "Saved on"}{" "}
                          {job.savedDate}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {job.tags?.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        {locale === "ar" ? "عرض التفاصيل" : "View Details"}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {locale === "ar" ? "تقدم الآن" : "Apply Now"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bulk Actions */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {locale === "ar" ? "5 وظائف محددة" : "5 jobs selected"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  {locale === "ar" ? "إلغاء تحديد الكل" : "Deselect All"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {locale === "ar" ? "حذف المحدد" : "Delete Selected"}
                </Button>
                <Button size="sm">
                  {locale === "ar" ? "تقدم للكل" : "Apply to All"}
                </Button>
              </div>
            </div>
          </div>

          {/* Empty State (for when no jobs are saved) */}
          {mockSavedJobs.length === 0 && (
            <div className="text-center py-12">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {locale === "ar" ? "لا توجد وظائف محفوظة" : "No saved jobs yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {locale === "ar"
                  ? "ابدأ في حفظ الوظائف التي تهمك للرجوع إليها لاحقاً"
                  : "Start saving jobs that interest you to refer back to them later"}
              </p>
              <Button>
                {locale === "ar" ? "البحث عن وظائف" : "Browse Jobs"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
