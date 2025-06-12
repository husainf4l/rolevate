"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  createJob,
  CreateJobData,
  handleApiError,
} from "@/services/jobs.service";

interface JobFormData {
  title: string;
  department: string;
  location: string;
  workType: "ONSITE" | "REMOTE" | "HYBRID";
  experienceLevel:
    | "ENTRY_LEVEL"
    | "JUNIOR"
    | "MID_LEVEL"
    | "SENIOR"
    | "LEAD"
    | "PRINCIPAL"
    | "EXECUTIVE";
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  skills: string[];
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  enableAiInterview: boolean;
  interviewDuration?: number;
}

const NewJobPost = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    department: "",
    location: "",
    workType: "ONSITE",
    experienceLevel: "MID_LEVEL",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    skills: [],
    currency: "AED", // Default to AED for UAE market
    enableAiInterview: true, // Default to enabled
    interviewDuration: 30,
  });

  const [skillInput, setSkillInput] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number(value) : undefined,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError(
        "Job title is required. Please provide a clear and descriptive job title."
      );
      return false;
    }
    if (formData.title.length < 3) {
      setError("Job title must be at least 3 characters long.");
      return false;
    }
    if (!formData.department.trim()) {
      setError(
        "Department is required. Please specify which department this role belongs to."
      );
      return false;
    }
    if (!formData.location.trim()) {
      setError(
        "Location is required. Please specify the job location (e.g., Dubai, UAE)."
      );
      return false;
    }
    if (!formData.description.trim()) {
      setError(
        "Job description is required. Please provide a detailed description of the role."
      );
      return false;
    }
    if (formData.description.length < 50) {
      setError(
        "Job description should be at least 50 characters long for better candidate understanding."
      );
      return false;
    }
    if (!formData.requirements.trim()) {
      setError(
        "Job requirements are required. Please list the key qualifications and skills needed."
      );
      return false;
    }
    if (formData.skills.length === 0) {
      setError(
        "At least one skill is required. Please add relevant skills for this position."
      );
      return false;
    }
    if (
      formData.salaryMin &&
      formData.salaryMax &&
      formData.salaryMin >= formData.salaryMax
    ) {
      setError("Maximum salary must be greater than minimum salary.");
      return false;
    }
    if (
      formData.enableAiInterview &&
      (!formData.interviewDuration || formData.interviewDuration < 10)
    ) {
      setError(
        "Interview duration must be at least 10 minutes when AI interview is enabled."
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare job data for API
      const jobData: CreateJobData = {
        title: formData.title,
        department: formData.department,
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities || undefined,
        benefits: formData.benefits || undefined,
        skills: formData.skills,
        experienceLevel: formData.experienceLevel,
        location: formData.location,
        workType: formData.workType,
        salaryMin: formData.salaryMin,
        salaryMax: formData.salaryMax,
        currency: formData.currency,
        enableAiInterview: formData.enableAiInterview,
        interviewDuration: formData.interviewDuration,
        isActive: true, // Default to active
        isFeatured: false, // Default to not featured
      };

      // Call the real API
      const response = await createJob(jobData);

      console.log("Job created successfully:", response);
      setSuccess(true);

      // Redirect to job posts after a delay
      setTimeout(() => {
        router.push("/dashboard/jobpost");
      }, 2000);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    const requiredFields = [
      formData.title.trim(),
      formData.department.trim(),
      formData.location.trim(),
      formData.description.trim(),
      formData.requirements.trim(),
      formData.skills.length > 0,
    ];
    const completedFields = requiredFields.filter(Boolean).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  const handleCancel = () => {
    router.push("/dashboard/jobpost");
  };

  if (success) {
    return (
      <div className="flex-1 min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-lg w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="h-10 w-10 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Job Post Created Successfully! 🎉
            </h2>
            <p className="text-gray-400 mb-6">
              Your job post "
              <span className="text-[#00C6AD] font-medium">
                {formData.title}
              </span>
              " has been created and is now live on the platform.
              {formData.enableAiInterview &&
                " AI interviews are ready to screen candidates automatically."}
            </p>

            <div className="bg-gray-750 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-white font-medium mb-2">
                What happens next?
              </h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>✅ Job is immediately visible to candidates</li>
                <li>
                  📧 You'll receive email notifications for new applications
                </li>
                {formData.enableAiInterview && (
                  <li>🤖 AI will conduct initial interviews automatically</li>
                )}
                <li>📊 Track performance in your dashboard</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/dashboard/jobpost")}
                className="px-6 py-3 bg-[#00C6AD] text-white rounded-lg hover:bg-[#14B8A6] transition-colors font-medium"
              >
                View All Job Posts
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Create Another Job
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center mt-6">
            Redirecting to dashboard in a few seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-900">
      <div className="px-6 md:px-20 py-6 md:py-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BriefcaseIcon className="h-8 w-8 text-[#00C6AD]" />
              Create New Job Post
            </h1>
            <p className="text-gray-400 mt-1">
              Fill in the details below to create a new job posting
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-600/30 rounded-lg p-4 flex items-start gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-300 font-medium">Error</h3>
              <p className="text-red-200 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Job Information
            </h2>

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
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                  placeholder="e.g. Senior Full Stack Developer, Banking Operations Manager, Data Analyst"
                  required
                />
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
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                  placeholder="e.g. Engineering, Finance, Marketing, Operations, HR"
                  required
                />
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
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                  placeholder="e.g. Dubai, UAE / Abu Dhabi, UAE / Riyadh, Saudi Arabia"
                  required
                />
              </div>

              {/* Work Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Work Type *
                </label>
                <select
                  name="workType"
                  value={formData.workType}
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                >
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
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                  placeholder="e.g. 15000 (monthly)"
                  min="0"
                  step="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Maximum Salary
                </label>
                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                  placeholder="e.g. 25000 (monthly)"
                  min="0"
                  step="500"
                />
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Job Details
            </h2>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                placeholder="Provide a comprehensive overview of the role. Include: what the candidate will do day-to-day, the team they'll work with, growth opportunities, company culture, and what makes this position unique and exciting. Be specific about the impact they'll have on the organization."
                required
              />
            </div>

            {/* Requirements */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Requirements *
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                placeholder="List essential qualifications, experience, and skills. Include: years of experience, specific technologies, education requirements, certifications, language skills, and any industry-specific knowledge. Be clear about what's required vs. preferred."
                required
              />
            </div>

            {/* Responsibilities */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Responsibilities
              </label>
              <textarea
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                placeholder="Detail the key responsibilities and day-to-day activities. Include: main duties, project involvement, stakeholder interactions, deliverables, and success metrics. Help candidates understand what they'll be accountable for."
              />
            </div>

            {/* Benefits */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Benefits
              </label>
              <textarea
                name="benefits"
                value={formData.benefits}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                placeholder="Highlight the compensation package and perks. Include: health insurance, flexible working, training budget, performance bonuses, vacation days, career development opportunities, and any unique company benefits."
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Required Skills *
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Add relevant skills, technologies, or qualifications. Examples:
                React.js, Project Management, Arabic/English, Banking Experience
              </p>
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                    placeholder="Type a skill and press Enter or click Add..."
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    disabled={!skillInput.trim()}
                    className="px-4 py-3 bg-[#00C6AD] text-white rounded-lg hover:bg-[#14B8A6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Add
                  </button>
                </div>
              </div>

              {/* Popular Skills Suggestions */}
              {formData.skills.length === 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">
                    Popular skills to get you started:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "JavaScript",
                      "React.js",
                      "Node.js",
                      "Python",
                      "Project Management",
                      "Arabic",
                      "English",
                      "Banking",
                      "Finance",
                      "Leadership",
                    ].map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          if (!formData.skills.includes(skill)) {
                            setFormData((prev) => ({
                              ...prev,
                              skills: [...prev.skills, skill],
                            }));
                          }
                        }}
                        className="px-3 py-1 text-xs bg-gray-600 text-gray-300 rounded-full hover:bg-[#00C6AD] hover:text-white transition-colors"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Display */}
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-[#00C6AD]/10 border border-[#00C6AD]/30 text-[#00C6AD] rounded-lg text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-[#00C6AD] hover:text-red-400 transition-colors"
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {formData.skills.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  {formData.skills.length} skill
                  {formData.skills.length !== 1 ? "s" : ""} added
                </p>
              )}
            </div>
          </div>

          {/* AI Interview Settings */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              AI Interview Settings
            </h2>

            <div className="flex items-start gap-3 mb-4">
              <input
                type="checkbox"
                name="enableAiInterview"
                checked={formData.enableAiInterview}
                onChange={handleInputChange}
                className="w-5 h-5 text-[#00C6AD] bg-gray-700 border-gray-600 rounded focus:ring-[#00C6AD] focus:ring-2 mt-0.5"
              />
              <div>
                <label className="text-gray-300 font-medium">
                  Enable AI-powered interview for this position
                </label>
                <p className="text-sm text-gray-400 mt-1">
                  AI interviews help screen candidates efficiently with
                  bilingual support (Arabic/English) and consistent evaluation
                  criteria. Qualified candidates will be invited to an automated
                  interview session.
                </p>
              </div>
            </div>

            {formData.enableAiInterview && (
              <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Interview Duration (minutes)
                    </label>
                    <select
                      name="interviewDuration"
                      value={formData.interviewDuration || 30}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                    >
                      <option value={15}>15 minutes (Quick screening)</option>
                      <option value={30}>30 minutes (Standard)</option>
                      <option value={45}>45 minutes (Comprehensive)</option>
                      <option value={60}>
                        60 minutes (Detailed assessment)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Interview Language
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                      defaultValue="both"
                    >
                      <option value="both">Arabic & English</option>
                      <option value="english">English Only</option>
                      <option value="arabic">Arabic Only</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-400">
                    💡 AI interviews are automatically scheduled after
                    candidates pass initial screening. Questions are tailored to
                    the job requirements and skills you've specified.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Helpful Tips */}
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-sm">💡</span>
              </div>
              <div>
                <h3 className="text-blue-300 font-semibold mb-2">
                  Tips for Creating Effective Job Posts
                </h3>
                <ul className="text-sm text-blue-200/80 space-y-1">
                  <li>
                    • Use clear, specific job titles that candidates would
                    search for
                  </li>
                  <li>
                    • Include salary ranges to attract the right candidates
                  </li>
                  <li>
                    • Be specific about required vs. preferred qualifications
                  </li>
                  <li>• Mention growth opportunities and company culture</li>
                  <li>
                    • Use AI interviews to efficiently screen large candidate
                    pools
                  </li>
                  <li>
                    • Include both Arabic and English if targeting bilingual
                    candidates
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#00C6AD] text-white rounded-lg hover:bg-[#14B8A6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5" />
                  Create Job Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewJobPost;
