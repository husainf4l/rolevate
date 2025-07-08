"use client";

import React from "react";
import Link from "next/link";
import JobCard, { JobData } from "@/components/common/JobCard";
import { Button } from "@/components/common/Button";

const jobsData: JobData[] = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
  },
  {
    id: 4,
    title: "Data Scientist",
    company: "NEOM Tech",
    location: "NEOM, Saudi Arabia",
    type: "Full-time",
    salary: "30,000 - 45,000 SAR",
    skills: ["Python", "Machine Learning", "Smart Cities", "IoT", "AI"],
    posted: "1 day ago",
    applicants: 35,
    logo: "🌟",
    description: "Shape the future of smart cities with cutting-edge AI and data science at NEOM.",
    urgent: true
  },
  {
    id: 5,
    title: "Digital Marketing Manager",
    company: "Careem",
    location: "Dubai, UAE / Remote",
    type: "Full-time",
    salary: "15,000 - 22,000 AED",
    skills: ["Digital Marketing", "Arabic Content", "Social Media", "Growth Hacking"],
    posted: "4 days ago",
    applicants: 29,
    logo: "🚗",
    description: "Lead regional marketing campaigns for the Middle East's super app serving millions."
  },
  {
    id: 6,
    title: "Cloud Solutions Architect",
    company: "Ooredoo Qatar",
    location: "Doha, Qatar",
    type: "Full-time",
    salary: "20,000 - 28,000 QAR",
    skills: ["AWS", "Azure", "5G Infrastructure", "Enterprise Solutions"],
    posted: "2 days ago",
    applicants: 27,
    logo: "☁️",
    description: "Architect next-generation cloud and 5G solutions for Qatar's digital transformation."
  }
];

export default function AvailableJobs() {
  const handleApply = (jobId: number) => {
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
          {jobsData.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApply={handleApply}
              showDescription={true}
              compact={false}
            />
          ))}
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