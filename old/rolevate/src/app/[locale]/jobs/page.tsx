'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Filter, Search, MapPin, Briefcase } from 'lucide-react';
import { Navbar } from '@/components/common';
import Footer from '@/components/Footer';
import { Job, JobType, ExperienceLevel, SalaryRange } from '@/types/jobs';
import { JobsService } from '@/services/jobsService';
import dynamic from 'next/dynamic';
import { Button } from '@/components/common';

// Dynamically import JobCard to prevent hydration issues
const JobCard = dynamic(() => import('@/components/jobs').then(mod => ({ default: mod.JobCard })), {
  ssr: false,
  loading: () => (
    <div className="bg-card rounded-xl p-8 animate-pulse">
      <div className="flex gap-6">
        <div className="w-16 h-16 bg-muted rounded-xl"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-1/3"></div>
        </div>
      </div>
    </div>
  )
});

export default function JobsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const [locale, setLocale] = useState('en');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState<JobType | ''>('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>('');
  const [salaryRange, setSalaryRange] = useState<SalaryRange | ''>('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isClient, setIsClient] = useState(false);

  const t = useTranslations('jobs');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Function to update URL parameters
  const updateURLParams = (params: Record<string, string | number | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === '' || value === undefined) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value.toString());
      }
    });

    const newURL = `${pathname}?${newSearchParams.toString()}`;
    router.replace(newURL, { scroll: false });
  };

  useEffect(() => {
    const fetchLocale = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    fetchLocale();
    setIsClient(true);
  }, [params]);

  useEffect(() => {
    // Initialize search from URL params
    const q = searchParams.get('q') || '';
    const loc = searchParams.get('location') || '';
    const type = searchParams.get('type') as JobType || '';
    const experience = searchParams.get('experience') as ExperienceLevel || '';
    const salary = searchParams.get('salary') as SalaryRange || '';
    const page = parseInt(searchParams.get('page') || '1', 10);

    setSearchQuery(q);
    setLocation(loc);
    setJobType(type);
    setExperienceLevel(experience);
    setSalaryRange(salary);
    setCurrentPage(page);
  }, [searchParams]);

  useEffect(() => {
    // Fetch jobs from service with current filters
    const fetchJobs = () => {
      const filters = {
        searchQuery: searchQuery || undefined,
        location: location || undefined,
        jobType: jobType || undefined,
        experienceLevel: experienceLevel || undefined,
        salaryRange: salaryRange || undefined,
      };

      const filteredJobs = JobsService.getJobs(filters);

      setTimeout(() => {
        setJobs(filteredJobs);
        setLoading(false);
        setTotalPages(Math.ceil(filteredJobs.length / 12));
      }, 1000);
    };

    fetchJobs();
  }, [searchQuery, location, jobType, experienceLevel, salaryRange]);

  const handleSearch = () => {
    const params = {
      q: searchQuery.trim() || null,
      location: location.trim() || null,
      type: jobType || null,
      experience: experienceLevel || null,
      salary: salaryRange || null,
      page: 1 // Reset to first page on new search
    };
    updateURLParams(params);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    const params: Record<string, string | number | null> = {
      [filterType]: value || null,
      page: 1 // Reset to first page when filters change
    };

    // Update the specific filter state
    switch (filterType) {
      case 'type':
        setJobType(value as JobType);
        break;
      case 'experience':
        setExperienceLevel(value as ExperienceLevel);
        break;
      case 'salary':
        setSalaryRange(value as SalaryRange);
        break;
    }

    updateURLParams(params);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    updateURLParams({ page });
    setCurrentPage(page);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearchInputChange = (value: string, field: 'q' | 'location') => {
    if (field === 'q') {
      setSearchQuery(value);
    } else {
      setLocation(value);
    }
  };

  const clearFilters = () => {
    const params = {
      q: null,
      location: null,
      type: null,
      experience: null,
      salary: null,
      page: 1
    };
    updateURLParams(params);

    setSearchQuery('');
    setLocation('');
    setJobType('');
    setExperienceLevel('');
    setSalaryRange('');
    setCurrentPage(1);
  };

  // const isRTL = isClient && locale === 'ar';

  // Prevent hydration mismatch by showing loading state until client mounts
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background antialiased">
        <Navbar />
        <div className="pt-20 bg-background">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
              <div className="h-16 bg-muted rounded-lg animate-pulse mb-6"></div>
              <div className="h-6 bg-muted rounded-lg animate-pulse max-w-3xl mx-auto"></div>
            </div>
            <div className="w-full max-w-6xl mx-auto">
              <div className="bg-card rounded-2xl shadow-lg h-16 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex gap-12">
            <div className="w-full md:w-80">
              <div className="bg-muted/20 rounded-2xl p-8 h-96 animate-pulse shadow-lg"></div>
            </div>
            <div className="flex-1">
              <div className="space-y-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`rounded-2xl p-8 animate-pulse shadow-lg ${
                    i % 2 === 0 ? 'bg-card' : 'bg-muted/30'
                  }`}>
                    <div className="flex gap-6">
                      <div className="w-16 h-16 bg-muted rounded-xl"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer locale="en" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background antialiased transition-colors duration-300">
      <Navbar />

      {/* Header Section - Google Careers Style */}
      <div className="pt-20 bg-background transition-colors duration-300">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-normal text-foreground mb-4 sm:mb-6 tracking-tight transition-colors duration-300">
              {t('title')}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-normal leading-relaxed transition-colors duration-300">
              Discover amazing career opportunities and find your next role
            </p>
          </div>

          {/* Search Bar - Google Style */}
          <div className="w-full max-w-6xl mx-auto">
            <div className="bg-card rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 backdrop-blur-sm">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 transition-colors duration-300" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchInputChange(e.target.value, 'q')}
                      onKeyPress={handleKeyPress}
                      placeholder={t('searchPlaceholder')}
                      className="w-full pl-14 pr-5 py-5 bg-transparent border-0 focus:ring-0 focus:outline-none text-foreground placeholder-muted-foreground text-lg transition-colors duration-300"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 transition-colors duration-300" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => handleSearchInputChange(e.target.value, 'location')}
                      onKeyPress={handleKeyPress}
                      placeholder={t('locationPlaceholder')}
                      className="w-full pl-14 pr-5 py-5 bg-transparent border-0 focus:ring-0 focus:outline-none text-foreground placeholder-muted-foreground text-lg transition-colors duration-300"
                    />
                  </div>
                </div>

                <div className="flex">
                  <Button
                    onClick={handleSearch}
                    variant="default"
                    size="lg"
                    leftIcon={<Search className="w-5 h-5" />}
                    className="flex-1"
                  >
                    Search
                  </Button>

                  <Button
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    variant="ghost"
                    size="lg"
                    className={(jobType || experienceLevel || salaryRange) ? 'bg-primary/10' : ''}
                  >
                    <Filter className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-12">
          {/* Filters Sidebar - Google Style */}
          <div className={`w-full md:w-80 ${isFiltersOpen ? 'block' : 'hidden md:block'}`}>
            <div className="bg-muted/20 rounded-2xl p-8 sticky top-28 transition-all duration-500 shadow-lg hover:shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-medium text-foreground transition-colors duration-300">Filters</h3>
                <Button
                  onClick={clearFilters}
                  variant="link"
                  size="sm"
                >
                  Clear All
                </Button>
              </div>

              {/* Job Type Filter */}
              <div className="mb-8">
                <label className="block text-base font-medium text-foreground mb-4 transition-colors duration-300">
                  Job Type
                </label>
                <div className="space-y-4">
                  {[
                    { value: '', label: t('allTypes') },
                    { value: 'full-time' as JobType, label: t('fullTime') },
                    { value: 'part-time' as JobType, label: t('partTime') },
                    { value: 'contract' as JobType, label: t('contract') }
                  ].map((type) => (
                    <label key={type.value} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="jobType"
                        value={type.value}
                        checked={jobType === type.value}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="w-5 h-5 text-primary focus:ring-primary focus:ring-2 transition-colors duration-300"
                      />
                      <span className="ml-4 text-base text-muted-foreground group-hover:text-foreground transition-colors duration-300">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level Filter */}
              <div className="mb-8">
                <label className="block text-base font-medium text-foreground mb-4 transition-colors duration-300">
                  Experience Level
                </label>
                <div className="space-y-4">
                  {[
                    { value: '', label: t('anyExperience') },
                    { value: 'entry' as ExperienceLevel, label: t('entryLevel') },
                    { value: 'mid' as ExperienceLevel, label: t('midLevel') },
                    { value: 'senior' as ExperienceLevel, label: t('seniorLevel') }
                  ].map((level) => (
                    <label key={level.value} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="experience"
                        value={level.value}
                        checked={experienceLevel === level.value}
                        onChange={(e) => handleFilterChange('experience', e.target.value)}
                        className="w-5 h-5 text-primary focus:ring-primary focus:ring-2 transition-colors duration-300"
                      />
                      <span className="ml-4 text-base text-muted-foreground group-hover:text-foreground transition-colors duration-300">{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary Range Filter */}
              <div className="mb-8">
                <label className="block text-base font-medium text-foreground mb-4 transition-colors duration-300">
                  Salary Range
                </label>
                <select
                  value={salaryRange}
                  onChange={(e) => handleFilterChange('salary', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background/50 text-foreground focus:ring-2 focus:ring-primary transition-all duration-300 text-base hover:bg-background/80 shadow-sm hover:shadow-md"
                >
                  <option value="">{t('anySalary')}</option>
                  <option value="0-30000">$0 - $30,000</option>
                  <option value="30000-50000">$30,000 - $50,000</option>
                  <option value="50000-80000">$50,000 - $80,000</option>
                  <option value="80000-120000">$80,000 - $120,000</option>
                  <option value="120000+">$120,000+</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content - Google Style */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="text-base text-muted-foreground transition-colors duration-300">
                {loading ? t('loading') : `${jobs.length} jobs found`}
              </div>

              {/* Sort Dropdown */}
              <select className="px-4 py-3 rounded-xl bg-background/50 text-foreground focus:ring-2 focus:ring-primary transition-all duration-300 text-base hover:bg-background/80 shadow-sm hover:shadow-md">
                <option>Most Recent</option>
                <option>Most Relevant</option>
                <option>Highest Salary</option>
                <option>Company Rating</option>
              </select>
            </div>

            {/* Job Listings */}
            {loading ? (
              <div className="space-y-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`rounded-2xl p-8 animate-pulse transition-all duration-300 shadow-lg ${
                    i % 2 === 0 ? 'bg-card' : 'bg-muted/30'
                  }`}>
                    <div className="flex gap-6">
                      <div className="w-16 h-16 bg-muted rounded-xl"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-6">
                {jobs.map((job, index) => (
                  <JobCard key={job.id} job={job} locale={locale} variant={index % 2 === 0 ? 'primary' : 'secondary'} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
                  <Briefcase className="w-10 h-10 text-muted-foreground transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-3 transition-colors duration-300">
                  {t('noJobsFound')}
                </h3>
                <p className="text-lg text-muted-foreground transition-colors duration-300">
                  {t('noJobsMessage')}
                </p>
              </div>
            )}

            {/* Pagination - Google Style */}
            {jobs.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center mt-16">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="default"
                  >
                    Previous
                  </Button>

                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      variant={currentPage === i + 1 ? 'default' : 'outline'}
                      size="default"
                    >
                      {i + 1}
                    </Button>
                  ))}

                  <Button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="default"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer locale={locale} />
    </div>
  );
}
