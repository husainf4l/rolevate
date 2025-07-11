"use client";

import React, { useState, useEffect } from "react";
import JobCard, { JobData } from "@/components/common/JobCard";
import { Button } from "@/components/common/Button";
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
      type: jobPost.type === "FULL_TIME" ? "Full-time" : 
            jobPost.type === "PART_TIME" ? "Part-time" : 
            jobPost.type === "CONTRACT" ? "Contract" : "Remote",
      salary: jobPost.salary,
      skills: jobPost.skills || [],
      posted: new Date(jobPost.postedAt).toLocaleDateString(),
      applicants: jobPost.applicants,
      logo: getCompanyLogo(jobPost.company?.name), // Dynamic logo based on company
      description: jobPost.shortDescription || jobPost.description,
      urgent: false // You might want to add this field to JobPost interface
    };
  };

  // Helper function to get company logo/emoji based on company name
  const getCompanyLogo = (companyName?: string): string => {
    if (!companyName) return "🏢";
    
    const name = companyName.toLowerCase();
    
    // Map company names to appropriate emojis
    if (name.includes("tech") || name.includes("software")) return "💻";
    if (name.includes("health") || name.includes("medical") || name.includes("pharma")) return "🏥";
    if (name.includes("finance") || name.includes("bank")) return "🏦";
    if (name.includes("education") || name.includes("school") || name.includes("university")) return "🎓";
    if (name.includes("food") || name.includes("restaurant")) return "🍽️";
    if (name.includes("travel") || name.includes("airline") || name.includes("tourism")) return "✈️";
    if (name.includes("retail") || name.includes("shop") || name.includes("store")) return "🛍️";
    if (name.includes("energy") || name.includes("oil") || name.includes("gas")) return "⚡";
    if (name.includes("construction") || name.includes("building")) return "🏗️";
    if (name.includes("telecom") || name.includes("communication")) return "📱";
    if (name.includes("automotive") || name.includes("car")) return "🚗";
    if (name.includes("media") || name.includes("entertainment")) return "🎬";
    
    return "🏢"; // Default logo
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
        console.error('Error fetching featured jobs:', err);
        setError('Failed to load featured jobs');
        // Fallback to hardcoded data
        setJobs(fallbackJobsData);
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

  // Fallback data in case API fails
  const fallbackJobsData: JobData[] = [
    {
      id: "fallback-1",
      title: "Senior Software Engineer",
      company: "Aramco Digital",
      location: "Riyadh, Saudi Arabia",
      type: "Full-time",
      salary: "25,000 - 35,000 SAR",
      skills: ["React", "Node.js", "TypeScript", "AWS", "GraphQL"],
      posted: "2 days ago",
      applicants: 23,
      logo: "🏢",
      description: "Join Saudi Arabia's leading tech transformation initiative building next-generation digital solutions.",
      urgent: true
    },
    {
      id: "fallback-2",
      title: "Product Manager",
      company: "Qatar Airways Group",
      location: "Doha, Qatar",
      type: "Full-time",
      salary: "18,000 - 25,000 QAR",
      skills: ["Product Strategy", "Analytics", "Leadership", "Agile", "Aviation Tech"],
      posted: "1 day ago",
      applicants: 41,
      logo: "✈️",
      description: "Drive digital product innovation for Qatar's world-class airline and travel ecosystem."
    },
    {
      id: "fallback-3",
      title: "UX Designer",
      company: "Zain Jordan",
      location: "Amman, Jordan",
      type: "Full-time",
      salary: "1,200 - 1,800 JOD",
      skills: ["Figma", "User Research", "Arabic UX", "Mobile Design"],
      posted: "3 days ago",
      applicants: 18,
      logo: "📱",
      description: "Design innovative digital experiences for Jordan's leading telecommunications company."
    }
  ];

  return (
    <section className="w-full pt-8 pb-24 md:pt-12 md:pb-32 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 md:mb-8 tracking-tight leading-[1.1]">
            Featured{" "}
            <span 
              className="bg-gradient-to-r from-[#13ead9] to-[#0891b2] bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Opportunities
            </span>
          </h2>
          <p className="font-text text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Explore premium career opportunities from leading companies across Jordan, Qatar, and Saudi Arabia. 
            Apply instantly with our AI-powered interview process.
          </p>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-16">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
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
              <Button 
                variant="secondary" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : jobs.length === 0 ? (
            // Empty state
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 text-lg font-medium mb-2">
                No featured jobs available
              </div>
              <p className="text-gray-600">Check back later for new opportunities.</p>
            </div>
          ) : (
            // Jobs list
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApply}
                showDescription={true}
                compact={false}
              />
            ))
          )}
        </div>

        {/* View All Jobs Button */}
        <div className="text-center">
          <Button 
            variant="secondary" 
            size="xl" 
            href="/jobs"
            icon={
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            }
            iconPosition="right"
          >
            View All Jobs
          </Button>
        </div>
      </div>
    </section>
  );
}