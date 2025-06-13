import React from "react";
import { JobCreationProps } from "./types";

const JobInformation: React.FC<JobCreationProps> = ({
  formData,
  fieldErrors,
  onInputChange,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
      <h2 className="text-xl font-semibold text-white mb-6">Job Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Job Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onInputChange}
            className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
              fieldErrors.title ? "border-red-500" : "border-gray-600"
            }`}
            placeholder="e.g. Senior Full Stack Developer, Banking Operations Manager, Data Analyst"
            required
          />
          {fieldErrors.title && (
            <p className="text-red-400 text-sm mt-1">{fieldErrors.title}</p>
          )}
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Department *
          </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={onInputChange}
            className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
              fieldErrors.department ? "border-red-500" : "border-gray-600"
            }`}
            placeholder="e.g. Engineering, Finance, Marketing, Operations, HR"
            required
          />
          {fieldErrors.department && (
            <p className="text-red-400 text-sm mt-1">
              {fieldErrors.department}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Location *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={onInputChange}
            className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
              fieldErrors.location ? "border-red-500" : "border-gray-600"
            }`}
            placeholder="e.g. Dubai, UAE / Abu Dhabi, UAE / Riyadh, Saudi Arabia"
            required
          />
          {fieldErrors.location && (
            <p className="text-red-400 text-sm mt-1">{fieldErrors.location}</p>
          )}
        </div>

        {/* Work Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Work Type *
          </label>
          <select
            name="workType"
            value={formData.workType}
            onChange={onInputChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
          >
            <option value="ONSITE">On-site</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Experience Level *
          </label>
          <select
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={onInputChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
          >
            <option value="ENTRY_LEVEL">Entry Level</option>
            <option value="JUNIOR">Junior</option>
            <option value="MID_LEVEL">Mid Level</option>
            <option value="SENIOR">Senior</option>
            <option value="LEAD">Lead</option>
            <option value="PRINCIPAL">Principal</option>
            <option value="EXECUTIVE">Executive</option>
          </select>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Currency
          </label>
          <select
            name="currency"
            value={formData.currency}
            onChange={onInputChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
          >
            <option value="JOD">JOD (Jordanian Dinar)</option>
            <option value="AED">AED (UAE Dirham)</option>
            <option value="SAR">SAR (Saudi Riyal)</option>
            <option value="USD">USD (US Dollar)</option>
            <option value="EUR">EUR (Euro)</option>
            <option value="GBP">GBP (British Pound)</option>
            <option value="KWD">KWD (Kuwaiti Dinar)</option>
            <option value="QAR">QAR (Qatari Riyal)</option>
            <option value="BHD">BHD (Bahraini Dinar)</option>
          </select>
        </div>
      </div>

      {/* Salary Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Minimum Salary
          </label>
          <input
            type="number"
            name="salaryMin"
            value={formData.salaryMin || ""}
            onChange={onInputChange}
            className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
              fieldErrors.salaryMin ? "border-red-500" : "border-gray-600"
            }`}
            placeholder="e.g. 15000 (monthly)"
            min="0"
            step="500"
          />
          {fieldErrors.salaryMin && (
            <p className="text-red-400 text-sm mt-1">{fieldErrors.salaryMin}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Maximum Salary
          </label>
          <input
            type="number"
            name="salaryMax"
            value={formData.salaryMax || ""}
            onChange={onInputChange}
            className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
              fieldErrors.salaryMax ? "border-red-500" : "border-gray-600"
            }`}
            placeholder="e.g. 25000 (monthly)"
            min="0"
            step="500"
          />
          {fieldErrors.salaryMax && (
            <p className="text-red-400 text-sm mt-1">{fieldErrors.salaryMax}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobInformation;
