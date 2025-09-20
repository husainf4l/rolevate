'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Filter, Search, MapPin, Briefcase } from 'lucide-react';
import { Navbar } from '@/components/common';
import Footer from '@/components/Footer';
import { JobCard } from '@/components/jobs';
import { Job, JobType, ExperienceLevel, SalaryRange } from '@/types/jobs';
import { JobsService } from '@/services/jobsService';

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

  const isRTL = locale === 'ar';

  return (
    <div className="min-h-screen bg-background antialiased">
      <Navbar />

      {/* Header Section */}
      <div className="pt-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing career opportunities and find your next role
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-card/95 backdrop-blur-md rounded-2xl p-6 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchInputChange(e.target.value, 'q')}
                      onKeyPress={handleKeyPress}
                      placeholder={t('searchPlaceholder')}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-background/95 focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => handleSearchInputChange(e.target.value, 'location')}
                      onKeyPress={handleKeyPress}
                      placeholder={t('locationPlaceholder')}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-background/95 focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSearch}
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>

                  <button
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    className={`bg-background/60 hover:bg-background p-3 rounded-xl transition-all duration-300 ${
                      (jobType || experienceLevel || salaryRange) ? 'ring-2 ring-primary/50' : ''
                    }`}
                  >
                    <Filter className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`w-full md:w-80 ${isFiltersOpen ? 'block' : 'hidden md:block'}`}>
            <div className="bg-card/95 backdrop-blur-md rounded-2xl p-6 shadow-xl sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Job Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Job Type
                </label>
                <div className="space-y-2">
                  {[
                    { value: '', label: t('allTypes') },
                    { value: 'full-time' as JobType, label: t('fullTime') },
                    { value: 'part-time' as JobType, label: t('partTime') },
                    { value: 'contract' as JobType, label: t('contract') }
                  ].map((type) => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="radio"
                        name="jobType"
                        value={type.value}
                        checked={jobType === type.value}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="w-4 h-4 text-primary focus:ring-primary/50"
                      />
                      <span className="ml-2 text-sm text-muted-foreground">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Experience Level
                </label>
                <div className="space-y-2">
                  {[
                    { value: '', label: t('anyExperience') },
                    { value: 'entry' as ExperienceLevel, label: t('entryLevel') },
                    { value: 'mid' as ExperienceLevel, label: t('midLevel') },
                    { value: 'senior' as ExperienceLevel, label: t('seniorLevel') }
                  ].map((level) => (
                    <label key={level.value} className="flex items-center">
                      <input
                        type="radio"
                        name="experience"
                        value={level.value}
                        checked={experienceLevel === level.value}
                        onChange={(e) => handleFilterChange('experience', e.target.value)}
                        className="w-4 h-4 text-primary focus:ring-primary/50"
                      />
                      <span className="ml-2 text-sm text-muted-foreground">{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Salary Range
                </label>
                <select
                  value={salaryRange}
                  onChange={(e) => handleFilterChange('salary', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background/95 focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
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

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                {loading ? t('loading') : `${jobs.length} jobs found`}
              </div>

              {/* Sort Dropdown */}
              <select className="px-3 py-2 rounded-lg bg-background/95 focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300 text-sm">
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
                  <div key={i} className="bg-card/95 backdrop-blur-md rounded-2xl p-6 shadow-xl animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-muted rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-6">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} locale={locale} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t('noJobsFound')}
                </h3>
                <p className="text-muted-foreground">
                  {t('noJobsMessage')}
                </p>
              </div>
            )}

            {/* Pagination */}
            {jobs.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center mt-12">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-background/60 hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                        currentPage === i + 1
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background/60 hover:bg-background'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-background/60 hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Next
                  </button>
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
