import React from "react";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BookmarkIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedDate: string;
  description: string;
  requirements: string[];
  benefits: string[];
  isRemote: boolean;
  experienceLevel: string;
  matchScore?: number;
}

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior React Developer",
    company: "TechFlow Solutions",
    location: "San Francisco, CA",
    salary: "$120k - $150k",
    type: "Full-time",
    postedDate: "2025-01-07",
    description:
      "We're looking for a senior React developer to join our growing team and help build next-generation web applications.",
    requirements: [
      "5+ years React experience",
      "TypeScript proficiency",
      "Modern JavaScript",
    ],
    benefits: ["Health insurance", "401k matching", "Flexible hours"],
    isRemote: false,
    experienceLevel: "Senior",
    matchScore: 95,
  },
  {
    id: "2",
    title: "Frontend Engineer",
    company: "Innovation Labs",
    location: "Remote",
    salary: "$100k - $130k",
    type: "Full-time",
    postedDate: "2025-01-06",
    description:
      "Join our remote team to create amazing user experiences using cutting-edge technologies.",
    requirements: [
      "3+ years frontend experience",
      "React or Vue.js",
      "CSS frameworks",
    ],
    benefits: [
      "Remote work",
      "Equipment allowance",
      "Professional development",
    ],
    isRemote: true,
    experienceLevel: "Mid-level",
    matchScore: 88,
  },
  {
    id: "3",
    title: "UI/UX Developer",
    company: "CreativeDesign Co.",
    location: "New York, NY",
    salary: "$90k - $120k",
    type: "Contract",
    postedDate: "2025-01-05",
    description:
      "Design and develop beautiful, intuitive interfaces for our client projects.",
    requirements: [
      "UI/UX design skills",
      "Frontend development",
      "Design tools proficiency",
    ],
    benefits: ["Flexible schedule", "Creative freedom", "Portfolio building"],
    isRemote: false,
    experienceLevel: "Mid-level",
    matchScore: 82,
  },
  {
    id: "4",
    title: "Full Stack Developer",
    company: "StartupXYZ",
    location: "Austin, TX",
    salary: "$110k - $140k",
    type: "Full-time",
    postedDate: "2025-01-04",
    description:
      "Build end-to-end solutions in a fast-paced startup environment.",
    requirements: ["Full-stack experience", "Node.js", "Database knowledge"],
    benefits: ["Equity options", "Startup environment", "Growth opportunities"],
    isRemote: false,
    experienceLevel: "Mid-level",
  },
  {
    id: "5",
    title: "Junior Frontend Developer",
    company: "WebCorp",
    location: "Boston, MA",
    salary: "$70k - $85k",
    type: "Full-time",
    postedDate: "2025-01-03",
    description:
      "Perfect opportunity for a junior developer to grow their skills in a supportive environment.",
    requirements: [
      "1+ year experience",
      "HTML/CSS/JavaScript",
      "Learning mindset",
    ],
    benefits: ["Mentorship program", "Training budget", "Career development"],
    isRemote: false,
    experienceLevel: "Junior",
  },
];

const getMatchScoreColor = (score: number) => {
  if (score >= 90) return "bg-green-100 text-green-800";
  if (score >= 80) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

export default function JobsPage() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
          <p className="text-gray-600">
            Discover opportunities that match your skills and career goals.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for jobs, companies, or keywords..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0fc4b5] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0fc4b5] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <button className="w-full px-4 py-2 bg-[#0fc4b5] text-white rounded-lg hover:bg-[#0ba399] transition-colors">
                Search Jobs
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-4">
            <button className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <FunnelIcon className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <button className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              <span>Sort</span>
            </button>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remote"
                className="rounded text-[#0fc4b5]"
              />
              <label htmlFor="remote" className="text-sm text-gray-700">
                Remote only
              </label>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            Showing {mockJobs.length} jobs matching your criteria
          </div>
          <div className="flex items-center space-x-4">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <option>Most Recent</option>
              <option>Best Match</option>
              <option>Salary: High to Low</option>
              <option>Salary: Low to High</option>
            </select>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {mockJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    {job.matchScore && (
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getMatchScoreColor(
                          job.matchScore
                        )}`}
                      >
                        {job.matchScore}% match
                      </span>
                    )}
                    {job.isRemote && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Remote
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-[#0fc4b5] font-medium mb-2">
                    {job.company}
                  </p>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {job.description}
                  </p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BriefcaseIcon className="w-4 h-4" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{job.experienceLevel}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <button className="p-2 text-gray-400 hover:text-[#0fc4b5] hover:bg-[#0fc4b5] hover:bg-opacity-10 rounded-lg transition-colors">
                    <BookmarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {job.requirements.slice(0, 3).map((req, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                    >
                      {req}
                    </span>
                  ))}
                  {job.requirements.length > 3 && (
                    <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md">
                      +{job.requirements.length - 3} more
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {new Date(job.postedDate).toLocaleDateString()}
                  </span>
                  <button className="px-4 py-2 bg-[#0fc4b5] text-white rounded-lg hover:bg-[#0ba399] transition-colors">
                    Apply Now
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Load More Jobs
          </button>
        </div>
      </div>
    </div>
  );
}
