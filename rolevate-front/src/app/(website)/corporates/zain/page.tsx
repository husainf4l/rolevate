"use client";

import React, { useState } from "react";
import JobCard, { JobData } from "@/components/common/JobCard";
import { Button } from "@/components/common/Button";

// Zain-specific jobs data
const zainJobs: JobData[] = [
  {
    id: 1,
    title: "UX Designer",
    company: "Zain Jordan",
    location: "Amman, Jordan",
    type: "Full-time",
    salary: "1,200 - 1,800 JOD",
    skills: ["Figma", "User Research", "Arabic UX", "Mobile Design"],
    posted: "3 days ago",
    applicants: 18,
    logo: "📱",
    description: "Design innovative digital experiences for Jordan's leading telecommunications company.",
    urgent: false
  },
  {
    id: 2,
    title: "Senior Frontend Developer",
    company: "Zain Jordan",
    location: "Amman, Jordan",
    type: "Full-time",
    salary: "1,500 - 2,200 JOD",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Arabic Localization"],
    posted: "1 day ago",
    applicants: 32,
    logo: "📱",
    description: "Lead the development of cutting-edge web applications for Zain's digital transformation.",
    urgent: true
  },
  {
    id: 3,
    title: "Mobile App Developer",
    company: "Zain Jordan",
    location: "Amman, Jordan",
    type: "Full-time",
    salary: "1,400 - 2,000 JOD",
    skills: ["React Native", "iOS", "Android", "Firebase", "Mobile UX"],
    posted: "5 days ago",
    applicants: 25,
    logo: "📱",
    description: "Build next-generation mobile applications for millions of Zain customers across Jordan.",
    urgent: false
  },
  {
    id: 4,
    title: "DevOps Engineer",
    company: "Zain Jordan",
    location: "Amman, Jordan",
    type: "Full-time",
    salary: "1,600 - 2,400 JOD",
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
    posted: "2 days ago",
    applicants: 15,
    logo: "📱",
    description: "Scale and optimize infrastructure for Zain's digital services and telecommunications platform.",
    urgent: true
  },
  {
    id: 5,
    title: "Data Analyst",
    company: "Zain Jordan",
    location: "Amman, Jordan",
    type: "Full-time",
    salary: "1,100 - 1,600 JOD",
    skills: ["Python", "SQL", "Power BI", "Data Visualization", "Telecommunications Analytics"],
    posted: "1 week ago",
    applicants: 28,
    logo: "📱",
    description: "Analyze customer data and network performance to drive strategic business decisions.",
    urgent: false
  },
  {
    id: 6,
    title: "Product Manager",
    company: "Zain Jordan",
    location: "Amman, Jordan",
    type: "Full-time",
    salary: "1,800 - 2,600 JOD",
    skills: ["Product Strategy", "Agile", "Market Research", "Arabic Market", "Telecom"],
    posted: "4 days ago",
    applicants: 22,
    logo: "📱",
    description: "Drive product innovation and strategy for Zain's telecommunications and digital services.",
    urgent: false
  }
];

const companyData = {
  name: "Zain Jordan",
  logo: "📱",
  industry: "Telecommunications",
  founded: "1994",
  employees: "2,000+",
  headquarters: "Amman, Jordan",
  website: "https://www.jo.zain.com",
  description: "Zain Jordan is a leading telecommunications company in Jordan, providing innovative mobile, internet, and digital services to millions of customers. As part of the Zain Group, we're committed to enriching lives and empowering communities through cutting-edge technology and exceptional customer service.",
  mission: "To be the leading digital lifestyle provider in Jordan, enriching the lives of our customers through innovative telecommunications and digital services.",
  values: [
    "Customer First",
    "Innovation & Excellence", 
    "Integrity & Trust",
    "Community Impact",
    "Sustainability"
  ],
  benefits: [
    "Comprehensive Health Insurance",
    "Annual Performance Bonuses",
    "Professional Development Programs",
    "Flexible Working Hours",
    "Employee Discount on Services",
    "Paid Training & Certifications",
    "Career Growth Opportunities",
    "Modern Office Environment"
  ],
  stats: [
    { label: "Active Customers", value: "4.2M+" },
    { label: "Years in Jordan", value: "30+" },
    { label: "Network Coverage", value: "99%" },
    { label: "Employee Satisfaction", value: "4.5/5" }
  ]
};

export default function ZainCorporatePage() {
  const [sortBy, setSortBy] = useState("latest");
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  const handleApply = (jobId: number) => {
    console.log(`Applying for job ID: ${jobId} at Zain`);
  };

  const handleSaveJob = (jobId: number) => {
    setSavedJobs((prev) => prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]);
  };

  // Sort jobs
  const sortedJobs = [...zainJobs].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return b.applicants - a.applicants; // Fallback sorting
      case "salary":
        return parseInt(b.salary.replace(/[^\d]/g, '')) - parseInt(a.salary.replace(/[^\d]/g, ''));
      case "applicants":
        return b.applicants - a.applicants;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Company Hero Section */}
      <section className="w-full min-h-[60vh] bg-white flex items-center pt-8 pb-12 md:pt-12 md:pb-16">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Company Details */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-3xl">
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 bg-[#13ead9]/10 text-[#0891b2] text-sm font-semibold rounded-full border border-[#13ead9]/20">
                  <span className="w-2 h-2 bg-[#13ead9] rounded-full mr-2 animate-pulse"></span>
                  Leading Telecommunications
                </span>
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1]">
                Welcome to{" "}
                <span 
                  className="bg-gradient-to-r from-[#13ead9] to-[#0891b2] bg-clip-text text-transparent font-bold"
                  style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {companyData.name}
                </span>
              </h1>
              
              <p className="font-text text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
                {companyData.description}
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
                {companyData.stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-sm lg:text-base text-gray-600">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button 
                  variant="primary" 
                  size="xl"
                  href="#jobs"
                >
                  View All Jobs ({zainJobs.length})
                </Button>
                <Button 
                  variant="secondary" 
                  size="xl"
                  href={companyData.website}
                >
                  Visit Website
                </Button>
              </div>
            </div>

            {/* Company Logo & Visual */}
            <div className="flex-1 flex items-center justify-center lg:ml-12">
              <div className="relative w-80 h-64 lg:w-96 lg:h-80">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#13ead9]/8 via-white/15 to-[#0891b2]/8 rounded-[2.5rem] shadow-corporate backdrop-blur-sm border border-white/20"></div>
                <div className="absolute inset-4 rounded-[2rem] overflow-hidden shadow-inner bg-white flex items-center justify-center">
                  <div className="text-8xl lg:text-9xl">
                    {companyData.logo}
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#13ead9] rounded-full shadow-corporate animate-pulse"></div>
                <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-[#0891b2] rounded-full shadow-corporate animate-pulse delay-1000"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Information Sections */}
      <section className="w-full pt-8 pb-12 md:pt-12 md:pb-16 bg-gray-50">
        <div className="container mx-auto px-6 md:px-12">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1]">
              About{" "}
              <span 
                className="bg-gradient-to-r from-[#13ead9] to-[#0891b2] bg-clip-text text-transparent"
                style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Zain Jordan
              </span>
            </h2>
            <p className="font-text text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {companyData.mission}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
            {/* About Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-10 h-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Company Overview</h3>
                
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Our Values</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {companyData.values.map((value, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-full"></div>
                        <span className="text-gray-700 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 p-6 bg-gradient-to-r from-[#13ead9]/5 to-[#0891b2]/5 rounded-xl border border-[#13ead9]/10">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Industry</div>
                    <div className="font-semibold text-gray-900">{companyData.industry}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Founded</div>
                    <div className="font-semibold text-gray-900">{companyData.founded}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Employees</div>
                    <div className="font-semibold text-gray-900">{companyData.employees}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <div>
              <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-10 h-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Employee Benefits</h3>
                <div className="space-y-4">
                  {companyData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700 leading-relaxed">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section id="jobs" className="w-full pt-8 pb-24 md:pt-12 md:pb-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          {/* Jobs Header */}
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1]">
              Open{" "}
              <span 
                className="bg-gradient-to-r from-[#13ead9] to-[#0891b2] bg-clip-text text-transparent"
                style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Positions
              </span>
            </h2>
            <p className="font-text text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Join our team and help shape the future of telecommunications in Jordan. 
              {sortedJobs.length} opportunities are waiting for talented professionals like you.
            </p>
            
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm font-medium text-gray-600 hidden sm:block">Sort by:</span>
              <select 
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent text-sm text-gray-900 bg-white shadow-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Latest Posted</option>
                <option value="salary">Highest Salary</option>
                <option value="applicants">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 mb-16">
            {sortedJobs.map((job) => (
              <div
                key={job.id}
                className="animate-fade-in group relative flex flex-col h-full"
                tabIndex={0}
                aria-label={`Job: ${job.title} at ${job.company}`}
              >
                <div className="flex-1">
                  <JobCard
                    job={job}
                    onApply={handleApply}
                    onSave={handleSaveJob}
                    isSaved={savedJobs.includes(job.id)}
                    showDescription={true}
                    compact={false}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-[#13ead9]/5 to-[#0891b2]/5 rounded-3xl p-8 md:p-12 border border-[#13ead9]/10">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Don't see the perfect role?
              </h3>
              <p className="font-text text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                We're always looking for talented individuals to join our team. Send us your CV and we'll keep you in mind for future opportunities.
              </p>
              <Button 
                variant="primary" 
                size="xl"
              >
                Submit Your CV
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
