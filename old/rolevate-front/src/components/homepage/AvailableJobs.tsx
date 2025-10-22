"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import JobCard, { JobData } from "@/components/common/JobCard";
import { JobService, JobPost } from "@/services/job";

export default function AvailableJobs() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to convert JobPost to JobData format
  const convertJobPostToJobData = (jobPost: JobPost): JobData => {
    return {
      id: jobPost.id, // Keep as string UUID
      title: jobPost.title,
      company: jobPost.company?.name || "Company", // Use actual company name from API
      location: jobPost.location,
      type:
        jobPost.type === "FULL_TIME"
          ? "Full-time"
          : jobPost.type === "PART_TIME"
          ? "Part-time"
          : jobPost.type === "CONTRACT"
          ? "Contract"
          : "Remote",
      salary: jobPost.salary,
      skills: jobPost.skills || [],
      posted: new Date(jobPost.postedAt).toLocaleDateString(),
      applicants: jobPost.applicants,
      logo: getCompanyLogo(jobPost.company), // Pass the entire company object
      description: jobPost.shortDescription || jobPost.description,
      urgent: false, // You might want to add this field to JobPost interface
    };
  };

  // Helper function to get company logo based on company data
  const getCompanyLogo = (company?: { name: string; logo?: string } | null): string => {
    // If company has a logo, return the full URL (it's already a complete AWS S3 URL)
    if (company?.logo) {
      return company.logo;
    }

    // Return company initial as fallback (no emojis)
    if (company?.name) {
      return company.name.charAt(0).toUpperCase();
    }

    return "C"; // Default initial for Company
  };

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const featuredJobs = await JobService.getFeaturedJobs();
        const convertedJobs = featuredJobs.map(convertJobPostToJobData);
        setJobs(convertedJobs);
      } catch (err) {
        console.error("Error fetching featured jobs:", err);
        setError("Failed to load featured jobs from server");
        // Set empty state instead of fallback data
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, []);

  const handleApply = (jobId: string) => {
    // Handle job application logic here
    console.log(`Applying for job ID: ${jobId}`);
    // This could redirect to an application page or trigger a modal
  };

  return (
    <section className="w-full pt-8 pb-24 md:pt-12 md:pb-32 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 md:mb-8 tracking-tight leading-[1.1]">
            Featured{" "}
            <span className="text-primary-600">
              Opportunities
            </span>
          </h2>
          <p className="font-text text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Explore premium career opportunities from leading companies across
            Jordan, Qatar, and Saudi Arabia. Apply instantly with our AI-powered
            interview process.
          </p>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-16">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-lg mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-300 rounded w-4/6"></div>
                </div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center py-12">
              <div className="text-red-500 text-lg font-medium mb-2">
                Failed to load featured jobs
              </div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2 rounded-sm shadow-lg text-sm font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          ) : jobs.length === 0 ? (
            // Empty state
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 text-lg font-medium mb-2">
                No featured jobs available
              </div>
              <p className="text-gray-600">
                Check back later for new opportunities.
              </p>
            </div>
          ) : (
            // Jobs list
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApply}
              />
            ))
          )}
        </div>

        {/* View All Jobs Button */}
        <div className="text-center">
          <Link href="/jobs">
            <button className="px-6 py-3 rounded-sm shadow-lg text-base font-semibold bg-primary-600 hover:bg-primary-700 text-white transition-all duration-300 hover:shadow-xl hover:scale-105">
              View All Jobs
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

