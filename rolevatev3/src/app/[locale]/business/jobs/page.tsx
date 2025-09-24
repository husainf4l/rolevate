'use client';

'use client';

import BusinessLayout from '@/components/layout/business-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Clock,
  Users,
  Building2,
  Star,
  Filter,
  Search,
  Plus,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { jobsService } from '@/services/jobs';
import { Job } from '@/types/job';
import { useAuthContext } from '@/providers/auth-provider';
import { useRouter } from '@/i18n/navigation';
import { useEffect, useState } from 'react';

interface JobsPageProps {
  params: Promise<{ locale: string }>;
}

export default function JobsPage({ params }: JobsPageProps) {
  const [locale, setLocale] = useState<string>('en');
  const { user } = useAuthContext();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await jobsService.getJobs();
        console.log('Jobs API response:', result); // Debug log

        if (result.success && result.jobs && Array.isArray(result.jobs)) {
          setJobs(result.jobs);
          setError(null); // Clear any previous errors
        } else {
          console.error('Invalid jobs response:', result);
          setError(result.message || 'Failed to load jobs');
          setJobs([]); // Set empty array
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setError('Failed to load jobs. Please try again.');
        setJobs([]); // Set empty array
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);  if (loading) {
    return (
      <BusinessLayout locale={locale}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading jobs...</span>
          </div>
        </div>
      </BusinessLayout>
    );
  }

  if (error) {
    return (
      <BusinessLayout locale={locale}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </BusinessLayout>
    );
  }

  const hasNoJobs = !loading && !error && jobs.length === 0;

  return (
    <BusinessLayout locale={locale}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {locale === 'ar' ? 'الوظائف المتاحة' : 'Available Jobs'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {locale === 'ar' 
                ? 'اكتشف الفرص الوظيفية المناسبة لمهاراتك وخبرتك'
                : 'Discover job opportunities that match your skills and experience'
              }
            </p>
          </div>
          
          <Button className="flex items-center gap-2" onClick={() => router.push('/business/jobs/new')}>
            <Plus className="w-4 h-4" />
            {locale === 'ar' ? 'إضافة وظيفة جديدة' : 'Post New Job'}
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={locale === 'ar' ? 'البحث عن الوظائف...' : 'Search jobs...'}
                className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {locale === 'ar' ? 'تصفية' : 'Filter'}
            </Button>
          </div>
        </Card>

        {/* Jobs Grid or Empty State */}
        {hasNoJobs ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[500px]">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {locale === 'ar' ? 'لا توجد وظائف' : 'No jobs found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {locale === 'ar' 
                  ? 'لم تقم بنشر أي وظائف بعد. ابدأ بإنشاء وظيفتك الأولى!'
                  : 'You haven\'t posted any jobs yet. Start by creating your first job!'
                }
              </p>
              <div className="flex justify-center">
                <Button className="flex items-center gap-2" onClick={() => router.push('/business/jobs/new')}>
                  <Plus className="w-4 h-4" />
                  {locale === 'ar' ? 'إضافة وظيفة جديدة' : 'Create Your First Job'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {job.title}
                        </h3>
                        {job.priority === 'HIGH' && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            <Star className="w-3 h-3 mr-1" />
                            {locale === 'ar' ? 'عاجل' : 'High Priority'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        <span>{job.organizationId}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Location and Type */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{job.jobType.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Salary */}
                  <div className="mb-4">
                    <p className="text-lg font-semibold text-foreground">
                      {job.salaryMin && job.salaryMax 
                        ? `${job.currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                        : job.salaryMin 
                        ? `${job.currency} ${job.salaryMin.toLocaleString()}+`
                        : 'Salary not specified'
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">{job.experienceLevel.replace('_', ' ')}</p>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {(job.skills || job.tags || []).map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{job.numberOfPositions || 1} {locale === 'ar' ? 'منصب' : 'position'}{job.numberOfPositions !== 1 ? (locale === 'ar' ? '' : 's') : ''}</span>
                      </div>
                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Button size="sm" className="text-xs">
                      {locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Load More - only show if there are jobs */}
        {!hasNoJobs && jobs.length > 0 && (
          <div className="flex justify-center pt-8">
            <Button variant="outline" size="lg" className="px-8">
              {locale === 'ar' ? 'تحميل المزيد' : 'Load More Jobs'}
            </Button>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}