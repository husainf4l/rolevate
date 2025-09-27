"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Users,
  Building2,
  Star,
  Search,
  Filter,
  Briefcase,
  DollarSign,
  Calendar,
  ChevronDown,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Job } from "@/types/job";
import { jobsService } from "@/services/jobs";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface JobsListingProps {
  locale: string;
  initialJobs?: Job[];
}

interface DisplayJob {
  id: string;
  title: string;
  slug: string;
  titleAr: string;
  company: string;
  companyAr: string;
  location: string;
  locationAr: string;
  type: string;
  typeAr: string;
  salary: string;
  posted: string;
  postedAr: string;
  applicants: number;
  featured: boolean;
  urgent: boolean;
  experience: string;
  skills: string[];
  description: string;
  descriptionAr: string;
}

export default function JobsListing({ locale, initialJobs = [] }: JobsListingProps) {
  const t = useTranslations('jobs');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [jobs, setJobs] = useState<DisplayJob[]>([]);
  const [, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [itemsPerPage] = useState(20);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedSalary, setSelectedSalary] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");

  // Utility functions
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const formatJobType = (type: string): string => {
    const typeMap: Record<string, string> = {
      FULL_TIME: t('jobTypes.fullTime'),
      PART_TIME: t('jobTypes.partTime'),
      CONTRACT: t('jobTypes.contract'),
      REMOTE: t('jobTypes.remote'),
    };
    return typeMap[type] || type;
  };

  const formatSalary = (min?: number, max?: number, currency?: string): string => {
    if (!min && !max) return t('anySalary');
    const curr = currency || 'AED';
    if (min && max) return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${curr} ${min.toLocaleString()}+`;
    return `${curr} ${max?.toLocaleString()}`;
  };

  const formatPostedDate = (date: string): string => {
    const posted = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return locale === 'ar' ? 'منذ يوم واحد' : '1 day ago';
    if (diffDays < 7) return locale === 'ar' ? `منذ ${diffDays} أيام` : `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return locale === 'ar' ? `منذ ${weeks} أسبوع` : `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    return locale === 'ar' ? 'منذ أكثر من شهر' : '1+ month ago';
  };

  const formatExperienceLevel = (level: string): string => {
    const levelMap: Record<string, string> = {
      ENTRY: t('experienceLevels.entry'),
      MID: t('experienceLevels.mid'),
      SENIOR: t('experienceLevels.senior'),
      LEAD: t('experienceLevels.lead'),
    };
    return levelMap[level] || level;
  };

  const fetchJobs = useCallback(async (page: number = currentPage) => {
    try {
      setLoading(true);
      const response = await jobsService.getJobs(page, itemsPerPage);

      if (response.success && response.jobs) {
        const displayJobs: DisplayJob[] = response.jobs.map((job: Job) => ({
          id: job.id,
          title: job.title,
          slug: job.slug || generateSlug(job.title),
          titleAr: job.titleAr || job.title,
          company: 'TechCorp Solutions',
          companyAr: 'تك كورب سولوشنز',
          location: job.address ? `${job.address.city}, ${job.address.country}` : t('remote'),
          locationAr: job.address ? `${job.address.cityAr || job.address.city}, ${job.address.countryAr || job.address.country}` : t('remote'),
          type: formatJobType(job.jobType),
          typeAr: formatJobType(job.jobType),
          salary: formatSalary(job.salaryMin, job.salaryMax, job.currency),
          posted: formatPostedDate(job.createdAt),
          postedAr: formatPostedDate(job.createdAt),
          applicants: 0,
          featured: job.featured || false,
          urgent: job.urgent || false,
          experience: formatExperienceLevel(job.experienceLevel),
          skills: job.tags || job.skills || [],
          description: job.description,
          descriptionAr: job.descriptionAr || job.description,
        }));
        
        setJobs(displayJobs);
        
        if (response.pagination) {
          setTotalJobs(response.pagination.total);
          setTotalPages(response.pagination.totalPages);
          setCurrentPage(response.pagination.page);
        }
      } else {
        toast.error(response.message || t('loading'));
      }
    } catch {
      toast.error(t('loading'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, t, locale]);

  // Initialize search params from URL
  useEffect(() => {
    const query = searchParams?.get("q") || "";
    const location = searchParams?.get("location") || "";
    const jobType = searchParams?.get("type") || "";
    const filterLocation = searchParams?.get("filterLocation") || "";
    const salary = searchParams?.get("salary") || "";
    const experience = searchParams?.get("experience") || "";

    setSearchQuery(query);
    setSearchLocation(location);
    setSelectedJobType(jobType);
    setSelectedLocation(filterLocation);
    setSelectedSalary(salary);
    setSelectedExperience(experience);

    fetchJobs(1);
  }, [searchParams, fetchJobs]);

  // Search and filter functions
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (searchLocation) params.set("location", searchLocation);
    if (selectedJobType && selectedJobType !== "all") params.set("type", selectedJobType);
    
    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '';
    router.push(newUrl);
  };

  const handleJobTypeChange = (value: string) => {
    setSelectedJobType(value);
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value && value !== "all") {
      params.set("type", value);
    } else {
      params.delete("type");
    }
    router.push(`?${params.toString()}`);
  };

  const handleLocationFilterChange = (value: string) => {
    setSelectedLocation(value);
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value && value !== "all") {
      params.set("filterLocation", value);
    } else {
      params.delete("filterLocation");
    }
    router.push(`?${params.toString()}`);
  };

  const handleSalaryChange = (value: string) => {
    setSelectedSalary(value);
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value && value !== "all") {
      params.set("salary", value);
    } else {
      params.delete("salary");
    }
    router.push(`?${params.toString()}`);
  };

  const handleExperienceChange = (value: string) => {
    setSelectedExperience(value);
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value && value !== "all") {
      params.set("experience", value);
    } else {
      params.delete("experience");
    }
    router.push(`?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchLocation("");
    setSelectedJobType("");
    setSelectedLocation("");
    setSelectedSalary("");
    setSelectedExperience("");
    router.push('/jobs');
  };

  // Filter jobs based on search and filter criteria
  const filteredJobs = jobs.filter((job) => {
    // Search query filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesTitle = (locale === "ar" ? job.titleAr : job.title).toLowerCase().includes(searchLower);
      const matchesCompany = (locale === "ar" ? job.companyAr : job.company).toLowerCase().includes(searchLower);
      const matchesSkills = job.skills.some(skill => skill.toLowerCase().includes(searchLower));
      if (!matchesTitle && !matchesCompany && !matchesSkills) {
        return false;
      }
    }

    // Location search filter
    if (searchLocation) {
      const locationLower = searchLocation.toLowerCase();
      const jobLocation = (locale === "ar" ? job.locationAr : job.location).toLowerCase();
      if (!jobLocation.includes(locationLower)) {
        return false;
      }
    }

    // Job type filter
    const jobType = searchParams?.get("type");
    if (jobType && jobType !== "all" && job.type !== jobType) {
      return false;
    }

    // Location filter (from sidebar)
    const filterLocation = searchParams?.get("filterLocation");
    if (filterLocation && filterLocation !== "all") {
      const locationMap: Record<string, string> = {
        uae: t('locations.uae'),
        saudi: t('locations.saudi'),
        qatar: t('locations.qatar'),
        kuwait: t('locations.kuwait'),
        remote: t('locations.remote'),
      };
      if (!job.location.includes(locationMap[filterLocation] || filterLocation)) {
        return false;
      }
    }

    // Salary filter
    const salary = searchParams?.get("salary");
    if (salary && salary !== "all") {
      const salaryRanges: Record<string, [number, number]> = {
        "0-5000": [0, 5000],
        "5000-10000": [5000, 10000],
        "10000-15000": [10000, 15000],
        "15000+": [15000, Infinity],
      };
      const [min, max] = salaryRanges[salary] || [0, Infinity];
      const jobSalary = parseInt(job.salary.replace(/[^0-9]/g, ""));
      if (jobSalary < min || jobSalary > max) {
        return false;
      }
    }

    // Experience level filter
    const experience = searchParams?.get("experience");
    if (experience && experience !== "all" && job.experience !== experience) {
      return false;
    }

    return true;
  });

  // Check if there's an active search
  const hasActiveSearch = searchQuery || searchLocation || 
                         (selectedJobType && selectedJobType !== "all") ||
                         (selectedLocation && selectedLocation !== "all") ||
                         (selectedSalary && selectedSalary !== "all") ||
                         (selectedExperience && selectedExperience !== "all");

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/5 py-12 border-b border-border/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {locale === 'ar' 
                ? 'اكتشف الفرص الوظيفية المناسبة لمهاراتك وخبراتك' 
                : 'Discover career opportunities that match your skills and experience'
              }
            </p>
          </div>

          {/* Search Form */}
          <Card className="shadow-lg border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder={t('searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`${locale === 'ar' ? 'pr-10 text-right' : 'pl-10'} h-12 bg-background border-border/50 focus:border-primary/50`}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                </div>
                
                <div className="flex-1 lg:max-w-xs">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder={t('locationPlaceholder')}
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className={`${locale === 'ar' ? 'pr-10 text-right' : 'pl-10'} h-12 bg-background border-border/50 focus:border-primary/50`}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSearch} 
                  className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {locale === 'ar' ? 'بحث' : 'Search'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex gap-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden w-full mb-4">
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full justify-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              {t('filterResults')}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Sidebar Filters */}
          <aside 
            className={`
              lg:w-80 lg:block lg:static lg:bg-transparent
              ${showMobileFilters ? 'block' : 'hidden'}
              fixed inset-0 bg-background/95 backdrop-blur-sm z-50 lg:z-auto
              overflow-y-auto lg:overflow-visible
              p-4 lg:p-0
            `}
          >
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between lg:justify-start">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Filter className="w-5 h-5" />
                    {t('filterResults')}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileFilters(false)}
                    className="lg:hidden hover:bg-muted ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-0">
                {/* Job Type */}
                <div>
                  <label className={`text-sm font-medium mb-2 block ${locale === 'ar' ? 'text-right' : ''}`}>
                    {t('jobType')}
                  </label>
                  <Select
                    value={selectedJobType}
                    onValueChange={handleJobTypeChange}
                  >
                    <SelectTrigger className={locale === 'ar' ? 'text-right' : ''}>
                      <SelectValue placeholder={t('selectJobType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('all')}</SelectItem>
                      <SelectItem value="Full-time">{t('jobTypes.fullTime')}</SelectItem>
                      <SelectItem value="Part-time">{t('jobTypes.partTime')}</SelectItem>
                      <SelectItem value="Contract">{t('jobTypes.contract')}</SelectItem>
                      <SelectItem value="Remote">{t('jobTypes.remote')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <label className={`text-sm font-medium mb-2 block ${locale === 'ar' ? 'text-right' : ''}`}>
                    {t('location')}
                  </label>
                  <Select
                    value={selectedLocation}
                    onValueChange={handleLocationFilterChange}
                  >
                    <SelectTrigger className={locale === 'ar' ? 'text-right' : ''}>
                      <SelectValue placeholder={t('selectLocation')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('all')}</SelectItem>
                      <SelectItem value="uae">{t('locations.uae')}</SelectItem>
                      <SelectItem value="saudi">{t('locations.saudi')}</SelectItem>
                      <SelectItem value="qatar">{t('locations.qatar')}</SelectItem>
                      <SelectItem value="kuwait">{t('locations.kuwait')}</SelectItem>
                      <SelectItem value="remote">{t('locations.remote')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Salary Range */}
                <div>
                  <label className={`text-sm font-medium mb-2 block ${locale === 'ar' ? 'text-right' : ''}`}>
                    {t('salaryRange')}
                  </label>
                  <Select
                    value={selectedSalary}
                    onValueChange={handleSalaryChange}
                  >
                    <SelectTrigger className={locale === 'ar' ? 'text-right' : ''}>
                      <SelectValue placeholder={t('selectSalary')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('all')}</SelectItem>
                      <SelectItem value="0-5000">{t('salaryRanges.0-5000')}</SelectItem>
                      <SelectItem value="5000-10000">{t('salaryRanges.5000-10000')}</SelectItem>
                      <SelectItem value="10000-15000">{t('salaryRanges.10000-15000')}</SelectItem>
                      <SelectItem value="15000+">{t('salaryRanges.15000+')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className={`text-sm font-medium mb-2 block ${locale === 'ar' ? 'text-right' : ''}`}>
                    {t('experienceLevel')}
                  </label>
                  <Select
                    value={selectedExperience}
                    onValueChange={handleExperienceChange}
                  >
                    <SelectTrigger className={locale === 'ar' ? 'text-right' : ''}>
                      <SelectValue placeholder={t('selectExperience')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('all')}</SelectItem>
                      <SelectItem value="Entry Level">{t('experienceLevels.entry')}</SelectItem>
                      <SelectItem value="Mid Level">{t('experienceLevels.mid')}</SelectItem>
                      <SelectItem value="Senior Level">{t('experienceLevels.senior')}</SelectItem>
                      <SelectItem value="Lead/Manager">{t('experienceLevels.lead')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Jobs List */}
          <main className="flex-1">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-muted-foreground" />
                  <span className="text-lg font-medium">
                    {t('searchResults')}
                  </span>
                  <Badge variant="secondary" className="ml-2">
                    {filteredJobs.length} {filteredJobs.length === 1 ? t('job') : t('jobs')}
                  </Badge>
                </div>
                {hasActiveSearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4 mr-1" />
                    {t('clearSearch')}
                  </Button>
                )}
              </div>
              {hasActiveSearch && (
                <p className={`text-sm text-muted-foreground ${locale === 'ar' ? 'text-right' : ''}`}>
                  {locale === 'ar' 
                    ? `عرض ${filteredJobs.length} من أصل ${jobs.length} وظيفة مطابقة للبحث`
                    : `Showing ${filteredJobs.length} of ${jobs.length} jobs matching your search`
                  }
                </p>
              )}
            </div>

            {/* Jobs List */}
            <div className="space-y-4 mb-8">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="hover:shadow-lg transition-all duration-300 border-border/30 hover:border-primary/30 group bg-card"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Job Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Link href={`/jobs/${job.slug}`}>
                                <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors cursor-pointer">
                                  {locale === "ar" ? job.titleAr : job.title}
                                </h3>
                              </Link>
                              {job.featured && (
                                <Badge
                                  variant="secondary"
                                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                                >
                                  <Star className="w-3 h-3 mr-1" />
                                  {t('featured')}
                                </Badge>
                              )}
                              {job.urgent && (
                                <Badge
                                  variant="destructive"
                                  className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
                                >
                                  {t('urgent')}
                                </Badge>
                              )}
                            </div>

                            <div className={`flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-muted-foreground/70" />
                                <span className="font-medium">
                                  {locale === "ar" ? job.companyAr : job.company}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-muted-foreground/70" />
                                <span>
                                  {locale === "ar" ? job.locationAr : job.location}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4 text-muted-foreground/70" />
                                <span>
                                  {locale === "ar" ? job.typeAr : job.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <DollarSign className="w-4 h-4 text-muted-foreground/70" />
                                <span>{job.salary}</span>
                              </div>
                            </div>

                            {/* Skills */}
                            {job.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {job.skills.slice(0, 4).map((skill, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {job.skills.length > 4 && (
                                  <Badge variant="outline" className="text-xs text-muted-foreground">
                                    +{job.skills.length - 4}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Description Preview */}
                            <p className={`text-sm text-muted-foreground line-clamp-2 ${locale === 'ar' ? 'text-right' : ''}`}>
                              {locale === "ar" ? job.descriptionAr : job.description}
                            </p>
                          </div>
                        </div>

                        {/* Job Footer */}
                        <div className={`flex items-center justify-between pt-4 border-t border-border/50 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex items-center gap-4 text-xs text-muted-foreground ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {t('posted')} {locale === "ar" ? job.postedAr : job.posted}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{job.applicants} {t('applicants')}</span>
                            </div>
                          </div>
                          <div className={`flex gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                            <Link href={`/jobs/${job.slug}`}>
                              <Button variant="outline" size="sm" className="hover:bg-muted">
                                {t('viewDetails')}
                              </Button>
                            </Link>
                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                              {t('applyNow')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Jobs Found */}
            {filteredJobs.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Briefcase className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t('noJobsFound')}</h3>
                  <p className="text-muted-foreground mb-6">
                    {t('noJobsMessage')}
                  </p>
                  {hasActiveSearch && (
                    <Button onClick={clearSearch} variant="outline">
                      {t('clearSearch')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}