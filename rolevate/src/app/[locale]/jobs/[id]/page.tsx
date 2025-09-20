'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Building,
  Users,
  Star,
  CheckCircle,
  ExternalLink,
  Heart,
  Share2
} from 'lucide-react';
import { Navbar } from '@/components/common';
import Footer from '@/components/Footer';
import { Job } from '@/types/jobs';
import { JobsService } from '@/services/jobsService';

interface JobDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const [locale, setLocale] = useState('en');
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const t = useTranslations('jobs');
  // const router = useRouter(); // Commented out as not currently used

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resolvedParams = await params;
        setLocale(resolvedParams.locale);

        const jobData = JobsService.getJobById(resolvedParams.id);

        if (!jobData) {
          setError('Job not found');
          setLoading(false);
          return;
        }

        setJob(jobData);
        setLoading(false);
      } catch (_err) {
        setError('Failed to load job details');
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const handleSave = async () => {
    if (!job) return;

    try {
      // In a real app, this would call an API
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Failed to save job:', error);
    }
  };

  const handleApply = async () => {
    if (!job) return;

    setIsApplying(true);
    try {
      // In a real app, this would redirect to application form or external link
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Failed to apply for job:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleShare = async () => {
    if (!job) return;

    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this job: ${job.title} at ${job.company}`,
          url: url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background antialiased relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-accent/10 to-primary/10 rounded-full blur-3xl animate-float-delayed"></div>
        
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[60vh] relative z-10">
          <div className="backdrop-blur-xl bg-white/5 border-0 shadow-2xl p-12 rounded-none">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="animate-spin rounded-none h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-none animate-pulse"></div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Loading Job Details</h2>
                <p className="text-muted-foreground">Please wait while we fetch the information...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer locale={locale} />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background antialiased relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-accent/10 to-primary/10 rounded-full blur-3xl animate-float-delayed"></div>
        
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[60vh] relative z-10">
          <div className="backdrop-blur-xl bg-white/5 border-0 shadow-2xl p-12 rounded-none max-w-md mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-none flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Building className="w-10 h-10 text-red-400" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                {error || 'Job Not Found'}
              </h1>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                The job you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold py-4 px-8 rounded-none transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 backdrop-blur-sm"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Jobs
              </Link>
            </div>
          </div>
        </div>
        <Footer locale={locale} />
      </div>
    );
  }

  const formatJobType = (type: string) => {
    return type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-background antialiased relative overflow-hidden">
      {/* Advanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/3 via-transparent to-accent/3"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-primary/8 to-accent/8 rounded-full blur-3xl animate-float opacity-60"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-l from-accent/8 to-primary/8 rounded-full blur-3xl animate-float-delayed opacity-60"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl animate-pulse-glow"></div>
      </div>

      <Navbar />

      {/* Enhanced Header Section */}
      <div className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80 backdrop-blur-sm"></div>

        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16 relative z-10">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-3 text-muted-foreground hover:text-foreground transition-all duration-500 mb-12 group hover:scale-105"
          >
            <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            </div>
            <span className="font-medium">Back to Jobs</span>
          </Link>

          <div className="backdrop-blur-2xl bg-white/8 border border-white/10 shadow-2xl p-16 relative overflow-hidden group hover:bg-white/12 transition-all duration-700 hover:shadow-primary/10">
            {/* Dynamic background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            {/* Floating particles effect */}
            <div className="absolute top-4 right-4 w-2 h-2 bg-primary/30 rounded-full animate-ping"></div>
            <div className="absolute bottom-6 left-6 w-1 h-1 bg-accent/40 rounded-full animate-pulse"></div>
            <div className="absolute top-1/2 right-8 w-1.5 h-1.5 bg-primary/20 rounded-full animate-bounce"></div>

            {/* Job Header */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-10 mb-12 relative z-10">
              {/* Enhanced Company Logo */}
              <div className="flex-shrink-0 relative group">
                {job.companyLogo ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <img
                      src={job.companyLogo}
                      alt={`${job.company} logo`}
                      className="relative w-28 h-28 rounded-2xl object-cover shadow-2xl ring-2 ring-white/20 group-hover:ring-primary/30 transition-all duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-28 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-white/20 relative overflow-hidden group hover:ring-primary/30 transition-all duration-500 group-hover:scale-105">
                    <Building className="w-14 h-14 text-primary relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                )}
              </div>

              {/* Enhanced Job Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 mb-8">
                  <div className="space-y-4">
                    <h1 className="text-5xl font-black text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text leading-tight">
                      {job.title}
                    </h1>
                    <p className="text-2xl text-muted-foreground font-semibold tracking-wide">
                      {job.company}
                    </p>
                    {job.rating && (
                      <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl w-fit">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
                        <span className="text-sm font-bold text-foreground">{job.rating}</span>
                        <span className="text-sm text-muted-foreground font-medium">• Company Rating</span>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={handleSave}
                      className={`group relative w-20 h-20 backdrop-blur-xl bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-500 shadow-2xl hover:shadow-primary/20 hover:scale-110 overflow-hidden ${
                        isSaved
                          ? 'bg-red-500/20 text-red-400 ring-2 ring-red-400/50'
                          : 'hover:ring-2 hover:ring-primary/50'
                      }`}
                      aria-label={isSaved ? 'Remove from saved jobs' : 'Save this job'}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Heart className={`w-8 h-8 relative z-10 transition-all duration-300 ${isSaved ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
                    </button>

                    <button
                      onClick={handleShare}
                      className="group relative w-20 h-20 backdrop-blur-xl bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-500 shadow-2xl hover:shadow-accent/20 hover:scale-110 hover:ring-2 hover:ring-accent/50 overflow-hidden"
                      aria-label="Share this job"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Share2 className="w-8 h-8 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    </button>
                  </div>
                </div>

                {/* Enhanced Job Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm mb-10">
                  <div className="flex items-center gap-3 bg-white/8 backdrop-blur-sm px-5 py-3 rounded-xl hover:bg-white/12 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                    <MapPin className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-semibold text-foreground">{job.location}</span>
                  </div>

                  <div className="flex items-center gap-3 bg-white/8 backdrop-blur-sm px-5 py-3 rounded-xl hover:bg-white/12 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                    <Clock className="w-5 h-5 text-accent group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-semibold text-foreground">{formatJobType(job.type)}</span>
                  </div>

                  {job.salary && (
                    <div className="flex items-center gap-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm px-5 py-3 rounded-xl hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                      <DollarSign className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-bold text-foreground">{job.salary}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 bg-white/8 backdrop-blur-sm px-5 py-3 rounded-xl hover:bg-white/12 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                    <Users className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-semibold text-foreground">{job.postedAt}</span>
                  </div>

                  {job.remote && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 px-5 py-3 rounded-xl text-sm font-bold backdrop-blur-sm ring-2 ring-green-400/30 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:ring-green-400/50">
                      {t('remote')}
                    </div>
                  )}
                </div>

                {/* Enhanced Tags */}
                {job.tags && job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-8">
                    {job.tags.map((tag, index) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-primary/15 via-accent/8 to-primary/15 text-primary text-sm font-bold rounded-xl backdrop-blur-sm ring-1 ring-primary/20 hover:from-primary/25 hover:via-accent/15 hover:to-primary/25 hover:ring-primary/40 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Apply Button */}
            <div className="flex gap-6">
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="group relative flex-1 bg-gradient-to-r from-primary via-primary/95 to-accent hover:from-primary/90 hover:via-primary hover:to-accent/90 text-white font-black py-8 px-16 rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 text-xl backdrop-blur-sm hover:scale-[1.02] hover:ring-2 hover:ring-primary/50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {isApplying ? (
                  <>
                    <div className="animate-spin rounded-2xl h-7 w-7 border-3 border-white border-t-transparent"></div>
                    <span className="relative z-10">Applying...</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-8 h-8 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                    <span className="relative z-10">{t('apply')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 -right-20 w-80 h-80 bg-gradient-to-l from-accent/5 to-primary/5 rounded-full blur-3xl animate-float-delayed"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative z-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Job Description */}
            <div className="backdrop-blur-xl bg-white/5 border-0 shadow-2xl p-12 relative overflow-hidden group hover:bg-white/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h2 className="text-4xl font-bold text-foreground mb-10 relative z-10 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Job Description</h2>
              <div className="prose prose-xl max-w-none text-muted-foreground relative z-10">
                <p className="text-lg leading-relaxed whitespace-pre-line font-medium">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="backdrop-blur-xl bg-white/5 border-0 shadow-2xl p-12 relative overflow-hidden group hover:bg-white/10 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <h2 className="text-4xl font-bold text-foreground mb-10 relative z-10 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Requirements</h2>
                <ul className="space-y-4 relative z-10">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-4 group/item">
                      <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300" />
                      <span className="text-muted-foreground text-lg leading-relaxed group-hover/item:text-foreground transition-colors duration-300">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="backdrop-blur-xl bg-white/5 border-0 shadow-2xl p-12 relative overflow-hidden group hover:bg-white/10 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <h2 className="text-4xl font-bold text-foreground mb-10 relative z-10 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Benefits & Perks</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                  {job.benefits.map((benefit, _index) => (
                    <div key={_index} className="flex items-center gap-4 group/item hover:bg-white/5 p-4 rounded-none transition-all duration-300">
                      <div className="w-3 h-3 bg-gradient-to-r from-accent to-primary rounded-none group-hover/item:scale-125 transition-transform duration-300"></div>
                      <span className="text-muted-foreground text-lg group-hover/item:text-foreground transition-colors duration-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            {/* Company Info */}
            <div className="backdrop-blur-xl bg-white/5 border-0 shadow-2xl p-10 relative overflow-hidden group hover:bg-white/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-2xl font-bold text-foreground mb-8 relative z-10 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">About {job.company}</h3>
              <div className="space-y-5 text-base relative z-10">
                {job.companySize && (
                  <div className="flex items-center gap-3 group/item hover:bg-white/5 p-3 rounded-none transition-all duration-300">
                    <Users className="w-5 h-5 text-primary group-hover/item:scale-110 transition-transform duration-300" />
                    <span className="text-muted-foreground group-hover/item:text-foreground transition-colors duration-300 font-medium">{job.companySize} employees</span>
                  </div>
                )}
                {job.industry && (
                  <div className="flex items-center gap-3 group/item hover:bg-white/5 p-3 rounded-none transition-all duration-300">
                    <Building className="w-5 h-5 text-accent group-hover/item:scale-110 transition-transform duration-300" />
                    <span className="text-muted-foreground group-hover/item:text-foreground transition-colors duration-300 font-medium">{job.industry}</span>
                  </div>
                )}
                {job.rating && (
                  <div className="flex items-center gap-3 group/item hover:bg-white/5 p-3 rounded-none transition-all duration-300">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 group-hover/item:scale-110 transition-transform duration-300" />
                    <span className="text-muted-foreground group-hover/item:text-foreground transition-colors duration-300 font-medium">{job.rating} company rating</span>
                  </div>
                )}
              </div>
            </div>

            {/* Job Summary */}
            <div className="backdrop-blur-xl bg-white/5 border-0 shadow-2xl p-10 relative overflow-hidden group hover:bg-white/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-2xl font-bold text-foreground mb-8 relative z-10 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Job Summary</h3>
              <div className="space-y-5 text-base relative z-10">
                <div className="flex justify-between items-center group/item hover:bg-white/5 p-3 rounded-none transition-all duration-300">
                  <span className="text-muted-foreground group-hover/item:text-foreground transition-colors duration-300">Job Type:</span>
                  <span className="font-semibold text-foreground group-hover/item:text-primary transition-colors duration-300">{formatJobType(job.type)}</span>
                </div>
                {job.experienceLevel && (
                  <div className="flex justify-between items-center group/item hover:bg-white/5 p-3 rounded-none transition-all duration-300">
                    <span className="text-muted-foreground group-hover/item:text-foreground transition-colors duration-300">Experience:</span>
                    <span className="font-semibold text-foreground group-hover/item:text-accent transition-colors duration-300">{job.experienceLevel.replace(/\b\w/g, l => l.toUpperCase())} Level</span>
                  </div>
                )}
                {job.salaryRange && (
                  <div className="flex justify-between items-center group/item hover:bg-white/5 p-3 rounded-none transition-all duration-300">
                    <span className="text-muted-foreground group-hover/item:text-foreground transition-colors duration-300">Salary Range:</span>
                    <span className="font-semibold text-green-400 group-hover/item:text-green-300 transition-colors duration-300">{job.salaryRange}</span>
                  </div>
                )}
                <div className="flex justify-between items-center group/item hover:bg-white/5 p-3 rounded-none transition-all duration-300">
                  <span className="text-muted-foreground group-hover/item:text-foreground transition-colors duration-300">Remote:</span>
                  <span className="font-semibold text-foreground group-hover/item:text-blue-400 transition-colors duration-300">{job.remote ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between items-center group/item hover:bg-white/5 p-3 rounded-none transition-all duration-300">
                  <span className="text-muted-foreground group-hover/item:text-foreground transition-colors duration-300">Posted:</span>
                  <span className="font-semibold text-foreground group-hover/item:text-purple-400 transition-colors duration-300">{job.postedAt}</span>
                </div>
              </div>
            </div>

            {/* Quick Apply */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-primary/10 to-accent/10 border-0 shadow-2xl p-10 relative overflow-hidden group hover:from-primary/20 hover:to-accent/20 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-2xl font-bold text-foreground mb-8 relative z-10 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Ready to Apply?</h3>
              <p className="text-muted-foreground text-base mb-6 relative z-10 leading-relaxed">
                Take the next step in your career. Apply now and join {job.company}.
              </p>
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="w-full bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/95 hover:to-accent/90 text-white font-bold py-6 px-12 rounded-none transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 text-lg backdrop-blur-sm hover:scale-[1.02] hover:ring-2 hover:ring-primary/50 relative z-10"
              >
                {isApplying ? (
                  <>
                    <div className="animate-spin rounded-none h-6 w-6 border-2 border-white border-t-transparent"></div>
                    Applying...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-6 h-6" />
                    Apply Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer locale={locale} />
    </div>
  );
}