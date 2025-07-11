"use client";

import React from "react";
import JobCard, { JobData } from "@/components/common/JobCard";

// Example job data for testing
const sampleJobs: JobData[] = [
  {
    id: "job-1",
    title: "Frontend Developer",
    company: "TechCorp",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$80k - $120k",
    skills: ["React", "JavaScript", "CSS"],
    posted: "1 day ago",
    applicants: 10,
    logo: "TC",
    description: "Build amazing user interfaces with React.",
  },
  {
    id: "job-2",
    title: "Backend Engineer",
    company: "DataFlow Inc",
    location: "Remote",
    type: "Full-time",
    salary: "$90k - $140k",
    skills: ["Node.js", "PostgreSQL", "Docker"],
    posted: "3 days ago",
    applicants: 25,
    logo: "DF",
    description: "Design and build scalable backend systems.",
    urgent: true,
  },
];

export default function PublicJobsTest() {
  const handleApply = (jobId: string) => {
    console.log("Applied to job:", jobId);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Public Jobs Page Test</h1>
      <p className="text-gray-600 mb-8">
        This page tests JobCard components outside of AuthProvider context. The
        save functionality should work correctly based on authentication status.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sampleJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onApply={handleApply}
            showDescription={true}
          />
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Expected Behavior:</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>
            • <strong>Logged in as Candidate:</strong> Save buttons visible and
            functional
          </li>
          <li>
            • <strong>Logged in as Company:</strong> Save buttons hidden
          </li>
          <li>
            • <strong>Not logged in:</strong> Clicking save redirects to login
          </li>
          <li>
            • <strong>No AuthProvider:</strong> No errors, graceful degradation
          </li>
        </ul>
      </div>
    </div>
  );
}
