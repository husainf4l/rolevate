"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/common/Button";
import { JobData } from "@/components/common/JobCard";

import { JobService, JobPost } from "@/services/job";
import { applyToJob, uploadCV } from "@/services/application";
import { AnonymousApplicationService } from "@/services/anonymousApplication";
import { getCurrentUser } from "@/services/auth";

// Middle Eastern country codes
const MIDDLE_EAST_COUNTRY_CODES = [
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+962", country: "Jordan", flag: "🇯🇴" },
  { code: "+961", country: "Lebanon", flag: "🇱🇧" },
  { code: "+963", country: "Syria", flag: "🇸🇾" },
  { code: "+964", country: "Iraq", flag: "🇮🇶" },
  { code: "+972", country: "Palestine", flag: "🇵🇸" },
];

export default function JobApplyPage() {
  const router = useRouter();
  const params = useParams();
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+962", // Default to Jordan
    phone: "",
    cv: null as File | null,
    coverLetter: "",
    experience: "",
    portfolio: "",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [savedCVs, setSavedCVs] = useState<any[]>([]);
  const [selectedCVId, setSelectedCVId] = useState<string | null>(null);
  // Removed unused profileLoading
  // Auth context

  const { user } = useAuth();
  const isAuthenticated = !!user;
  const isCandidate = user?.userType === "CANDIDATE" && !!user.candidateProfile;

  // Debug authentication state
  useEffect(() => {
    console.log("Authentication state updated:");
    console.log("user:", user);
    console.log("isAuthenticated:", isAuthenticated);
    console.log("isCandidate:", isCandidate);
    console.log("Document cookies:", document.cookie);
  }, [user, isAuthenticated, isCandidate]);

  // Prefill user info and CVs if candidate
  useEffect(() => {
    if (!isAuthenticated || !isCandidate) return;
    // removed setProfileLoading
    try {
      // Parse existing phone number to extract country code and number
      const parsePhoneNumber = (phoneNumber: string) => {
        if (!phoneNumber) return { countryCode: "+966", phone: "" };

        // Find matching country code
        for (const country of MIDDLE_EAST_COUNTRY_CODES) {
          if (phoneNumber.startsWith(country.code)) {
            return {
              countryCode: country.code,
              phone: phoneNumber.slice(country.code.length),
            };
          }
        }

        // If no country code found, assume it's a local number
        return { countryCode: "+966", phone: phoneNumber };
      };

      const parsedPhone = parsePhoneNumber(user?.phone || "");

      setFormData((prev) => ({
        ...prev,
        name: user?.name || prev.name,
        email: user?.email || prev.email,
        countryCode: parsedPhone.countryCode,
        phone: parsedPhone.phone,
      }));
      // Get saved CVs from candidateProfile
      const cvs = user.candidateProfile?.cvs || [];
      setSavedCVs(cvs);
      if (cvs.length > 0) {
        setSelectedCVId(cvs[0].id);
        setFormData((prev) => ({ ...prev, cv: cvs[0] }));
      }
    } catch {
      // Ignore errors for now
    } finally {
      // removed setProfileLoading
    }
  }, [isAuthenticated, isCandidate, user]);

  const jobId = params?.jobId as string;

  // Helper function to convert JobPost to JobData format (same as job details page)
  const convertJobPostToJobData = (jobPost: JobPost): JobData => {
    // Get a dynamic logo based on company name or industry
    const getCompanyLogo = (companyName?: string, industry?: string) => {
      if (!companyName && !industry) return "🏢";

      const searchText = `${companyName || ""} ${industry || ""}`.toLowerCase();

      if (
        searchText.includes("healthcare") ||
        searchText.includes("health") ||
        searchText.includes("medical")
      )
        return "🏥";
      if (searchText.includes("tech") || searchText.includes("software"))
        return "💻";
      if (searchText.includes("bank") || searchText.includes("finance"))
        return "🏦";
      if (searchText.includes("education") || searchText.includes("school"))
        return "🎓";
      if (searchText.includes("retail") || searchText.includes("shop"))
        return "🛍️";
      if (searchText.includes("food") || searchText.includes("restaurant"))
        return "🍽️";
      if (searchText.includes("travel") || searchText.includes("airline"))
        return "✈️";
      if (
        searchText.includes("energy") ||
        searchText.includes("oil") ||
        searchText.includes("gas")
      )
        return "⚡";
      if (
        searchText.includes("construction") ||
        searchText.includes("building")
      )
        return "🏗️";
      if (
        searchText.includes("telecom") ||
        searchText.includes("communication")
      )
        return "📱";
      if (searchText.includes("automotive") || searchText.includes("car"))
        return "🚗";
      if (searchText.includes("media") || searchText.includes("entertainment"))
        return "🎬";
      if (searchText.includes("sales") || searchText.includes("trading"))
        return "💼";
      return "🏢";
    };

    // Calculate time since posting
    const getTimeAgo = (dateString: string) => {
      const now = new Date();
      const posted = new Date(dateString);
      const diffTime = Math.abs(now.getTime() - posted.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      return `${Math.ceil(diffDays / 30)} months ago`;
    };

    return {
      id: jobPost.id,
      title: jobPost.title,
      company: jobPost.company?.name || "Company",
      location: jobPost.location,
      type:
        jobPost.type === "FULL_TIME"
          ? "Full-time"
          : jobPost.type === "PART_TIME"
          ? "Part-time"
          : jobPost.type === "CONTRACT"
          ? "Contract"
          : "Remote",
      salary: jobPost.salary || "Competitive salary",
      skills: jobPost.skills || [],
      posted: getTimeAgo(jobPost.postedAt || new Date().toISOString()),
      applicants: jobPost.applicants || 0,
      logo: getCompanyLogo(jobPost.company?.name, jobPost.industry),
      description: jobPost.description || jobPost.shortDescription || "",
      urgent: false, // Can be enhanced later if needed
    };
  };

  // Fetch job data from API
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;

      try {
        setLoading(true);
        setError(null);
        const jobPostData = await JobService.getPublicJobById(jobId);
        const convertedJob = convertJobPostToJobData(jobPostData);
        setJob(convertedJob);
      } catch (err) {
        console.error("Error fetching job:", err);
        setError("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Validate file type - only allow PDF
      if (file.type !== 'application/pdf') {
        setSubmissionError('Please upload only PDF files for your CV.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setSubmissionError('Please upload a CV file smaller than 10MB.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Clear any previous errors
      setSubmissionError(null);
    }
    
    setFormData((prev) => ({ ...prev, cv: file }));
    setSelectedCVId(null);
  };

  // Handle saved CV selection
  const handleCVSelect = (cvId: string) => {
    setSelectedCVId(cvId);
    const cvObj = savedCVs.find((cv) => cv.id === cvId);
    setFormData((prev) => ({ ...prev, cv: cvObj || null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionError(null);

    console.log("Submit handler called");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user:", user);
    console.log("Document cookies:", document.cookie);

    try {
      if (isAuthenticated) {
        console.log("Processing authenticated user application...");

        // Double-check authentication status before making the API call
        try {
          const currentUser = await getCurrentUser();
          console.log("Current user from API:", currentUser);
          if (!currentUser) {
            setSubmissionError("Authentication expired. Please log in again.");
            setSubmitting(false);
            return;
          }
        } catch (authError) {
          console.error("Authentication check failed:", authError);
          setSubmissionError("Authentication expired. Please log in again.");
          setSubmitting(false);
          return;
        }

        // Authenticated user flow - upload CV separately then apply
        let resumeUrl = undefined;
        if (
          formData.cv &&
          typeof formData.cv === "object" &&
          "fileUrl" in formData.cv &&
          formData.cv.fileUrl
        ) {
          resumeUrl = formData.cv.fileUrl;
          console.log("Using saved CV URL:", resumeUrl);
        } else if (formData.cv && formData.cv instanceof File) {
          console.log("Uploading new CV file...");
          resumeUrl = await uploadCV(formData.cv);
          console.log("CV uploaded, URL:", resumeUrl);
        }

        // Prevent submission if no valid resumeUrl
        if (
          !resumeUrl ||
          typeof resumeUrl !== "string" ||
          !/^https?:\/\//.test(resumeUrl)
        ) {
          setSubmissionError(
            "Please select or upload a valid CV before submitting your application."
          );
          setSubmitting(false);
          return;
        }

        const applicationData = {
          jobId,
          coverLetter: formData.coverLetter,
          resumeUrl,
          expectedSalary: formData.experience || "",
          noticePeriod: "",
        };

        console.log("Submitting application with data:", applicationData);
        await applyToJob(applicationData);
      } else {
        console.log("Processing anonymous user application...");
        // Anonymous user flow - send CV directly as multipart form data
        if (!formData.cv || !(formData.cv instanceof File)) {
          setSubmissionError(
            "Please upload a CV before submitting your application."
          );
          setSubmitting(false);
          return;
        }

        // Split name into firstName and lastName
        const nameParts = formData.name.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        await AnonymousApplicationService.applyWithCV(
          jobId,
          formData.cv,
          firstName,
          lastName,
          formData.email,
          `${formData.countryCode}${formData.phone}`, // Combine country code with phone number
          formData.portfolio || undefined,
          formData.coverLetter || undefined
        );
      }
      setSuccess(true);
    } catch (err: unknown) {
      console.error("Application submission error:", err);

      // Handle specific error cases
      if (err instanceof Error) {
        // Try to parse JSON error response
        try {
          const errorData = JSON.parse(err.message);
          if (errorData.statusCode === 409) {
            setSubmissionError(
              "You have already applied for this job. Please check your applications in your dashboard."
            );
          } else {
            setSubmissionError(errorData.message || err.message);
          }
        } catch {
          // If it's not JSON, use the error message directly
          if (
            err.message.includes("already applied") ||
            err.message.includes("Conflict")
          ) {
            setSubmissionError(
              "You have already applied for this job. Please check your applications in your dashboard."
            );
          } else {
            setSubmissionError(err.message);
          }
        }
      } else if (typeof err === "object" && err !== null) {
        // Handle error objects with statusCode
        const errorObj = err as {
          statusCode?: number;
          message?: string;
          error?: string;
        };
        if (errorObj.statusCode === 409) {
          setSubmissionError(
            "You have already applied for this job. Please check your applications in your dashboard."
          );
        } else {
          setSubmissionError(
            errorObj.message || errorObj.error || "Failed to submit application"
          );
        }
      } else {
        setSubmissionError("Failed to submit application");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          <div className="text-lg text-gray-500">Loading job details...</div>
        </div>
      </div>
    );
  }

  if (!job || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-3xl flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {error ? "Failed to Load Job" : "Job Not Found"}
          </h1>
          <p className="text-gray-600 mb-8">
            {error
              ? "There was an error loading the job details. Please try again."
              : "The job you're looking for doesn't exist or has been removed."}
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
            <Button variant="primary" onClick={() => router.push("/jobs")}>
              Browse All Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Application Submitted!
          </h1>
          <p className="text-lg font-semibold text-gray-900 mb-2">
            {job.title}
          </p>
          <p className="text-gray-600 mb-8">
            {typeof job.company === "string" ? job.company : job.company}
          </p>
          <p className="text-gray-700 mb-8">
            Thank you for your application. You will be invited to join an
            interview room in the next 5 minutes. Please be ready!
          </p>
          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={() => router.push(`/jobs/${job.id}`)}
              className="w-full"
            >
              View Job Details
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push("/jobs")}
              className="w-full"
            >
              Browse More Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <div className="p-2 rounded-xl group-hover:bg-gray-100 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </div>
                <span className="font-medium">Back</span>
              </button>
              <div className="h-5 w-px bg-gray-300"></div>
              <h1 className="text-lg font-semibold text-gray-900">
                Job Application
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-full">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Secure Application</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8">
          {/* Job Summary Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg lg:shadow-xl border border-gray-200 overflow-hidden lg:sticky lg:top-24">
              {/* Job Header */}
              <div className="bg-gradient-to-r from-[#0891b2] to-[#13ead9] p-4 lg:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 bg-white/10 rounded-full transform translate-x-10 lg:translate-x-16 -translate-y-10 lg:-translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-16 lg:w-24 h-16 lg:h-24 bg-white/10 rounded-full transform -translate-x-8 lg:-translate-x-12 translate-y-8 lg:translate-y-12"></div>
                <div className="relative">
                  <div className="flex items-center space-x-3 lg:space-x-4 mb-4 lg:mb-6">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm rounded-xl lg:rounded-2xl flex items-center justify-center text-2xl lg:text-3xl shadow-lg">
                      {job.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg lg:text-2xl font-bold truncate">
                        {job.title}
                      </h2>
                      <p className="text-white/90 font-medium text-sm lg:text-base">
                        {typeof job.company === "string"
                          ? job.company
                          : job.company}
                      </p>
                    </div>
                    {job.urgent && (
                      <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-2 lg:px-3 py-1 lg:py-2 rounded-full text-xs font-bold animate-pulse shadow-lg">
                        URGENT
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="p-4 lg:p-8 space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 gap-3 lg:gap-4">
                  <div className="flex items-center space-x-3 p-3 lg:p-4 bg-gray-50 rounded-xl lg:rounded-2xl border border-gray-200">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-200 rounded-lg lg:rounded-xl flex items-center justify-center">
                      <svg
                        className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600"
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
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm lg:text-base">
                        {job.location}
                      </p>
                      <p className="text-xs lg:text-sm text-gray-600">
                        {job.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 lg:p-4 bg-gray-50 rounded-xl lg:rounded-2xl border border-gray-200">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-200 rounded-lg lg:rounded-xl flex items-center justify-center">
                      <svg
                        className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base lg:text-lg">
                        {job.salary}
                      </p>
                      <p className="text-xs lg:text-sm text-gray-600">
                        Competitive package
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2 lg:mb-3 flex items-center space-x-2 text-sm lg:text-base">
                    <div className="w-2 h-2 bg-[#0891b2] rounded-full"></div>
                    <span>Required Skills</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(job.skills || []).map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 lg:px-3 py-1 lg:py-2 rounded-lg lg:rounded-xl text-xs lg:text-sm font-semibold border border-[#0891b2]/20 hover:scale-105 transition-transform cursor-default"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hide description on mobile to save space */}
                <div className="hidden lg:block p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                {/* Simplified description for mobile */}
                <div className="lg:hidden p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p
                    className="text-gray-700 text-sm leading-relaxed line-clamp-3 overflow-hidden"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {job.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg lg:shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 lg:px-8 py-4 lg:py-6 border-b border-gray-200">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Submit Your Application
                </h2>
                <p className="text-gray-600 mt-1 text-sm lg:text-base">
                  Please fill out all required fields to complete your
                  application
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-4 lg:p-8 space-y-6 lg:space-y-8"
              >
                {/* Error Display */}
                {submissionError && (
                  <div className="p-3 lg:p-4 bg-red-50 border border-red-200 rounded-xl lg:rounded-2xl">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg
                          className="w-5 h-5 lg:w-6 lg:h-6 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-800 mb-1">
                          Application Error
                        </h3>
                        <p className="text-sm text-red-700">
                          {submissionError}
                        </p>
                        {submissionError.includes("already applied") && (
                          <div className="mt-3">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => {
                                if (isAuthenticated) {
                                  router.push("/userdashboard/applications");
                                } else {
                                  router.push("/login");
                                }
                              }}
                              className="text-sm"
                            >
                              {isAuthenticated
                                ? "View My Applications"
                                : "Login to View Applications"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Login Option - Prominently placed at top (only if not authenticated) */}
                {!isAuthenticated && (
                  <div className="p-4 lg:p-6 bg-blue-50 border border-blue-200 rounded-xl lg:rounded-2xl">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                      <div className="flex-1">
                        <h3 className="text-base lg:text-lg font-semibold text-blue-900 mb-1">
                          Already have an account?
                        </h3>
                        <p className="text-sm text-blue-700">
                          Login to use your saved CV and apply faster. No need
                          to fill forms manually.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => {
                          // Create login URL with current page as redirect
                          const redirectUrl = encodeURIComponent(
                            window.location.href
                          );
                          const loginUrl = `/login?redirect=${redirectUrl}`;
                          window.location.href = loginUrl;
                        }}
                        className="lg:ml-4 w-full lg:w-auto"
                      >
                        Login
                      </Button>
                    </div>
                  </div>
                )}

                {/* Personal Information */}
                <div className="space-y-4 lg:space-y-6">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <div className="w-5 h-5 lg:w-6 lg:h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                    </div>
                    <span>Personal Information</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-white border border-gray-300 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-gray-900 placeholder-gray-500 text-sm lg:text-base"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-white border border-gray-300 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-gray-900 placeholder-gray-500 text-sm lg:text-base"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      {/* Country Code Selector */}
                      <select
                        value={formData.countryCode}
                        onChange={(e) =>
                          handleInputChange("countryCode", e.target.value)
                        }
                        className="px-2 lg:px-3 py-2.5 lg:py-3 bg-white border border-gray-300 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-gray-900 text-sm lg:text-base min-w-0 flex-shrink-0"
                        style={{ width: "120px" }}
                        title="Select country code"
                      >
                        {MIDDLE_EAST_COUNTRY_CODES.map((country) => (
                          <option
                            key={country.code}
                            value={country.code}
                            title={country.country}
                          >
                            {country.flag} {country.code}
                          </option>
                        ))}
                      </select>

                      {/* Phone Number Input */}
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="flex-1 px-3 lg:px-4 py-2.5 lg:py-3 bg-white border border-gray-300 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-gray-900 placeholder-gray-500 text-sm lg:text-base"
                        placeholder="790002033"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Select your country code and enter your phone number
                      without the country code
                    </p>
                  </div>
                </div>

                {/* CV Upload / Saved CVs */}
                <div className="space-y-4 lg:space-y-6">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <div className="w-5 h-5 lg:w-6 lg:h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                    </div>
                    <span>Documents</span>
                  </h3>

                  {isAuthenticated && isCandidate && savedCVs.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Select a saved CV
                      </label>
                      <select
                        value={selectedCVId || ""}
                        onChange={(e) => handleCVSelect(e.target.value)}
                        className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-white border border-gray-300 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-gray-900 text-sm lg:text-base"
                      >
                        {savedCVs.map((cv) => (
                          <option key={cv.id} value={cv.id}>
                            {cv.originalFileName ||
                              cv.fileName ||
                              `CV ${cv.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Resume/CV <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        type="file"
                        required={!selectedCVId}
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-white border border-gray-300 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-sm lg:text-base file:mr-2 lg:file:mr-4 file:py-1 lg:file:py-2 file:px-2 lg:file:px-4 file:rounded-lg lg:file:rounded-xl file:border-0 file:text-xs lg:file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Only PDF files are accepted. Maximum file size: 10MB.
                    </p>
                    {formData.cv && (
                      <p className="text-sm text-gray-700 flex items-center space-x-2">
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          {(() => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const cv = formData.cv as any;
                            if (cv && typeof cv === "object") {
                              if (
                                "originalFileName" in cv &&
                                cv.originalFileName
                              )
                                return cv.originalFileName;
                              if ("fileName" in cv && cv.fileName)
                                return cv.fileName;
                              if ("name" in cv && cv.name) return cv.name;
                            }
                            return "CV selected";
                          })()}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Portfolio/Website{" "}
                      <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.portfolio}
                      onChange={(e) =>
                        handleInputChange("portfolio", e.target.value)
                      }
                      className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-white border border-gray-300 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-gray-900 placeholder-gray-500 text-sm lg:text-base"
                      placeholder="https://your-portfolio.com"
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4 lg:space-y-6">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <div className="w-5 h-5 lg:w-6 lg:h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                    </div>
                    <span>Additional Information</span>
                  </h3>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Cover Letter{" "}
                      <span className="text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.coverLetter}
                      onChange={(e) =>
                        handleInputChange("coverLetter", e.target.value)
                      }
                      className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-white border border-gray-300 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-gray-900 placeholder-gray-500 resize-none text-sm lg:text-base"
                      placeholder="Tell us why you're perfect for this role..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 lg:pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    className="w-full py-3 lg:py-4 text-base lg:text-lg font-semibold rounded-xl lg:rounded-2xl"
                  >
                    {submitting
                      ? "Submitting Application..."
                      : "Submit Application"}
                  </Button>
                  <p className="text-xs lg:text-sm text-gray-500 text-center mt-2 lg:mt-3">
                    By submitting this application, you agree to our terms and
                    privacy policy.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
