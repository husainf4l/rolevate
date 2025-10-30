"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { jobsService, Job } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { savedJobsService } from "@/services/savedJobs";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params?.slug as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const jobDetail = await jobsService.getJobBySlug(slug);
        setJob(jobDetail);

        // Check if job is already saved
        if (user && jobDetail?.id) {
          const saved = await savedJobsService.isJobSaved(String(jobDetail.id));
          setIsSaved(saved);
        }
      } catch (err) {
        console.error("Failed to fetch job details:", err);
        setError("Job not found. Please check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchJobDetail();
    }
  }, [slug, user]);

  // Handle Save/Unsave Job
  const handleSaveJob = async () => {
    if (!user) {
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/login?next=${encodeURIComponent(currentUrl)}`);
      return;
    }

    setIsSaving(true);
    try {
      const jobId = job?.id ? String(job.id) : "";
      if (jobId) {
        if (isSaved) {
          // Unsave the job
          await savedJobsService.unsaveJob(jobId);
          setIsSaved(false);
        } else {
          // Save the job
          await savedJobsService.saveJob(jobId);
          setIsSaved(true);
        }
      }
    } catch (err) {
      console.error("Failed to save/unsave job:", err);
      // Could show a toast error here
    } finally {
      setIsSaving(false);
    }
  };

  // Format posted date
  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Posted today";
    if (diffDays === 2) return "Posted yesterday";
    if (diffDays <= 7) return `Posted ${diffDays - 1} days ago`;
    if (diffDays <= 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
    return `Posted ${Math.floor(diffDays / 30)} months ago`;
  };

  // Format deadline date
  const formatDeadlineDate = (deadlineString: string) => {
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Application deadline has passed";
    } else if (diffDays === 0) {
      return "Application deadline is today";
    } else if (diffDays === 1) {
      return "Application deadline is tomorrow";
    } else if (diffDays <= 7) {
      return `Application deadline in ${diffDays} days`;
    } else if (diffDays <= 30) {
      return `Application deadline in ${Math.floor(diffDays / 7)} weeks`;
    } else {
      return `Application deadline: ${deadline.toLocaleDateString()}`;
    }
  };

  // Parse job description into sections
  const parseJobDescription = (description: string) => {
    const sections: { title: string; content: string }[] = [];
    
    // Split by common section headers
    const lines = description.split('\n');
    let currentSection = { title: 'Job Description', content: '' };
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check for section headers
      if (trimmedLine.toLowerCase().includes('key responsibilities') || 
          trimmedLine.toLowerCase().includes('responsibilities')) {
        if (currentSection.content.trim()) sections.push(currentSection);
        currentSection = { title: 'Key Responsibilities', content: '' };
      } else if (trimmedLine.toLowerCase().includes('requirements') || 
                 trimmedLine.toLowerCase().includes('qualifications')) {
        if (currentSection.content.trim()) sections.push(currentSection);
        currentSection = { title: 'Requirements', content: '' };
      } else if (trimmedLine.toLowerCase().includes('required skills')) {
        if (currentSection.content.trim()) sections.push(currentSection);
        currentSection = { title: 'Required Skills', content: '' };
      } else if (trimmedLine.toLowerCase().includes('benefits') || 
                 trimmedLine.toLowerCase().includes('what we offer')) {
        if (currentSection.content.trim()) sections.push(currentSection);
        currentSection = { title: 'Benefits', content: '' };
      } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        // Bullet points
        currentSection.content += line + '\n';
      } else if (trimmedLine && !trimmedLine.startsWith('•') && !trimmedLine.startsWith('-')) {
        // Regular paragraphs
        currentSection.content += line + '\n';
      }
    }
    
    if (currentSection.content.trim()) sections.push(currentSection);
    
    return sections.length > 0 ? sections : [{ title: 'Job Description', content: description }];
  };

    const formatJobType = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "Full-time";
      case "PART_TIME":
        return "Part-time";
      case "CONTRACT":
        return "Contract";
      case "FREELANCE":
        return "Freelance";
      default:
        return type;
    }
  };

  const formatJobLevel = (level: string) => {
    switch (level) {
      case "ENTRY":
        return "Entry Level";
      case "MID":
        return "Mid Level";
      case "SENIOR":
        return "Senior Level";
      case "EXECUTIVE":
        return "Executive Level";
      default:
        return level;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Breadcrumb Skeleton */}
          <div className="mb-8 flex items-center space-x-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-1 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-1 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>

          {/* Header Skeleton */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="flex-1">
                <Skeleton className="h-12 w-3/4 mb-4" />
                <div className="flex items-center gap-3 mb-6">
                  <Skeleton className="w-12 h-12 rounded-sm" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
                <div className="space-y-3 mb-8">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
              <div className="lg:w-80 flex-shrink-0">
                <Card className="p-6">
                  <CardContent className="p-0 space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <div className="pt-6 border-t border-gray-200 space-y-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-4 h-4 rounded" />
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-4 h-4 rounded" />
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-4 h-4 rounded" />
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-12">
              {/* Job Description Sections Skeleton */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-6">
                  <Skeleton className="h-8 w-64" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-12">
              {/* Job Details Skeleton */}
              <div className="space-y-6">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-5 h-5 rounded" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Skeleton */}
              <div className="space-y-6">
                <Skeleton className="h-6 w-36" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-16 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Company Info Skeleton */}
              <div className="space-y-6">
                <Skeleton className="h-6 w-40" />
                <div className="space-y-5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-5 h-5 rounded" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-gray-200 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white p-8">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Job Not Found
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {error || "The job you're looking for doesn't exist or has been removed."}
            </p>
            <Link href="/jobs">
              <Button className="bg-primary-600 hover:bg-primary-700">
                Back to Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/jobs" className="hover:text-gray-700">Jobs</Link>
          <span className="mx-2 text-gray-300">/</span>
          <Link href={`/jobs?department=${job.department}`} className="hover:text-gray-700">
            {job.department || 'General'}
          </Link>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-gray-900">{job.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-12 pb-12 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left Section: Company & Title */}
            <div className="flex-1">
              {/* Company Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
                  {job.companyLogo ? (
                    <img 
                      src={job.companyLogo} 
                      alt={job.companyData?.name || job.company}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-bold text-xl">
                      {job.companyData?.name.charAt(0).toUpperCase() || job.company.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Company</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {job.companyData?.name || job.company}
                  </div>
                </div>
              </div>

              {/* Job Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-8 tracking-tight leading-tight">
                {job.title}
              </h1>

              {/* Job Key Details - Grid layout */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Location</div>
                  <div className="text-gray-900 font-medium">{job.location || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Salary</div>
                  <div className="text-gray-900 font-medium">{job.salary || "Competitive"}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Job Type</div>
                  <div className="text-gray-900 font-medium">{formatJobType(job.type)}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Experience</div>
                  <div className="text-gray-900 font-medium">{formatJobLevel(job.level)}</div>
                </div>
              </div>

              {/* Quick Info Row */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Posted {formatPostedDate(job.createdAt)}</span>
                </div>
                {job.deadline && (
                  <div className="flex items-center gap-2">
                    <span className={`text-gray-400 ${new Date(job.deadline) < new Date() ? 'text-red-400' : ''}`}>•</span>
                    <span className={new Date(job.deadline) < new Date() ? 'text-red-600 font-medium' : ''}>
                      {formatDeadlineDate(job.deadline)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section: Action Buttons */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="space-y-2 flex flex-col">
                <Link href={`/jobs/${slug}/apply`}>
                  <Button
                    size="lg"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    Apply Now
                  </Button>
                </Link>

                <Button
                  onClick={handleSaveJob}
                  disabled={isSaving}
                  variant={isSaved ? "default" : "outline"}
                  size="lg"
                  className={`w-full transition-all ${
                    isSaved 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {isSaving ? "Processing..." : isSaved ? "✓ Saved" : "Save Job"}
                </Button>
              </div>

              {/* Additional Info Card */}
              <div className="mt-6 p-4 bg-gray-50 rounded-sm border border-gray-200">
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">About Company</div>
                    <p className="text-gray-600 leading-relaxed">
                      {job.companyData?.description || "Leading company in the industry"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Job Description Overview */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Overview</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {job.description}
              </p>
            </div>

            {/* Dynamic Job Description Sections */}
            {parseJobDescription(job.description).map((section, index) => (
              <div key={index}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">{section.title}</h2>
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              </div>
            ))}

            {/* Required Skills from job data */}
            {job.skills && job.skills.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Required Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {job.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      className="text-sm bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Position Details</h3>
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Employment Type</div>
                  <div className="text-gray-900 font-medium">{formatJobType(job.type)}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Seniority Level</div>
                  <div className="text-gray-900 font-medium">{formatJobLevel(job.level)}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Salary Range</div>
                  <div className="text-gray-900 font-medium">{job.salary || "Competitive"}</div>
                </div>
              </div>
            </div>

            {/* Company Overview */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">About the Company</h3>
              <div className="space-y-4">
                <p className="text-gray-600 text-sm leading-relaxed">
                  {job.companyData?.description || "A leading organization in the industry with a commitment to excellence and innovation."}
                </p>
              </div>
            </div>

            {/* Application Info */}
            <div className="bg-blue-50 p-6 rounded-sm border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Job Posted</div>
                  <p className="text-gray-900 font-medium">{formatPostedDate(job.createdAt)}</p>
                </div>
                {job.deadline && (
                  <div>
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Application Deadline</div>
                    <p className={`font-medium ${new Date(job.deadline) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDeadlineDate(job.deadline)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}