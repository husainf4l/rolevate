'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/common';
import Footer from '@/components/Footer';
import { Job } from '@/types/jobs';
import { JobsService } from '@/services/jobsService';
import { Button } from '@/components/common';

export default function JobDetailsPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const [locale, setLocale] = useState('en');
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const initializePage = async () => {
      try {
        const { locale: loc, id } = await params;
        setLocale(loc);

        const jobData = JobsService.getJobById(id);
        if (!jobData) {
          notFound();
          return;
        }

        setJob(jobData);
        setLoading(false);
      } catch {
        setError('Failed to load job details');
        setLoading(false);
      }
    };

    initializePage();
  }, [params]);

  const handleApply = async () => {
    if (!job) return;

    setIsApplying(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, this would call an API
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Failed to apply for job:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleSave = async () => {
    if (!job) return;

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Failed to save job:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatJobType = (type: string) => {
    return type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatExperienceLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer locale={locale} />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-medium text-foreground mb-4">
              {error || 'Job not found'}
            </h1>
            <Button onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </main>
        <Footer locale={locale} />
      </div>
    );
  }

  const isRTL = locale === 'ar';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className={`mb-6 sm:mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className={`flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <button
                onClick={() => router.push(`/${locale}`)}
                className="hover:text-foreground transition-colors"
              >
                Home
              </button>
              <span>/</span>
              <button
                onClick={() => router.push(`/${locale}/jobs`)}
                className="hover:text-foreground transition-colors"
              >
                Jobs
              </button>
              <span>/</span>
              <span className="text-foreground">{job.title}</span>
            </div>
          </nav>
          {/* Header Section */}
          <div className="mb-8 sm:mb-12">
            <div className={`flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <div className="flex-1">
                <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground mb-3 sm:mb-4 leading-tight ${isRTL ? 'text-right' : 'text-left'}`}>
                  {job.title}
                </h1>
                <p className={`text-lg sm:text-xl text-muted-foreground mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {job.company}
                </p>
                {job.companySize && (
                  <p className={`text-base text-muted-foreground mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {job.companySize} employees
                  </p>
                )}
                {job.industry && (
                  <p className={`text-base text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                    {job.industry} industry
                  </p>
                )}
              </div>
              <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  variant="secondary"
                  className="px-6 sm:px-8 py-3 w-full sm:w-auto"
                >
                  {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save Job'}
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="px-6 sm:px-8 py-3 w-full sm:w-auto"
                >
                  {isApplying ? 'Applying...' : 'Apply Now'}
                </Button>
              </div>
            </div>

            {/* Key Details */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Location</p>
                <p className="text-lg text-foreground">{job.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Employment Type</p>
                <p className="text-lg text-foreground">{formatJobType(job.type)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Experience Level</p>
                <p className="text-lg text-foreground">{job.experienceLevel ? formatExperienceLevel(job.experienceLevel) : 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Salary Range</p>
                <p className="text-lg text-foreground">{job.salary || 'Competitive'}</p>
              </div>
            </div>

            {/* Job Metadata */}
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground mb-6 sm:mb-8 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <div className={`flex flex-wrap items-center gap-2 sm:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>Job ID: {job.id}</span>
                <span>•</span>
                <span>Posted: {job.postedAt}</span>
                {job.applicationDeadline && (
                  <>
                    <span>•</span>
                    <span>Deadline: {job.applicationDeadline}</span>
                  </>
                )}
              </div>
              <button
                onClick={() => alert('Report job functionality would be implemented here')}
                className="text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Report this job
              </button>
            </div>
          </div>

          {/* Job Description */}
          <section className="mb-12">
            <h2 className={`text-2xl font-medium text-foreground mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              Job Description
            </h2>
            <div className={`prose prose-lg max-w-none ${isRTL ? 'prose-rtl' : ''}`}>
              <p className={`text-foreground leading-relaxed mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                {job.description}
              </p>
            </div>
          </section>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <section className="mb-12">
              <h2 className={`text-2xl font-medium text-foreground mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                Key Responsibilities
              </h2>
              <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {job.responsibilities.map((responsibility, index) => (
                  <p key={index} className="text-foreground leading-relaxed">
                    {responsibility}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Qualifications */}
          {job.qualifications && job.qualifications.length > 0 && (
            <section className="mb-12">
              <h2 className={`text-2xl font-medium text-foreground mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                Qualifications
              </h2>
              <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {job.qualifications.map((qualification, index) => (
                  <p key={index} className="text-foreground leading-relaxed">
                    {qualification}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <section className="mb-12">
              <h2 className={`text-2xl font-medium text-foreground mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                Benefits
              </h2>
              <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {job.benefits.map((benefit, index) => (
                  <p key={index} className="text-foreground leading-relaxed">
                    {benefit}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Skills and Tags */}
          {job.tags && job.tags.length > 0 && (
            <section className="mb-12">
              <h2 className={`text-2xl font-medium text-foreground mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                Required Skills
              </h2>
              <div className={`flex flex-wrap gap-3 ${isRTL ? 'justify-end' : ''}`}>
                {job.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Application Instructions */}
          <section className="mb-12">
            <h2 className={`text-2xl font-medium text-foreground mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              Application Process
            </h2>
            <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="space-y-3">
                <p className="text-foreground leading-relaxed">
                  <strong>Step 1:</strong> Review the job requirements and ensure you meet the qualifications listed above.
                </p>
                <p className="text-foreground leading-relaxed">
                  <strong>Step 2:</strong> Prepare your application materials including your resume, cover letter, and any relevant portfolio work.
                </p>
                <p className="text-foreground leading-relaxed">
                  <strong>Step 3:</strong> Click the "Apply Now" button below to submit your application through our secure portal.
                </p>
                <p className="text-foreground leading-relaxed">
                  <strong>Step 4:</strong> Our recruitment team will review your application within 5-7 business days.
                </p>
              </div>
              <div className="mt-6 p-4 bg-secondary rounded-lg">
                <p className="text-foreground font-medium mb-2">
                  What We Look For:
                </p>
                <ul className="text-foreground space-y-1">
                  <li>• Strong technical skills and relevant experience</li>
                  <li>• Passion for technology and innovation</li>
                  <li>• Excellent communication and teamwork abilities</li>
                  <li>• Commitment to continuous learning and growth</li>
                  <li>• Cultural fit with our company values</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Work Environment */}
          <section className="mb-12">
            <h2 className={`text-2xl font-medium text-foreground mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              Work Environment & Culture
            </h2>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-3">What We Offer</h3>
                <ul className="space-y-2 text-foreground">
                  <li>• Collaborative and innovative work environment</li>
                  <li>• Opportunities for professional development and growth</li>
                  <li>• Work-life balance with flexible scheduling options</li>
                  <li>• Access to cutting-edge tools and technologies</li>
                  <li>• Competitive compensation and benefits package</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-3">Our Values</h3>
                <ul className="space-y-2 text-foreground">
                  <li>• Innovation and continuous improvement</li>
                  <li>• Teamwork and mutual respect</li>
                  <li>• Integrity and ethical business practices</li>
                  <li>• Customer-centric approach</li>
                  <li>• Commitment to excellence</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-secondary rounded-lg">
              <p className="text-foreground leading-relaxed">
                At {job.company}, we believe that our people are our greatest asset. We foster a culture of learning, innovation, and collaboration where every team member has the opportunity to make a meaningful impact. Join us in building solutions that matter and growing both personally and professionally in a supportive and dynamic environment.
              </p>
            </div>
          </section>

          {/* Related Jobs */}
          <section className="mt-16 pt-12 border-t border-border">
            <h2 className={`text-2xl font-medium text-foreground mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
              Similar Opportunities
            </h2>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              {JobsService.getJobs()
                .filter(j => j.id !== job.id && j.category === job.category)
                .slice(0, 4)
                .map((relatedJob) => (
                  <div
                    key={relatedJob.id}
                    className="p-6 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                    onClick={() => router.push(`/${locale}/jobs/${relatedJob.id}`)}
                  >
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {relatedJob.title}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      {relatedJob.company}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {relatedJob.location} • {formatJobType(relatedJob.type)}
                    </p>
                    <p className="text-sm text-foreground line-clamp-2">
                      {relatedJob.description}
                    </p>
                  </div>
                ))}
            </div>
            {JobsService.getJobs().filter(j => j.id !== job.id && j.category === job.category).length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No similar opportunities available at this time.
              </p>
            )}
          </section>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}