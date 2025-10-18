"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { jobsService, Job } from "@/services";
import JobCard from "@/components/common/JobCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function AvailableJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const featuredJobs = await jobsService.getFeaturedJobs(6);
        setJobs(featuredJobs);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs. Please check your connection.");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);



  return (
    <section className="w-full pt-8 pb-24 md:pt-12 md:pb-32 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 md:mb-8 tracking-tight leading-[1.1]">
            Featured{" "}
            <span className="text-primary-600">
              Opportunities
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
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
              <Card key={index} className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-center mb-3">
                    <Skeleton className="w-10 h-10 rounded-sm mr-3" />
                    <div className="flex-1">
                      <Skeleton className="h-4 mb-2 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-4 mb-2" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-3 w-1/4 mb-2" />
                  <Skeleton className="h-9 w-full mt-4" />
                </CardContent>
              </Card>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center py-12">
              <div className="text-red-500 text-lg font-medium mb-2">
                Failed to load jobs
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
                No jobs available
              </div>
              <p className="text-gray-600">
                Check back later for new opportunities.
              </p>
            </div>
          ) : (
            // Jobs list
            jobs.map((job) => (
              <div key={job.id} className="animate-in fade-in-50 duration-300">
                <JobCard
                  job={job}
                  showSaveButton={false}
                />
              </div>
            ))
          )}
        </div>

        {/* View All Jobs Button */}
        <div className="text-center">
          <Link href="/jobs" className="px-6 py-3 rounded-sm shadow-lg text-base font-semibold bg-primary-600 hover:bg-primary-700 text-white transition-all duration-300 hover:shadow-xl hover:scale-105 inline-block">
            View All Jobs
          </Link>
        </div>
      </div>
    </section>
  );
}