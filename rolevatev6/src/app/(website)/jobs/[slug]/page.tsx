"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { jobsService, Job } from "@/services";

export default function JobDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const jobDetail = await jobsService.getJobBySlug(slug);
        setJob(jobDetail);
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
  }, [slug]);

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
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                {job.title}
              </h1>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-sm flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-lg">
                    {job.companyData?.name.charAt(0).toUpperCase() || job.company.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {job.companyData?.name || job.company}
                  </div>
                  <div className="text-sm text-gray-500">
                    {job.companyData?.description || "Leading company in the industry"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span>{job.salary || "Competitive"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" />
                  </svg>
                  <span>{formatJobType(job.type)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatJobLevel(job.level)}</span>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">
                {job.description}
              </p>
            </div>

            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-gray-50 rounded-sm p-6 border border-gray-100">
                <div className="flex flex-col space-y-3">
                  <Link href={`/jobs/${slug}/apply`}>
                    <Button
                      size="lg"
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      Apply Now
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  >
                    Save Job
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-gray-500 text-xs">Posted</div>
                      <div className="text-gray-900 font-medium">
                        {formatPostedDate(job.createdAt)}
                      </div>
                    </div>
                  </div>

                  {job.deadline && (
                    <div className="flex items-center gap-3 text-sm">
                      <svg className="w-4 h-4 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <div className="text-gray-500 text-xs">Application Deadline</div>
                        <div className={`font-medium ${new Date(job.deadline) < new Date() ? 'text-red-600' : 'text-orange-600'}`}>
                          {formatDeadlineDate(job.deadline)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-gray-500 text-xs">Updated</div>
                      <div className="text-gray-900 font-medium">
                        {new Date(job.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
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
          </div>

          {/* Sidebar */}
          <div className="space-y-12">
            {/* Job Details */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Job Details</h3>
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-500">Job Type</div>
                    <div className="text-gray-900 font-medium">{formatJobType(job.type)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-500">Experience Level</div>
                    <div className="text-gray-900 font-medium">{formatJobLevel(job.level)}</div>
                  </div>
                </div>

                {job.deadline && (
                  <div className="flex items-center gap-3">
                    <svg className={`w-5 h-5 flex-shrink-0 ${new Date(job.deadline) < new Date() ? 'text-red-400' : 'text-orange-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-sm text-gray-500">Application Deadline</div>
                      <div className={`font-medium ${new Date(job.deadline) < new Date() ? 'text-red-600' : 'text-orange-600'}`}>
                        {formatDeadlineDate(job.deadline)}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-500">Industry</div>
                    <div className="text-gray-900 font-medium">Technology</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Required Skills */}
            {job.skills && job.skills.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-sm bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Company Info */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">About {job.companyData?.name || job.company}</h3>
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-500">Industry</div>
                    <div className="text-gray-900 font-medium">Technology</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-500">Company Size</div>
                    <div className="text-gray-900 font-medium">50-200 employees</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="text-gray-900 font-medium">{job.location}</div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {job.companyData?.description || 'Company description not available.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}