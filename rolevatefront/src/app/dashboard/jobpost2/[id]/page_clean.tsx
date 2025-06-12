"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PencilIcon,
  PlayIcon,
  PauseIcon,
  CogIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  BellIcon,
  ShareIcon,
  EyeIcon,
  TrashIcon,
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  StarIcon,
  XMarkIcon,
  InformationCircleIcon,
  SparklesIcon,
  MicrophoneIcon,
  StopIcon,
  SpeakerWaveIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { getJobDetails, Job } from "@/services/jobs.service";

type JobPostStatus = "active" | "paused" | "draft" | "completed";
type AgentStatus = "active" | "inactive" | "configuring";
type CandidateStatus =
  | "applied"
  | "cv_review"
  | "interview_scheduled"
  | "interviewed"
  | "shortlisted"
  | "rejected"
  | "hired";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  appliedAt: string;
  status: CandidateStatus;
  cvScore: number;
  interviewRating?: number;
  experience: number;
  location: string;
  avatar?: string;
  skills: string[];
  notes: string;
}

interface JobPost {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract";
  status: JobPostStatus;
  applicants: number;
  createdBy: string;
  createdAt: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary: string;
  candidates: Candidate[];
  analytics: {
    views: number;
    applications: number;
    cvScreeningPass: number;
    interviewInvitations: number;
    offers: number;
    conversionRate: number;
    avgTimeToHire: number;
  };
  agents: {
    cvAnalysis: {
      id: string;
      name: string;
      status: AgentStatus;
      systemPrompt: string;
      settings: {
        minimumScore: number;
        requiredSkills: string[];
        experienceThreshold: number;
        languageRequirements: string[];
      };
      metrics: {
        cvsProcessed: number;
        averageScore: number;
        passRate: number;
      };
    };
    interview: {
      id: string;
      name: string;
      status: AgentStatus;
      systemPrompt: string;
      settings: {
        interviewDuration: number;
        languages: string[];
        questionTypes: string[];
        difficultyLevel: "junior" | "mid" | "senior";
      };
      metrics: {
        interviewsConducted: number;
        averageRating: number;
        completionRate: number;
      };
    };
    whatsapp: {
      id: string;
      name: string;
      status: AgentStatus;
      systemPrompt: string;
      settings: {
        responseDelay: number;
        workingHours: { start: string; end: string };
        messageTemplates: string[];
        autoReminders: boolean;
      };
      metrics: {
        messagesSent: number;
        responseRate: number;
        engagementRate: number;
      };
    };
  };
}

const JobPostDetail = () => {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "agents" | "candidates" | "analytics"
  >("overview");
  const [selectedAgent, setSelectedAgent] = useState<
    "cvAnalysis" | "interview" | "whatsapp" | null
  >(null);
  const [candidateFilter, setCandidateFilter] = useState<
    CandidateStatus | "all"
  >("all");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: "success" | "warning" | "error";
      message: string;
    }>
  >([]);
  const [showPromptGenerator, setShowPromptGenerator] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "hr" | "ai"; message: string; timestamp: Date }>
  >([]);
  const [currentInput, setCurrentInput] = useState("");

  // Fetch job data from API
  useEffect(() => {
    const fetchJobData = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        setError(null);
        const jobData = await getJobDetails(params.id as string);
        setJob(jobData);
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load job details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [params.id]);

  // Convert API job data to component format
  const getJobDisplayData = (): JobPost | null => {
    if (!job) return null;

    return {
      id: job.id,
      title: job.title,
      department: "Technology", // Default since API doesn't have department field
      location: job.location,
      type: job.workType.toLowerCase() as
        | "full-time"
        | "part-time"
        | "contract",
      status: (job.isActive ? "active" : "paused") as JobPostStatus,
      applicants: job.applicationCount || 0,
      createdBy: job.createdBy?.name || "System",
      createdAt: new Date(job.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      description: job.description,
      requirements: job.requirements
        ? job.requirements.split("\n").filter((req) => req.trim())
        : [],
      benefits: job.benefits
        ? job.benefits.split("\n").filter((benefit) => benefit.trim())
        : [],
      salary:
        job.salaryMin && job.salaryMax
          ? `${
              job.currency || "AED"
            } ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
          : "Competitive salary",
      candidates: mockCandidates, // Use mock candidates until applications API is integrated
      analytics: {
        views: job.viewCount || 0,
        applications: job.applicationCount || 0,
        cvScreeningPass: Math.floor((job.applicationCount || 0) * 0.7), // Mock calculation
        interviewInvitations: Math.floor((job.applicationCount || 0) * 0.3), // Mock calculation
        offers: Math.floor((job.applicationCount || 0) * 0.05), // Mock calculation
        conversionRate: job.applicationCount
          ? ((job.applicationCount * 0.05) / job.applicationCount) * 100
          : 0,
        avgTimeToHire: 18, // Mock data
      },
      agents: {
        cvAnalysis: {
          id: "cv-agent-1",
          name: "Banking CV Analyzer",
          status: "active" as AgentStatus,
          systemPrompt:
            job.aiPrompt ||
            "You are an expert recruitment specialist. Analyze CVs for this position, focusing on relevant experience, educational background, and industry knowledge.",
          settings: {
            minimumScore: 70,
            requiredSkills: job.skills || [],
            experienceThreshold: 3,
            languageRequirements: ["English"],
          },
          metrics: {
            cvsProcessed: job.applicationCount || 0,
            averageScore: 68,
            passRate: 37,
          },
        },
        interview: {
          id: "interview-agent-1",
          name: "AI Interview Assistant",
          status: (job.enableAiInterview
            ? "active"
            : "inactive") as AgentStatus,
          systemPrompt:
            job.aiPrompt ||
            "You are a professional interview specialist. Conduct comprehensive interviews for this position.",
          settings: {
            interviewDuration: job.interviewDuration || 30,
            languages: ["English"],
            questionTypes: ["Behavioral", "Technical", "Situational"],
            difficultyLevel: job.experienceLevel
              ?.toLowerCase()
              .includes("senior")
              ? "senior"
              : job.experienceLevel?.toLowerCase().includes("junior")
              ? "junior"
              : "mid",
          },
          metrics: {
            interviewsConducted: Math.floor((job.applicationCount || 0) * 0.3),
            averageRating: 7.4,
            completionRate: 94,
          },
        },
        whatsapp: {
          id: "whatsapp-agent-1",
          name: "WhatsApp Communicator",
          status: "active" as AgentStatus,
          systemPrompt:
            "You are a professional recruitment assistant communicating via WhatsApp. Guide candidates through the recruitment process.",
          settings: {
            responseDelay: 5,
            workingHours: { start: "08:00", end: "18:00" },
            messageTemplates: [
              "Interview Invitation",
              "Application Confirmation",
              "Status Update",
            ],
            autoReminders: true,
          },
          metrics: {
            messagesSent: (job.applicationCount || 0) * 2,
            responseRate: 85,
            engagementRate: 72,
          },
        },
      },
    };
  };

  // Mock candidates data since applications API is not yet integrated
  const mockCandidates: Candidate[] = [
    {
      id: "candidate-1",
      name: "Ahmed Al-Mansouri",
      email: "ahmed.mansouri@email.com",
      phone: "+971-50-123-4567",
      appliedAt: "2025-05-18",
      status: "interviewed",
      cvScore: 85,
      interviewRating: 8.2,
      experience: 7,
      location: "Dubai, UAE",
      skills: [
        "Corporate Banking",
        "Relationship Management",
        "Arabic",
        "English",
      ],
      notes: "Strong candidate with excellent banking background",
    },
    {
      id: "candidate-2",
      name: "Fatima Al-Zahra",
      email: "fatima.zahra@email.com",
      phone: "+971-55-987-6543",
      appliedAt: "2025-05-17",
      status: "cv_review",
      cvScore: 78,
      experience: 5,
      location: "Abu Dhabi, UAE",
      skills: ["Banking", "Customer Service", "Arabic", "English"],
      notes: "Good potential, needs skills assessment",
    },
    {
      id: "candidate-3",
      name: "Omar Hassan",
      email: "omar.hassan@email.com",
      phone: "+971-56-246-8135",
      appliedAt: "2025-05-16",
      status: "shortlisted",
      cvScore: 92,
      interviewRating: 9.1,
      experience: 8,
      location: "Dubai, UAE",
      skills: [
        "Corporate Banking",
        "Risk Management",
        "Leadership",
        "Arabic",
        "English",
      ],
      notes: "Excellent candidate, ready for final interview",
    },
    {
      id: "candidate-4",
      name: "Sarah Abdullah",
      email: "sarah.abdullah@email.com",
      phone: "+971-52-135-7924",
      appliedAt: "2025-05-15",
      status: "interview_scheduled",
      cvScore: 81,
      experience: 6,
      location: "Sharjah, UAE",
      skills: ["Banking Operations", "Client Relations", "Arabic", "English"],
      notes: "Interview scheduled for next week",
    },
    {
      id: "candidate-5",
      name: "Mohammed Al-Rashid",
      email: "mohammed.rashid@email.com",
      phone: "+971-50-864-2975",
      appliedAt: "2025-05-14",
      status: "rejected",
      cvScore: 45,
      experience: 2,
      location: "Dubai, UAE",
      skills: ["Basic Banking", "Customer Service"],
      notes: "Insufficient experience for senior role",
    },
  ];

  const jobPost = getJobDisplayData();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C6AD] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">Error loading job details</p>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-[#00C6AD] hover:bg-[#14B8A6] text-white px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // No job data
  if (!jobPost) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Job not found</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: JobPostStatus | AgentStatus) => {
    const statusConfig = {
      active: {
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        text: "Active",
      },
      paused: {
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        text: "Paused",
      },
      draft: {
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        text: "Draft",
      },
      completed: {
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        text: "Completed",
      },
      inactive: {
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        text: "Inactive",
      },
      configuring: {
        color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        text: "Configuring",
      },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const toggleAgentStatus = (
    agentType: "cvAnalysis" | "interview" | "whatsapp"
  ) => {
    console.log(`Toggling ${agentType} agent status`);
    addNotification(
      "success",
      `${agentType} agent status updated successfully`
    );
  };

  const addNotification = (
    type: "success" | "warning" | "error",
    message: string
  ) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const getCandidateStatusBadge = (status: CandidateStatus) => {
    const statusConfig = {
      applied: {
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        text: "Applied",
      },
      cv_review: {
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        text: "CV Review",
      },
      interview_scheduled: {
        color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        text: "Interview Scheduled",
      },
      interviewed: {
        color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        text: "Interviewed",
      },
      shortlisted: {
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        text: "Shortlisted",
      },
      rejected: {
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        text: "Rejected",
      },
      hired: {
        color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        text: "Hired",
      },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const filteredCandidates = jobPost.candidates.filter((candidate) => {
    const matchesFilter =
      candidateFilter === "all" || candidate.status === candidateFilter;
    const matchesSearch =
      candidate.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      candidate.email.toLowerCase().includes(candidateSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCandidateSelect = (candidateId: string, selected: boolean) => {
    if (selected) {
      setSelectedCandidates((prev) => [...prev, candidateId]);
    } else {
      setSelectedCandidates((prev) => prev.filter((id) => id !== candidateId));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action ${action} for candidates:`, selectedCandidates);
    addNotification(
      "success",
      `${action} applied to ${selectedCandidates.length} candidates`
    );
    setSelectedCandidates([]);
    setShowBulkActions(false);
  };

  // Auto-show bulk actions when candidates are selected
  useEffect(() => {
    setShowBulkActions(selectedCandidates.length > 0);
  }, [selectedCandidates]);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{jobPost.title}</h1>
              <p className="text-gray-400">
                {jobPost.department} • {jobPost.location}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(jobPost.status)}
            <button
              onClick={() =>
                addNotification("success", "Job post shared successfully")
              }
              className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              title="Share Job Post"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => addNotification("success", "Job post duplicated")}
              className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              title="Duplicate Job Post"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
            </button>
            <button className="bg-[#00C6AD] hover:bg-[#14B8A6] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <PencilIcon className="h-4 w-4" />
              Edit Job
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
          {[
            { id: "overview", label: "Overview", icon: InformationCircleIcon },
            { id: "agents", label: "AI Agents", icon: CogIcon },
            { id: "candidates", label: "Candidates", icon: UserGroupIcon },
            { id: "analytics", label: "Analytics", icon: ChartBarIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-[#00C6AD] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Job Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Job Description
                </h2>
                <p className="text-gray-300 mb-6">{jobPost.description}</p>

                <h3 className="text-lg font-semibold text-white mb-3">
                  Requirements
                </h3>
                <ul className="space-y-2 mb-6">
                  {jobPost.requirements.map((req, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-300"
                    >
                      <CheckCircleIcon className="h-5 w-5 text-[#00C6AD] mt-0.5 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>

                <h3 className="text-lg font-semibold text-white mb-3">
                  Benefits
                </h3>
                <ul className="space-y-2">
                  {jobPost.benefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-300"
                    >
                      <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Job Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Applicants</span>
                    <span className="text-white font-semibold">
                      {jobPost.applicants}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Salary Range</span>
                    <span className="text-white font-semibold">
                      {jobPost.salary}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Created By</span>
                    <span className="text-white font-semibold">
                      {jobPost.createdBy}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white font-semibold">
                      {jobPost.createdAt}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  AI Agent Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">CV Analysis</span>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        jobPost.agents.cvAnalysis.status === "active"
                          ? "bg-green-400"
                          : "bg-gray-500"
                      }`}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Interview AI</span>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        jobPost.agents.interview.status === "active"
                          ? "bg-green-400"
                          : "bg-gray-500"
                      }`}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">WhatsApp</span>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        jobPost.agents.whatsapp.status === "active"
                          ? "bg-green-400"
                          : "bg-gray-500"
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would go here - simplified for now */}
        {activeTab !== "overview" && (
          <div className="text-center py-12">
            <p className="text-gray-400">
              This tab is currently being updated with real data integration.
            </p>
          </div>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 space-y-2 z-50">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 rounded-lg shadow-lg ${
                  notification.type === "success"
                    ? "bg-green-600"
                    : notification.type === "warning"
                    ? "bg-yellow-600"
                    : "bg-red-600"
                } text-white`}
              >
                {notification.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPostDetail;
