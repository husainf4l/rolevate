"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Users,
  Building2,
  Star,
  ArrowRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Job } from '@/types/job';
import { jobsService } from '@/services/jobs';
import { toast } from 'sonner';

interface LatestJobsProps {
  locale: string;
}

interface DisplayJob {
  id: string;
  title: string;
  slug: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  applicants: number;
  featured: boolean;
}

export default function LatestJobs({ locale }: LatestJobsProps) {
  const [jobs, setJobs] = useState<DisplayJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Utility function to generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const fetchLatestJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobsService.getJobs();

      if (response.success && response.jobs) {
        // Transform Job[] to DisplayJob[] format
        const displayJobs: DisplayJob[] = response.jobs.slice(0, 6).map((job: Job) => ({
          id: job.id,
          title: job.title,
          slug: job.slug || generateSlug(job.title),
          company: 'Company', // TODO: Add company name from organization data
          location: job.location || 'Remote',
          type: formatJobType(job.jobType),
          salary: formatSalary(job.salaryMin, job.salaryMax, job.currency),
          posted: formatPostedDate(job.createdAt),
          applicants: 0, // TODO: Add applicant count from API
          featured: job.priority === 'HIGH' || job.priority === 'URGENT'
        }));
        setJobs(displayJobs);
      } else {
        toast.error(response.message || 'Failed to load jobs');
      }
    } catch {
      toast.error('Network error while loading jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestJobs();
  }, [fetchLatestJobs]);

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

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {locale === 'ar' ? 'أحدث الوظائف' : 'Latest Jobs'}
            </h2>
            <p className="text-muted-foreground">
              {locale === 'ar'
                ? 'اكتشف الفرص الوظيفية المتاحة'
                : 'Discover available job opportunities'
              }
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {locale === 'ar' ? 'أحدث الوظائف' : 'Latest Jobs'}
            </h2>
            <p className="text-muted-foreground">
              {locale === 'ar'
                ? 'اكتشف الفرص الوظيفية المتاحة'
                : 'Discover available job opportunities'
              }
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchLatestJobs}>
              {locale === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {locale === 'ar' ? 'أحدث الوظائف' : 'Latest Jobs'}
          </h2>
          <p className="text-muted-foreground">
            {locale === 'ar' 
              ? 'اكتشف الفرص الوظيفية المتاحة'
              : 'Discover available job opportunities'
            }
          </p>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {jobs.map((job) => (
            <Link key={job.id} href={`/${locale}/jobs/${job.slug}`} className="block">
              <Card className="group hover:shadow-md transition-all duration-200 border-border/30 hover:border-primary/30 cursor-pointer">
                <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      {job.featured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs px-2 py-0.5">
                          <Star className="w-3 h-3 mr-1" />
                          {locale === 'ar' ? 'مميز' : 'Featured'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate">{job.company}</span>
                    </div>
                  </div>
                </div>

                {/* Location and Salary */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{job.salary}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{job.posted}</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{job.applicants}</span>
                  </div>
                </div>
              </div>
            </Card>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button asChild variant="outline" size="sm">
            <Link href={`/${locale}/business/jobs`}>
              {locale === 'ar' ? 'عرض جميع الوظائف' : 'View All Jobs'}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
