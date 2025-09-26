"use client";

import CandidateSidebar from "@/components/layout/candidate-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Search,
  Filter,
  Bookmark,
  ExternalLink,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/hooks/use-toast";

export default function JobsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [locale, setLocale] = useState<string>("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  // Initialize locale from params
  useEffect(() => {
    const initLocale = async () => {
      try {
        const resolvedParams = await params;
        setLocale(resolvedParams.locale);
      } catch (error) {
        console.error("Error resolving params:", error);
        // Keep default 'en' locale
      }
    };
    initLocale();
  }, [params]);

  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "New York, NY",
      type: "Full-time",
      salary: "$80k - $120k",
      posted: "2 days ago",
      description:
        "We are looking for a Senior Frontend Developer to join our team...",
      tags: ["React", "TypeScript", "JavaScript"],
      isRemote: true,
      urgent: true,
    },
    {
      id: 2,
      title: "Full Stack Developer",
      company: "StartupXYZ",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$90k - $130k",
      posted: "1 week ago",
      description: "Join our fast-growing startup as a Full Stack Developer...",
      tags: ["React", "Node.js", "MongoDB"],
      isRemote: false,
      urgent: false,
    },
    {
      id: 3,
      title: "React Developer",
      company: "Digital Agency",
      location: "Remote",
      type: "Contract",
      salary: "$50 - $80/hour",
      posted: "3 days ago",
      description:
        "Looking for an experienced React Developer for a 6-month contract...",
      tags: ["React", "Next.js", "Tailwind"],
      isRemote: true,
      urgent: false,
    },
    {
      id: 4,
      title: "Software Engineer",
      company: "BigTech Corp",
      location: "Seattle, WA",
      type: "Full-time",
      salary: "$100k - $150k",
      posted: "5 days ago",
      description:
        "We are seeking a talented Software Engineer to work on our core platform...",
      tags: ["Python", "Django", "AWS"],
      isRemote: false,
      urgent: true,
    },
    {
      id: 5,
      title: "Junior Developer",
      company: "Local Startup",
      location: "Austin, TX",
      type: "Full-time",
      salary: "$60k - $80k",
      posted: "1 day ago",
      description:
        "Great opportunity for a Junior Developer to grow with our team...",
      tags: ["JavaScript", "React", "Node.js"],
      isRemote: false,
      urgent: false,
    },
  ];

  // Filter jobs based on search criteria
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesLocation =
      !selectedLocation ||
      (selectedLocation === "remote" && job.isRemote) ||
      job.location.toLowerCase().includes(selectedLocation.toLowerCase());

    const matchesJobType =
      !selectedJobType ||
      job.type.toLowerCase().replace("-", " ") ===
        selectedJobType.toLowerCase();

    return matchesSearch && matchesLocation && matchesJobType;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLocation("");
    setSelectedJobType("");
  };

  const hasActiveFilters = searchQuery || selectedLocation || selectedJobType;

  const handleViewDetails = (jobId: number) => {
    router.push(`/jobs/${jobId}`);
  };

  const handleApplyNow = (jobTitle: string, company: string) => {
    toast({
      title: locale === "ar" ? "تم التقديم بنجاح!" : "Application Submitted!",
      description:
        locale === "ar"
          ? `تم إرسال طلبك للوظيفة "${jobTitle}" في ${company}`
          : `Your application for "${jobTitle}" at ${company} has been submitted successfully.`,
      variant: "default",
    });
    // Optionally navigate to applications page
    setTimeout(() => {
      router.push("/dashboard/applications");
    }, 2000);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <CandidateSidebar locale={locale} />
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {locale === "ar" ? "البحث عن وظائف" : "Find Jobs"}
            </h1>
            <p className="text-muted-foreground">
              {locale === "ar"
                ? "استكشف فرص العمل المتاحة وتقدم للوظائف المناسبة"
                : "Discover available job opportunities and apply for positions that match your skills"}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder={
                        locale === "ar" ? "البحث عن وظائف..." : "Search jobs..."
                      }
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={locale === "ar" ? "الموقع" : "Location"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">
                        {locale === "ar" ? "عن بعد" : "Remote"}
                      </SelectItem>
                      <SelectItem value="new-york">New York</SelectItem>
                      <SelectItem value="san-francisco">
                        San Francisco
                      </SelectItem>
                      <SelectItem value="seattle">Seattle</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedJobType}
                    onValueChange={setSelectedJobType}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          locale === "ar" ? "نوع الوظيفة" : "Job Type"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">
                        {locale === "ar" ? "دوام كامل" : "Full-time"}
                      </SelectItem>
                      <SelectItem value="part-time">
                        {locale === "ar" ? "دوام جزئي" : "Part-time"}
                      </SelectItem>
                      <SelectItem value="contract">
                        {locale === "ar" ? "عقد" : "Contract"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {locale === "ar" ? "تصفية" : "Filter"}
                    </Button>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        {locale === "ar" ? "مسح" : "Clear"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {locale === "ar" ? "نتائج البحث" : "Search Results"} (
                {filteredJobs.length})
              </h2>
              <Select defaultValue="recent">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">
                    {locale === "ar" ? "الأحدث" : "Most Recent"}
                  </SelectItem>
                  <SelectItem value="relevant">
                    {locale === "ar" ? "الأكثر صلة" : "Most Relevant"}
                  </SelectItem>
                  <SelectItem value="salary">
                    {locale === "ar" ? "الراتب الأعلى" : "Highest Salary"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
                            {job.title}
                          </h3>
                          <p className="text-muted-foreground">{job.company}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {job.urgent && (
                            <Badge variant="destructive">
                              {locale === "ar" ? "عاجل" : "Urgent"}
                            </Badge>
                          )}
                          <Button variant="ghost" size="sm">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                          {job.isRemote && (
                            <Badge variant="outline" className="ml-1">
                              {locale === "ar" ? "عن بعد" : "Remote"}
                            </Badge>
                          )}
                        </div>
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
                          {job.posted}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.tags.map((tag) => (
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
                      <Button
                        className="flex items-center gap-2"
                        onClick={() => handleViewDetails(job.id)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        {locale === "ar" ? "عرض التفاصيل" : "View Details"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleApplyNow(job.title, job.company)}
                      >
                        {locale === "ar" ? "تقدم الآن" : "Apply Now"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              {locale === "ar" ? "تحميل المزيد" : "Load More Jobs"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
