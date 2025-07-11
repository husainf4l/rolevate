"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { JobData } from "@/components/common/JobCard";
import { JobService, JobPost } from "@/services/job";

const jobsData: JobData[] = [
  {
    id: "fallback-1",
    title: "Senior Software Engineer",
    company: "Aramco Digital",
    location: "Riyadh, Saudi Arabia",
    type: "Full-time",
    salary: "25,000 - 35,000 SAR",
    skills: ["React", "Node.js", "TypeScript", "AWS", "GraphQL"],
    posted: "2 days ago",
    applicants: 23,
    logo: "🏢",
    description:
      "Join Saudi Arabia's leading tech transformation initiative building next-generation digital solutions. You'll work on cutting-edge projects that impact millions of users across the Kingdom, using modern technologies and best practices in software development.",
    urgent: true,
  },
  {
    id: "fallback-2",
    title: "Product Manager",
    company: "Qatar Airways Group",
    location: "Doha, Qatar",
    type: "Full-time",
    salary: "18,000 - 25,000 QAR",
    skills: [
      "Product Strategy",
      "Analytics",
      "Leadership",
      "Agile",
      "Aviation Tech",
    ],
    posted: "1 day ago",
    applicants: 41,
    logo: "✈️",
    description:
      "Drive digital product innovation for Qatar's world-class airline and travel ecosystem. Lead cross-functional teams to deliver exceptional customer experiences across all touchpoints.",
  },
  {
    id: "fallback-3",
    title: "UX Designer",
    company: "Zain Jordan",
    location: "Amman, Jordan",
    type: "Full-time",
    salary: "1,200 - 1,800 JOD",
    skills: ["Figma", "User Research", "Arabic UX", "Mobile Design"],
    posted: "3 days ago",
    applicants: 18,
    logo: "📱",
    description:
      "Design innovative digital experiences for Jordan's leading telecommunications company. Focus on creating intuitive, accessible interfaces that serve diverse user needs across the region.",
  },
  {
    id: "fallback-4",
    title: "Data Scientist",
    company: "NEOM Tech",
    location: "NEOM, Saudi Arabia",
    type: "Full-time",
    salary: "30,000 - 45,000 SAR",
    skills: ["Python", "Machine Learning", "Smart Cities", "IoT", "AI"],
    posted: "1 day ago",
    applicants: 35,
    logo: "🌟",
    description:
      "Shape the future of smart cities with cutting-edge AI and data science at NEOM. Work on revolutionary projects that will define the next generation of urban living and sustainability.",
    urgent: true,
  },
  {
    id: "fallback-5",
    title: "Digital Marketing Manager",
    company: "Careem",
    location: "Dubai, UAE / Remote",
    type: "Full-time",
    salary: "15,000 - 22,000 AED",
    skills: [
      "Digital Marketing",
      "Arabic Content",
      "Social Media",
      "Growth Hacking",
    ],
    posted: "4 days ago",
    applicants: 29,
    logo: "🚗",
    description:
      "Lead regional marketing campaigns for the Middle East's super app serving millions. Drive user acquisition and engagement across multiple markets and platforms.",
  },
  {
    id: "fallback-6",
    title: "Cloud Solutions Architect",
    company: "Ooredoo Qatar",
    location: "Doha, Qatar",
    type: "Full-time",
    salary: "20,000 - 28,000 QAR",
    skills: ["AWS", "Azure", "5G Infrastructure", "Enterprise Solutions"],
    posted: "2 days ago",
    applicants: 27,
    logo: "☁️",
    description:
      "Architect next-generation cloud and 5G solutions for Qatar's digital transformation. Design scalable, secure infrastructure that supports the country's vision for digital innovation.",
  },
  {
    id: "fallback-7",
    title: "Cybersecurity Specialist",
    company: "Dubai Police",
    location: "Dubai, UAE",
    type: "Full-time",
    salary: "18,000 - 28,000 AED",
    skills: ["Cybersecurity", "Threat Analysis", "Incident Response", "Arabic"],
    posted: "5 days ago",
    applicants: 15,
    logo: "🛡️",
    description:
      "Protect Dubai's digital infrastructure with cutting-edge cybersecurity solutions. Join a team dedicated to maintaining the highest security standards for one of the world's smartest cities.",
  },
  {
    id: "fallback-8",
    title: "AI Research Engineer",
    company: "KAUST",
    location: "Thuwal, Saudi Arabia",
    type: "Full-time",
    salary: "28,000 - 38,000 SAR",
    skills: [
      "Machine Learning",
      "Deep Learning",
      "Research",
      "Python",
      "TensorFlow",
    ],
    posted: "3 days ago",
    applicants: 31,
    logo: "🧠",
    description:
      "Advance AI research at one of the world's leading science and technology universities. Collaborate with international researchers on groundbreaking projects that push the boundaries of artificial intelligence.",
  },
];

// Change jobRequirements keys to strings to match JobData id type
const jobRequirements: { [key: string]: string[] } = {
  "fallback-1": [
    "5+ years of experience in software development",
    "Expert knowledge of React, Node.js, and TypeScript",
    "Experience with AWS cloud services",
    "Strong understanding of GraphQL and RESTful APIs",
    "Experience with microservices architecture",
    "Fluency in English and Arabic preferred",
  ],
  "fallback-2": [
    "3+ years of product management experience",
    "Experience in aviation or travel industry preferred",
    "Strong analytical and data-driven decision making skills",
    "Proven track record of leading cross-functional teams",
    "Experience with Agile development methodologies",
    "Excellent communication skills in English and Arabic",
  ],
  "fallback-3": [
    "3+ years of UX/UI design experience",
    "Proficiency in Figma and design systems",
    "Experience with user research and testing",
    "Understanding of Arabic typography and RTL design",
    "Mobile-first design approach",
    "Portfolio showcasing relevant work",
  ],
  "fallback-4": [
    "PhD or Master's in Computer Science, Statistics, or related field",
    "5+ years of experience in machine learning and AI",
    "Expertise in Python, TensorFlow, and PyTorch",
    "Experience with big data technologies",
    "Knowledge of smart city technologies and IoT",
    "Research publication experience preferred",
  ],
  "fallback-5": [
    "4+ years of digital marketing experience",
    "Experience in Middle East markets",
    "Proficiency in Arabic content creation",
    "Strong social media and growth hacking skills",
    "Experience with marketing automation tools",
    "Data-driven approach to campaign optimization",
  ],
  "fallback-6": [
    "5+ years of cloud architecture experience",
    "AWS and Azure certifications",
    "Experience with 5G infrastructure",
    "Knowledge of enterprise solutions",
    "Strong problem-solving and communication skills",
    "Experience in telecommunications industry preferred",
  ],
  "fallback-7": [
    "Bachelor's degree in Cybersecurity or related field",
    "3+ years of cybersecurity experience",
    "Experience with threat analysis and incident response",
    "Knowledge of security frameworks and compliance",
    "Fluency in Arabic and English",
    "Security certifications (CISSP, CEH, etc.) preferred",
  ],
  "fallback-8": [
    "PhD in Machine Learning, AI, or related field",
    "2+ years of research experience",
    "Expertise in deep learning and neural networks",
    "Proficiency in Python and TensorFlow",
    "Strong publication record",
    "Experience with collaborative research projects",
  ],
};

const benefits = [
  "Competitive salary and benefits package",
  "Health insurance for employee and family",
  "Annual leave and sick leave",
  "Professional development opportunities",
  "Flexible working arrangements",
  "Performance bonuses",
  "End-of-service benefits",
  "Visa sponsorship for international candidates",
];

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobData | null>(null);
  const [jobPost, setJobPost] = useState<JobPost | null>(null); // Store original job post data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const jobId = params.id as string;

  // Helper function to convert JobPost to JobData format
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
        return "�";
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
        setJobPost(jobPostData); // Store original job post data
      } catch (err) {
        console.error("Error fetching job:", err);
        setError("Failed to load job details");
        // Try to find in fallback data
        const fallbackJob = jobsData.find((j) => j.id === jobId);
        if (fallbackJob) {
          setJob(fallbackJob);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  // Error state or job not found
  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error ? "Failed to Load Job" : "Job Not Found"}
          </h1>
          <p className="text-gray-600 mb-6">
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
              Back to Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleApply = () => {
    router.push(`/jobs/${jobId}/apply`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.push("/jobs")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
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
              Back to Jobs
            </button>
            {job.urgent && (
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Urgent
              </span>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start gap-8">
            {/* Job Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-2xl border border-gray-200">
                  {job.logo}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M5 21h2m0 0h2"
                        />
                      </svg>
                      <span className="font-semibold">{job.company}</span>
                    </div>
                    {jobPost?.department && (
                      <div className="flex items-center gap-1">
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <span>{jobPost.department}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
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
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium">
                      {job.type}
                    </span>
                    {jobPost?.workType && (
                      <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium border border-blue-200">
                        {jobPost.workType === "ONSITE"
                          ? "On-site"
                          : jobPost.workType === "REMOTE"
                          ? "Remote"
                          : "Hybrid"}
                      </span>
                    )}
                    {jobPost?.jobLevel && (
                      <span className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg font-medium border border-purple-200">
                        {jobPost.jobLevel === "ENTRY"
                          ? "Entry Level"
                          : jobPost.jobLevel === "MID"
                          ? "Mid Level"
                          : jobPost.jobLevel === "SENIOR"
                          ? "Senior Level"
                          : "Executive"}
                      </span>
                    )}
                    <span className="font-semibold text-gray-900 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                      {job.salary}
                    </span>
                    {jobPost?.deadline && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div>
                            <div className="text-xs font-medium text-orange-800">
                              Application Deadline
                            </div>
                            <div className="text-xs text-orange-600">
                              {new Date(jobPost.deadline).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Posted {job.posted}</span>
                    </div>
                    {jobPost?.experience && (
                      <div className="flex items-center gap-1">
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
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8a2 2 0 012-2V6"
                          />
                        </svg>
                        <span>{jobPost.experience} experience</span>
                      </div>
                    )}
                    {jobPost?.education && (
                      <div className="flex items-center gap-1">
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
                            d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                          />
                        </svg>
                        <span>{jobPost.education}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="lg:w-80">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                <Button
                  onClick={handleApply}
                  variant="primary"
                  size="lg"
                  className="w-full mb-4"
                  // disabled={isApplying}
                >
                  {"Apply Now"}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() => alert("Job saved!")}
                >
                  Save Job
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Job Description
              </h2>
              <p className="text-gray-600 leading-relaxed">{job.description}</p>
            </div>

            {/* Responsibilities */}
            {jobPost?.responsibilities && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Key Responsibilities
                </h2>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-gray-600 leading-relaxed">
                    {jobPost.responsibilities}
                  </div>
                </div>
              </div>
            )}

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Requirements
              </h2>
              {jobPost?.requirements ? (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-gray-600 leading-relaxed">
                    {jobPost.requirements}
                  </div>
                </div>
              ) : (
                <ul className="space-y-3">
                  {(jobRequirements[jobId] || []).map(
                    (req: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-600">{req}</span>
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Benefits</h2>
              {jobPost?.benefits ? (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-gray-600 leading-relaxed">
                    {jobPost.benefits}
                  </div>
                </div>
              ) : (
                <ul className="space-y-3">
                  {benefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Required Skills */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                About {job.company}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-sm border border-gray-200">
                    {job.logo}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {job.company}
                    </div>
                    <div className="text-sm text-gray-500">
                      {jobPost?.company?.address
                        ? `${jobPost.company.address.street}, ${jobPost.company.address.city}, ${jobPost.company.address.country}`
                        : job.location}
                    </div>
                    {jobPost?.industry && (
                      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
                        {jobPost.industry.charAt(0).toUpperCase() +
                          jobPost.industry.slice(1)}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {jobPost?.companyDescription ||
                    "A leading company in the Middle East region, committed to innovation and excellence in their industry."}
                </p>
              </div>
            </div>

            {/* Similar Jobs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Similar Jobs
              </h3>
              <div className="space-y-3">
                {jobsData
                  .filter((j) => j.id !== jobId)
                  .slice(0, 3)
                  .map((similarJob: JobData) => (
                    <div
                      key={similarJob.id}
                      className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-sm border border-gray-200">
                          {similarJob.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {similarJob.title}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {similarJob.company}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {similarJob.type}
                            </span>
                            <span className="text-xs font-medium text-gray-900">
                              {similarJob.salary}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
