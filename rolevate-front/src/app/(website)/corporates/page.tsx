import React from "react";
import { Button } from "@/components/common/Button";

const featuredCompanies = [
  {
    id: 1,
    name: "Zain Jordan",
    logo: "📱",
    industry: "Telecommunications",
    employees: "2,000+",
    location: "Amman, Jordan",
    openJobs: 6,
    description:
      "Leading telecommunications company providing innovative mobile and digital services.",
    slug: "zain",
    featured: true,
    color: "purple",
  },
  {
    id: 2,
    name: "Aramco Digital",
    logo: "🏢",
    industry: "Technology & Energy",
    employees: "10,000+",
    location: "Riyadh, Saudi Arabia",
    openJobs: 12,
    description: "Saudi Arabia's leading tech transformation initiative.",
    slug: "aramco",
    featured: true,
    color: "blue",
  },
  {
    id: 3,
    name: "Qatar Airways",
    logo: "✈️",
    industry: "Aviation",
    employees: "50,000+",
    location: "Doha, Qatar",
    openJobs: 8,
    description:
      "World-class airline connecting the globe with cutting-edge technology.",
    slug: "qatar-airways",
    featured: true,
    color: "red",
  },
  {
    id: 4,
    name: "NEOM Tech",
    logo: "🌟",
    industry: "Smart Cities & AI",
    employees: "5,000+",
    location: "NEOM, Saudi Arabia",
    openJobs: 15,
    description:
      "Building the future of smart cities with cutting-edge technology.",
    slug: "neom",
    featured: true,
    color: "green",
  },
  {
    id: 5,
    name: "Careem",
    logo: "🚗",
    industry: "Technology & Transportation",
    employees: "8,000+",
    location: "Dubai, UAE",
    openJobs: 9,
    description: "Middle East's leading super app serving millions.",
    slug: "careem",
    featured: false,
    color: "orange",
  },
  {
    id: 6,
    name: "Dubai Police",
    logo: "🛡️",
    industry: "Government & Security",
    employees: "15,000+",
    location: "Dubai, UAE",
    openJobs: 4,
    description:
      "Protecting Dubai with cutting-edge technology and innovation.",
    slug: "dubai-police",
    featured: false,
    color: "indigo",
  },
];

export default function CorporatePage() {
  const featuredOnly = featuredCompanies.filter((company) => company.featured);
  const allCompanies = featuredCompanies;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      {/* Featured Companies Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Featured Companies
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore career opportunities with the region's leading employers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {featuredOnly.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-2xl border border-gray-100">
                  {company.logo}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Open Jobs</div>
                  <div className="text-xl font-bold text-gray-900">
                    {company.openJobs}
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {company.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {company.description}
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-4a2 2 0 012-2h2a2 2 0 012 2v4"
                    />
                  </svg>
                  {company.industry}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {company.location}
                </div>
              </div>

              <Button
                variant="primary"
                href={
                  company.slug === "zain" ? `/corporate/${company.slug}` : "#"
                }
                className="w-full"
              >
                View Jobs
              </Button>
            </div>
          ))}
        </div>

        {/* All Companies Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-10">
          <div className="text-center mb-8">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              All Partner Companies
            </h3>
            <p className="text-lg text-gray-600">
              Discover opportunities across {allCompanies.length} leading
              organizations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allCompanies.map((company) => (
              <div
                key={company.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-xl border border-gray-100 flex-shrink-0">
                  {company.logo}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {company.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {company.industry} • {company.employees} employees
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {company.openJobs} jobs
                  </div>
                  <div className="text-xs text-gray-500">
                    {company.location}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  href={
                    company.slug === "zain" ? `/corporate/${company.slug}` : "#"
                  }
                  className="flex-shrink-0"
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
