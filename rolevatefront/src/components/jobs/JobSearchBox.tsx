"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline";

interface JobSearchBoxProps {
  className?: string;
  placeholder?: string;
  showLocation?: boolean;
}

export const JobSearchBox: React.FC<JobSearchBoxProps> = ({
  className = "",
  placeholder = "Search for jobs...",
  showLocation = true,
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }
    if (location.trim()) {
      params.set("location", location.trim());
    }

    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD] outline-none"
          />
        </div>

        {/* Location Input */}
        {showLocation && (
          <div className="md:w-64 relative">
            <MapPinIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD] outline-none"
            />
          </div>
        )}

        {/* Search Button */}
        <button
          type="submit"
          className="px-8 py-3 bg-[#00C6AD] hover:bg-[#14B8A6] text-white font-semibold rounded-lg transition-colors"
        >
          Search Jobs
        </button>
      </form>

      {/* Quick Search Tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-gray-600 text-sm">Popular searches:</span>
        {["Banking", "Finance", "Remote", "Senior Developer", "Manager"].map(
          (tag) => (
            <button
              key={tag}
              onClick={() => {
                setSearchTerm(tag);
                const params = new URLSearchParams();
                params.set("search", tag);
                router.push(`/jobs?${params.toString()}`);
              }}
              className="text-sm text-[#00C6AD] hover:text-[#14B8A6] hover:underline transition-colors"
            >
              {tag}
            </button>
          )
        )}
      </div>
    </div>
  );
};
