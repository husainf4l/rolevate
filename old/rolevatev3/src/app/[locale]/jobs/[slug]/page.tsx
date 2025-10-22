"use client";

import { Navbar } from "@/components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Users,
  Building2,
  Star,
  ArrowLeft,
  Share2,
  Bookmark,
  DollarSign,
  Calendar,
  Briefcase,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { DisplayJob } from "@/types/job";
import { jobsService } from "@/services/jobs";
import Footer from "@/components/common/footer";
import { toast } from "sonner";

interface JobDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{
    code?: string;
    q?: string;
    location?: string;
    jobType?: string;
    salary?: string;
    experience?: string;
    company?: string;
  }>;
}



export default function JobDetailPage({ params, /*searchParams*/ }: JobDetailPageProps) {
  const [locale, setLocale] = useState<string>("en");
  const [jobSlug, setJobSlug] = useState<string>("");
  const [job, setJob] = useState<DisplayJob | null>(null);
  const [loading, setLoading] = useState(true);

  // Utility function to generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);

      const response = await jobsService.getJobBySlug(jobSlug);

      if (response.success && response.job) {
        // Transform Job to DisplayJob format
        const displayJob: DisplayJob = {
          id: response.job.id,
          title: response.job.title,
          slug: response.job.slug || generateSlug(response.job.title),
          titleAr: response.job.titleAr || response.job.title,
          company: 'Company Name',
          companyAr: 'اسم الشركة',
          location: response.job.address?.city || response.job.location || 'Remote',
          locationAr: response.job.address?.cityAr || response.job.location || 'عن بعد',
          type: formatJobType(response.job.jobType),
          typeAr: formatJobType(response.job.jobType),
          salary: formatSalary(response.job.salaryMin, response.job.salaryMax, response.job.currency),
          posted: formatPostedDate(response.job.createdAt),
          postedAr: formatPostedDate(response.job.createdAt),
          applicants: 0,
          featured: response.job.featured || response.job.priority === 'HIGH' || response.job.priority === 'URGENT',
          urgent: response.job.urgent || response.job.priority === 'URGENT',
          experience: formatExperienceLevel(response.job.experienceLevel),
          skills: response.job.skills || [],
          tags: response.job.tags,
          description: response.job.description,
          descriptionAr: response.job.descriptionAr || response.job.description,
          requirements: response.job.requirements ? [response.job.requirements] : [],
          requirementsAr: response.job.requirementsAr ? [response.job.requirementsAr] : [],
          benefits: response.job.benefits ? [response.job.benefits] : [],
          benefitsAr: response.job.benefitsAr ? [response.job.benefitsAr] : [],
          companyDescription: 'Company description placeholder',
          companyDescriptionAr: 'وصف الشركة',
        };
        setJob(displayJob);
      } else {
        toast.error(response.message || 'Job not found');
        notFound();
      }
    } catch {
      toast.error('Network error while loading job');
    } finally {
      setLoading(false);
    }
  }, [jobSlug]);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
      setJobSlug(resolvedParams.slug);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (jobSlug) {
      fetchJob();
    }
  }, [jobSlug, fetchJob]);

  const formatJobType = (jobType: string): string => {
    const typeMap: Record<string, string> = {
      'FULL_TIME': 'Full-time',
      'PART_TIME': 'Part-time',
      'CONTRACT': 'Contract',
      'FREELANCE': 'Freelance',
      'INTERNSHIP': 'Internship',
      'TEMPORARY': 'Temporary',
      'REMOTE': 'Remote',
      'HYBRID': 'Hybrid'
    };
    return typeMap[jobType] || jobType;
  };

  const formatSalary = (min?: number, max?: number, currency?: string): string => {
    if (!min && !max) return 'Salary not specified';
    const currencySymbol = currency === 'AED' ? 'AED' : '$';
    if (min && max) {
      return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()}`;
    } else if (min) {
      return `${currencySymbol}${min.toLocaleString()}+`;
    } else if (max) {
      return `Up to ${currencySymbol}${max.toLocaleString()}`;
    }
    return 'Salary not specified';
  };

  const formatPostedDate = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  const formatExperienceLevel = (experienceLevel: string): string => {
    const levelMap: Record<string, string> = {
      'ENTRY_LEVEL': 'entry',
      'JUNIOR': 'junior',
      'MID_LEVEL': 'mid',
      'SENIOR': 'senior',
      'EXECUTIVE': 'executive',
      'LEAD': 'lead',
      'DIRECTOR': 'director',
      'VP': 'vp',
      'C_LEVEL': 'c-level'
    };
    return levelMap[experienceLevel] || experienceLevel.toLowerCase();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
          </div>
        </div>
      <Footer locale={locale} />
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background">
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">Job not found</p>
            <Button asChild>
              <Link href={`/${locale}/jobs`}>
                {locale === 'ar' ? 'العودة إلى الوظائف' : 'Back to Jobs'}
              </Link>
            </Button>
          </div>
        </div>
      <Footer locale={locale} />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="gap-2">
              <Link href={`/${locale}/jobs`}>
                <ArrowLeft className="w-4 h-4" />
                {locale === "ar" ? "العودة إلى الوظائف" : "Back to Jobs"}
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-3">
                        {locale === "ar" ? job.titleAr : job.title}
                      </h1>
                      <div className="flex flex-wrap gap-3 mb-4">
                        {job.featured && (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          >
                            <Star className="w-4 h-4 mr-1" />
                            {locale === "ar" ? "مميز" : "Featured"}
                          </Badge>
                        )}
                        {job.urgent && (
                          <Badge
                            variant="destructive"
                            className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          >
                            {locale === "ar" ? "عاجل" : "Urgent"}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          <span className="font-medium">
                            {locale === "ar" ? job.companyAr : job.company}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          <span>
                            {locale === "ar" ? job.locationAr : job.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5" />
                          <span>{locale === "ar" ? job.typeAr : job.type}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-primary">
                            {job.salary}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{locale === "ar" ? job.postedAr : job.posted}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>
                            {job.applicants}{" "}
                            {locale === "ar" ? "متقدم" : "applicants"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.tags && job.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Job Description */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {locale === "ar" ? "وصف الوظيفة" : "Job Description"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {locale === "ar" ? job.descriptionAr : job.description}
                  </p>
                </CardContent>
              </Card>

              {/* Requirements */}
              {job.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {locale === "ar" ? "المتطلبات" : "Requirements"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(locale === "ar" ? job.requirementsAr : job.requirements).map(
                        (requirement, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {requirement}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {job.benefits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {locale === "ar" ? "المزايا" : "Benefits"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(locale === "ar" ? job.benefitsAr : job.benefits).map(
                        (benefit, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{benefit}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Company Description */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {locale === "ar" ? "عن الشركة" : "About the Company"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {locale === "ar"
                      ? job.companyDescriptionAr
                      : job.companyDescription}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply CTA */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="font-semibold text-foreground mb-2">
                      {locale === "ar"
                        ? "مهتم بهذه الوظيفة؟"
                        : "Interested in this job?"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {locale === "ar"
                        ? "تقدم الآن وكن جزءاً من فريقنا"
                        : "Apply now and become part of our team"}
                    </p>
                    <Button className="w-full">
                      {locale === "ar" ? "تقدم الآن" : "Apply Now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {locale === "ar" ? "معلومات سريعة" : "Quick Info"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {locale === "ar" ? "نوع الوظيفة" : "Job Type"}
                    </span>
                    <span className="text-sm font-medium">
                      {locale === "ar" ? job.typeAr : job.type}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {locale === "ar" ? "مستوى الخبرة" : "Experience Level"}
                    </span>
                    <span className="text-sm font-medium capitalize">
                      {job.experience}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {locale === "ar" ? "الموقع" : "Location"}
                    </span>
                    <span className="text-sm font-medium">
                      {locale === "ar" ? job.locationAr : job.location}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {locale === "ar" ? "الراتب" : "Salary"}
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {job.salary}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {locale === "ar" ? "نشرت" : "Posted"}
                    </span>
                    <span className="text-sm">
                      {locale === "ar" ? job.postedAr : job.posted}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer locale={locale} />
    </>
  );
}
