"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
} from "lucide-react";
import { jobsService } from "@/services/jobs";
import { Job as JobType } from "@/types/job";

// Using Job type from types/job.ts instead of local interface

interface BusinessJobsClientProps {
  locale: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

// No sample data needed - using real API calls

function BusinessJobsContent({ locale, searchParams }: BusinessJobsClientProps) {
  const router = useRouter();
  const t = useTranslations('business.jobs');
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(
    (searchParams.search as string) || ""
  );
  const [filterStatus, setFilterStatus] = useState<string>(
    (searchParams.status as string) || "all"
  );
  const [filterType, setFilterType] = useState<string>(
    (searchParams.type as string) || "all"
  );

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await jobsService.getJobs(1, 50); // Get first 50 jobs
        
        if (response.success && response.jobs) {
          setJobs(response.jobs);
        } else {
          setError(response.message || 'Failed to fetch jobs');
        }
      } catch (err) {
        setError('Network error while fetching jobs');
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    const matchesType = filterType === "all" || job.jobType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'DRAFT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      FULL_TIME: t('types.fullTime'),
      PART_TIME: t('types.partTime'),
      CONTRACT: t('types.contract'),
      REMOTE: t('types.remote'),
    };
    return typeMap[type] || type;
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      ACTIVE: t('statuses.active'),
      PAUSED: t('statuses.paused'),
      CLOSED: t('statuses.closed'),
      DRAFT: t('statuses.draft'),
    };
    return statusMap[status] || status;
  };

  const formatJobSalary = (job: JobType) => {
    if (!job.salaryMin && !job.salaryMax) return t('salaryNotSpecified');
    const currency = job.currency || 'USD';
    if (job.salaryMin && job.salaryMax) {
      return `${currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`;
    } else if (job.salaryMin) {
      return `${currency} ${job.salaryMin.toLocaleString()}+`;
    } else if (job.salaryMax) {
      return `${currency} ${job.salaryMax.toLocaleString()}`;
    }
    return t('salaryNotSpecified');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar' : 'en');
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>{t('loading') || 'Loading jobs...'}</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <Card className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">{t('error') || 'Error'}</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              {t('retry') || 'Retry'}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${locale === 'ar' ? 'lg:flex-row-reverse' : ''}`}>
        <div className={locale === 'ar' ? 'text-right' : 'text-left'}>
          <h1 className="text-3xl font-bold text-foreground">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('subtitle')}
          </p>
        </div>
        
        <Button 
          onClick={() => router.push(`/business/jobs/create`)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('actions.createJob')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('stats.totalJobs')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('stats.activeJobs')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter(job => job.status === 'PUBLISHED').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('stats.totalApplications')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.length * 12} {/* Placeholder - will need applications API */}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('stats.avgApplications')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.length ? 12 : 0} {/* Placeholder average */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className={`flex flex-col lg:flex-row gap-4 ${locale === 'ar' ? 'lg:flex-row-reverse' : ''}`}>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t('search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${locale === 'ar' ? 'pr-10 text-right' : 'pl-10'}`}
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder={t('filters.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                <SelectItem value="ACTIVE">{t('statuses.active')}</SelectItem>
                <SelectItem value="PAUSED">{t('statuses.paused')}</SelectItem>
                <SelectItem value="CLOSED">{t('statuses.closed')}</SelectItem>
                <SelectItem value="DRAFT">{t('statuses.draft')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder={t('filters.type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
                <SelectItem value="FULL_TIME">{t('types.fullTime')}</SelectItem>
                <SelectItem value="PART_TIME">{t('types.partTime')}</SelectItem>
                <SelectItem value="CONTRACT">{t('types.contract')}</SelectItem>
                <SelectItem value="REMOTE">{t('types.remote')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${locale === 'ar' ? 'lg:flex-row-reverse' : ''}`}>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      {job.title}
                    </h3>
                    <Badge className={getStatusColor(job.status)}>
                      {getStatusDisplay(job.status)}
                    </Badge>
                  </div>
                  
                  <div className={`flex flex-wrap items-center gap-4 text-sm text-muted-foreground ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location || job.workLocation}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>12 {t('applicants')}</span> {/* Placeholder - need applications API */}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(job.createdAt)}</span>
                    </div>
                    {(job.salaryMin || job.salaryMax) && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatJobSalary(job)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <Badge variant="outline">{job.category}</Badge>
                    <Badge variant="outline">{getTypeDisplay(job.jobType)}</Badge>
                  </div>
                </div>
                
                <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    {t('actions.view')}
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        {t('actions.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="w-4 h-4 mr-2" />
                        {t('actions.duplicate')}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('actions.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredJobs.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                <h3 className="text-lg font-semibold mb-2">
                  {t('noJobs.title')}
                </h3>
                <p className="text-sm">
                  {t('noJobs.description')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function BusinessJobsClient(props: BusinessJobsClientProps) {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <BusinessJobsContent {...props} />
    </Suspense>
  );
}