"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  BuildingOfficeIcon,
  MapPinIcon,
  UsersIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
  BriefcaseIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface Company {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  numberOfEmployees?: number;
  location?: string;
  website?: string;
  logo?: string;
  foundedYear?: number;
  specialties?: string[];
}

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  salary?: string;
  postedAt: string;
  description: string;
  requirements: string[];
  slug?: string;
}

export default function CompanyPage() {
  const router = useRouter();
  const params = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const companyId = params?.id as string;

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) return;

      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock company data
        const mockCompany: Company = {
          id: companyId,
          name: "Tech Solutions Inc",
          description: "We are a leading technology company focused on innovative software solutions that transform businesses and improve lives. Our team of passionate engineers and designers work together to create cutting-edge products that make a real difference in the world.",
          industry: "Technology",
          numberOfEmployees: 150,
          location: "San Francisco, CA",
          website: "https://techsolutions.com",
          foundedYear: 2015,
          specialties: ["Web Development", "Mobile Apps", "Cloud Computing", "AI/ML", "DevOps"]
        };

        // Mock jobs data
        const mockJobs: Job[] = [
          {
            id: "1",
            title: "Senior Frontend Developer",
            location: "San Francisco, CA",
            type: "Full-time",
            salary: "$120,000 - $160,000",
            postedAt: "2024-01-15",
            description: "Join our frontend team to build amazing user experiences",
            requirements: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
            slug: "senior-frontend-developer"
          },
          {
            id: "2",
            title: "Backend Engineer",
            location: "Remote",
            type: "Full-time",
            salary: "$110,000 - $150,000",
            postedAt: "2024-01-12",
            description: "Help us scale our backend infrastructure",
            requirements: ["Node.js", "Python", "PostgreSQL", "AWS"],
            slug: "backend-engineer"
          },
          {
            id: "3",
            title: "Product Designer",
            location: "San Francisco, CA",
            type: "Full-time",
            salary: "$100,000 - $140,000",
            postedAt: "2024-01-10",
            description: "Design beautiful and intuitive user interfaces",
            requirements: ["Figma", "UI/UX Design", "Prototyping", "User Research"],
            slug: "product-designer"
          }
        ];
        
        setCompany(mockCompany);
        setJobs(mockJobs);
      } catch (err) {
        console.error("Error fetching company data:", err);
        setError("Failed to fetch company information");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  const handleJobClick = (job: Job) => {
    // Navigate to job details page using slug
    router.push(`/jobs/${job.slug || job.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border border-red-200 rounded-sm p-4">
            <div className="text-red-600 font-medium mb-2">
              Error loading company
            </div>
            <div className="text-red-500 text-sm">{error || "Company not found"}</div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-600 text-white rounded-sm hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Companies</span>
            </button>
          </div>

          {/* Company Header */}
          <div className="bg-white border border-gray-200 rounded-sm p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Company Logo */}
              <div className="w-24 h-24 bg-primary-100 rounded-sm flex items-center justify-center flex-shrink-0">
                {company.logo ? (
                  <img 
                    src={company.logo} 
                    alt={`${company.name} logo`}
                    className="w-full h-full object-cover rounded-sm"
                  />
                ) : (
                  <span className="text-primary-600 font-bold text-3xl">
                    {company.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {company.name}
                </h1>
                
                {company.industry && (
                  <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded mb-4">
                    {company.industry}
                  </span>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {company.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{company.location}</span>
                    </div>
                  )}
                  {company.numberOfEmployees && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UsersIcon className="w-4 h-4" />
                      <span>{company.numberOfEmployees} employees</span>
                    </div>
                  )}
                  {company.foundedYear && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Founded {company.foundedYear}</span>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GlobeAltIcon className="w-4 h-4" />
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>

                {company.description && (
                  <p className="text-gray-600 leading-relaxed">
                    {company.description}
                  </p>
                )}
              </div>
            </div>

            {/* Specialties */}
            {company.specialties && company.specialties.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {company.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <BriefcaseIcon className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Open Positions ({jobs.length})
            </h2>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-sm">
            <BriefcaseIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No open positions
            </h3>
            <p className="text-gray-600">
              Check back later for new opportunities at {company.name}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => handleJobClick(job)}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 bg-white border border-gray-200 hover:border-primary-300 rounded-sm p-6 cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Job Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 leading-tight text-lg group-hover:text-primary-600 transition-colors mb-2">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <BriefcaseIcon className="w-4 h-4" />
                        <span>{job.type}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <CurrencyDollarIcon className="w-4 h-4" />
                          <span>{job.salary}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{job.description}</p>
                    
                    {/* Requirements */}
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.slice(0, 4).map((req, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {req}
                        </span>
                      ))}
                      {job.requirements.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{job.requirements.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="flex-shrink-0">
                    <button className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-sm transition-colors">
                      View Job
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}