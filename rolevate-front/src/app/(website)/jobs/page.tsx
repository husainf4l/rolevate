"use client";

import React, { useState } from "react";
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
  },
  {
    id: 7,
    title: "Cybersecurity Specialist",
    company: "Dubai Police",
    location: "Dubai, UAE",
    type: "Full-time",
    salary: "18,000 - 28,000 AED",
    skills: ["Cybersecurity", "Threat Analysis", "Incident Response", "Arabic"],
    posted: "5 days ago",
    applicants: 15,
    logo: "🛡️",
    description: "Protect Dubai's digital infrastructure with cutting-edge cybersecurity solutions."
  },
  {
    id: 8,
    title: "AI Research Engineer",
    company: "KAUST",
    location: "Thuwal, Saudi Arabia",
    type: "Full-time",
    salary: "28,000 - 38,000 SAR",
    skills: ["Machine Learning", "Deep Learning", "Research", "Python", "TensorFlow"],
    posted: "3 days ago",
    applicants: 31,
    logo: "🧠",
    description: "Advance AI research at one of the world's leading science and technology universities."
  }
];

const jobTypes = ["All", "Full-time", "Part-time", "Contract", "Remote"];
const locations = ["All", "Saudi Arabia", "Qatar", "Jordan", "UAE"];

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  const handleApply = (jobId: number) => {
    console.log(`Applying for job ID: ${jobId}`);
  };

  const filteredJobs = jobsData.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === "All" || job.type === selectedType;
    const matchesLocation = selectedLocation === "All" || job.location.includes(selectedLocation);
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return new Date(b.posted).getTime() - new Date(a.posted).getTime();
      case "salary":
        return parseInt(b.salary.replace(/[^\d]/g, '')) - parseInt(a.salary.replace(/[^\d]/g, ''));
      case "applicants":
        return b.applicants - a.applicants;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Find Your Next{" "}
              <span 
                className="bg-gradient-to-r from-[#13ead9] to-[#0891b2] bg-clip-text text-transparent"
                style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Opportunity
              </span>
            </h1>
            <p className="font-text text-xl text-gray-600 max-w-2xl mx-auto">
              Discover premium career opportunities from leading companies across the Middle East
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Search Input */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search jobs, companies, or skills..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Job Type Filter */}
                <div>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    {jobTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select 
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="latest">Latest</option>
                    <option value="salary">Salary</option>
                    <option value="applicants">Most Popular</option>
                  </select>
                </div>
                <div className="text-sm text-gray-600">
                  {sortedJobs.length} jobs found
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApply={handleApply}
              showDescription={true}
              compact={false}
            />
          ))}
        </div>

        {/* No Results */}
        {sortedJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
            <Button 
              variant="primary" 
              onClick={() => {
                setSearchTerm("");
                setSelectedType("All");
                setSelectedLocation("All");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}