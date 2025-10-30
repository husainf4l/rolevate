"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BuildingOfficeIcon,
  MapPinIcon,
  UsersIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { companyService } from "@/services/company.service";

interface Company {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  numberOfEmployees?: number;
  location?: string;
  website?: string;
  logo?: string;
  jobCount?: number;
}

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("All Industries");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const data = await companyService.getAllCompanies();
        setCompanies(data);
      } catch (err: any) {
        console.error("Error fetching companies:", err);
        setError(err?.message || "Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Get unique industries for filter
  const industries = ["All Industries", ...Array.from(new Set(companies.map(c => c.industry).filter(Boolean) as string[]))];

  // Filter companies
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = filterIndustry === "All Industries" || company.industry === filterIndustry;
    return matchesSearch && matchesIndustry;
  });

  const handleCompanyClick = (companyId: string) => {
    router.push(`/companies/${companyId}`);
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

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border border-red-200 rounded-sm p-4">
            <div className="text-red-600 font-medium mb-2">
              Error loading companies
            </div>
            <div className="text-red-500 text-sm">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors text-sm"
            >
              Try Again
            </button>
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
          <div className="text-center mb-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-gray-900 mb-4 sm:mb-6 ">
              Explore{" "}
              <span className="text-primary-600">
                Companies
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto px-4">
              Discover amazing companies and their job opportunities
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="max-w-4xl mx-auto mb-2">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
              <div className="flex-1 relative w-full">
                <MagnifyingGlassIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Company name or industry..."
                  className="w-full pl-10 sm:pl-12 pr-4 py-2 border border-gray-200 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base shadow-sm transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-center sm:justify-start">
                {industries.map((industry) => (
                  <button
                    key={industry}
                    onClick={() => setFilterIndustry(industry)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-sm transition-all duration-200 ${
                      filterIndustry === industry
                        ? "bg-primary-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {industry === "All Industries" ? "All" : industry}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-semibold text-gray-900">
            {filteredCompanies.length} {filteredCompanies.length === 1 ? "Company" : "Companies"} Found
          </div>
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No companies found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterIndustry !== "All Industries"
                ? "Try adjusting your search or filter criteria"
                : "No companies available at the moment"}
            </p>
            {(searchTerm || filterIndustry !== "All Industries") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterIndustry("All Industries");
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                onClick={() => handleCompanyClick(company.id)}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 bg-white border border-gray-200 hover:border-primary-300 rounded-sm p-6 cursor-pointer"
              >
                {/* Company Logo/Initial */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-sm flex items-center justify-center flex-shrink-0">
                    {company.logo ? (
                      <img 
                        src={company.logo} 
                        alt={`${company.name} logo`}
                        className="w-full h-full object-cover rounded-sm"
                      />
                    ) : (
                      <span className="text-primary-600 font-bold text-xl">
                        {company.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 leading-tight text-lg group-hover:text-primary-600 transition-colors mb-1">
                      {company.name}
                    </h3>
                    {company.industry && (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        {company.industry}
                      </span>
                    )}
                  </div>
                </div>

                {/* Company Description */}
                {company.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {company.description}
                  </p>
                )}

                {/* Company Stats */}
                <div className="space-y-2 mb-4">
                  {company.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{company.location}</span>
                    </div>
                  )}
                  {company.numberOfEmployees && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <UsersIcon className="w-4 h-4" />
                      <span>{company.numberOfEmployees} employees</span>
                    </div>
                  )}
                </div>

                {/* Job Count */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-gray-700">
                    {company.jobCount || 0} open positions
                  </span>
                  <span className="text-primary-600 text-sm font-medium group-hover:text-primary-700">
                    View Company →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}