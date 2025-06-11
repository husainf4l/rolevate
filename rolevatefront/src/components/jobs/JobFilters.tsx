"use client";

import React from "react";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { JobFilters as JobFiltersType } from "@/services/jobs.service";
import { EXPERIENCE_LEVELS, WORK_TYPES } from "@/constants/jobs.constants";

interface JobFiltersProps {
  filters: JobFiltersType;
  onFilterChange: (key: keyof JobFiltersType, value: any) => void;
  onSearch: (searchTerm: string) => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onFilterChange,
  onSearch,
}) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FunnelIcon className="h-5 w-5 text-[#00C6AD]" />
        <h2 className="text-lg font-semibold text-white">Filter Jobs</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={filters.search || ""}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD]"
          />
        </div>

        {/* Experience Level */}
        <select
          value={filters.experienceLevel || ""}
          onChange={(e) =>
            onFilterChange("experienceLevel", e.target.value || undefined)
          }
          className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD]"
        >
          <option value="">All Experience Levels</option>
          {Object.entries(EXPERIENCE_LEVELS).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>

        {/* Work Type */}
        <select
          value={filters.workType || ""}
          onChange={(e) =>
            onFilterChange("workType", e.target.value || undefined)
          }
          className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD]"
        >
          <option value="">All Work Types</option>
          {Object.entries(WORK_TYPES).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>

        {/* Location */}
        <input
          type="text"
          placeholder="Location..."
          value={filters.location || ""}
          onChange={(e) =>
            onFilterChange("location", e.target.value || undefined)
          }
          className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD]"
        />
      </div>

      {/* Additional Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Active Jobs Only */}
        <label className="flex items-center gap-2 text-white">
          <input
            type="checkbox"
            checked={filters.isActive || false}
            onChange={(e) =>
              onFilterChange("isActive", e.target.checked || undefined)
            }
            className="rounded bg-gray-900 border-gray-600 text-[#00C6AD] focus:ring-[#00C6AD]"
          />
          Active Jobs Only
        </label>

        {/* Featured Jobs Only */}
        <label className="flex items-center gap-2 text-white">
          <input
            type="checkbox"
            checked={filters.isFeatured || false}
            onChange={(e) =>
              onFilterChange("isFeatured", e.target.checked || undefined)
            }
            className="rounded bg-gray-900 border-gray-600 text-[#00C6AD] focus:ring-[#00C6AD]"
          />
          Featured Jobs Only
        </label>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <label className="text-white text-sm">Sort by:</label>
          <select
            value={`${filters.sortBy || "createdAt"}-${
              filters.sortOrder || "desc"
            }`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split("-");
              onFilterChange("sortBy", sortBy);
              onFilterChange("sortOrder", sortOrder);
            }}
            className="px-3 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD]"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="viewCount-desc">Most Viewed</option>
            <option value="applicationCount-desc">Most Applied</option>
          </select>
        </div>
      </div>
    </div>
  );
};
