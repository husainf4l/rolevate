"use client";

import React from "react";
import JobCard, { JobData } from "@/components/common/JobCard";

// Example job data for testing
const sampleJob: JobData = {
  id: "sample-job-1",
  title: "Senior React Developer",
  company: "TechCorp",
  location: "San Francisco, CA",
  type: "Full-time",
  salary: "$120k - $150k",
  skills: ["React", "TypeScript", "Next.js"],
  posted: "2 days ago",
  applicants: 15,
  logo: "TC",
  description: "We are looking for a senior React developer to join our team.",
  urgent: false,
};

export default function TestJobCard() {
  const handleApply = (jobId: string) => {
    console.log("Applied to job:", jobId);
    // Handle application logic
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">
        Test Job Card with Auth Integration
      </h2>

      <JobCard job={sampleJob} onApply={handleApply} />

      <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
        <h3 className="font-semibold mb-2">Behavior:</h3>
        <ul className="space-y-1 text-gray-600">
          <li>
            • <strong>Candidates:</strong> Can see and use the save button
          </li>
          <li>
            • <strong>Companies:</strong> Save button is hidden
          </li>
          <li>
            • <strong>Unauthenticated:</strong> Clicking save redirects to login
          </li>
          <li>
            • <strong>State:</strong> Synced with auth/me response
          </li>
        </ul>
      </div>
    </div>
  );
}

