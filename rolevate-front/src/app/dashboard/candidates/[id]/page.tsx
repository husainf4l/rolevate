"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/dashboard/Header";
import {
  UserIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UsersIcon,
  TagIcon,
  ArrowLeftIcon,
  PencilIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import Link from "next/link";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  location: string;
  experience: string;
  education: string;
  skills: string[];
  status: "ai_analysis" | "ai_interview_1" | "ai_interview_2" | "hr_interview" | "offer" | "hired" | "rejected";
  appliedDate: string;
  lastActivity: string;
  salary: string;
  aiScore: number;
  notes: string;
  avatar?: string;
  resume: string;
  jobId: string;
  jobTitle: string;
  source: "website" | "linkedin" | "referral" | "recruiter";
  priority: "high" | "medium" | "low";
  tags: string[];
}

const candidates: Candidate[] = [
  {
    id: "1",
    name: "Sarah Al-Ahmad",
    email: "sarah.ahmad@email.com",
    phone: "+971 50 123 4567",
    position: "Senior Frontend Developer",
    location: "Dubai, UAE",
    experience: "5 years",
    education: "Bachelor's in Computer Science - American University of Beirut",
    skills: ["React", "TypeScript", "Node.js", "AWS", "GraphQL", "Redux", "Tailwind CSS", "Jest"],
    status: "ai_interview_2",
    appliedDate: "2024-12-01",
    lastActivity: "2 hours ago",
    salary: "AED 18,000",
    aiScore: 89,
    notes: "AI Analysis: Strong technical skills match. Passed AI Interview 1 with excellent problem-solving. Currently in AI Interview 2.",
    resume: "sarah_ahmad_resume.pdf",
    jobId: "1",
    jobTitle: "Senior Frontend Developer",
    source: "linkedin",
    priority: "high",
    tags: ["React Expert", "Remote OK", "Immediate Start"],
  },
  {
    id: "2",
    name: "Mohammed Hassan",
    email: "m.hassan@email.com",
    phone: "+966 55 987 6543",
    position: "React Developer",
    location: "Riyadh, Saudi Arabia",
    experience: "3 years",
    education: "Bachelor's in Software Engineering - King Saud University",
    skills: ["React", "JavaScript", "CSS", "MongoDB", "Express", "HTML5", "Git"],
    status: "ai_interview_1",
    appliedDate: "2024-11-28",
    lastActivity: "1 day ago",
    salary: "SAR 14,000",
    aiScore: 76,
    notes: "AI Analysis: Good skills match. Solid fundamentals. Currently in first AI interview stage.",
    resume: "mohammed_hassan_resume.pdf",
    jobId: "2",
    jobTitle: "React Developer",
    source: "website",
    priority: "medium",
    tags: ["Arabic Speaker", "Local"],
  },
];

const getStatusColor = (status: Candidate["status"]) => {
  switch (status) {
    case "ai_analysis":
      return "bg-blue-100 text-blue-800";
    case "ai_interview_1":
      return "bg-purple-100 text-purple-800";
    case "ai_interview_2":
      return "bg-indigo-100 text-indigo-800";
    case "hr_interview":
      return "bg-yellow-100 text-yellow-800";
    case "offer":
      return "bg-green-100 text-green-800";
    case "hired":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: Candidate["priority"]) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getSourceIcon = (source: Candidate["source"]) => {
  switch (source) {
    case "linkedin":
      return "💼";
    case "website":
      return "🌐";
    case "referral":
      return "👥";
    case "recruiter":
      return "🎯";
    default:
      return "📧";
  }
};

const getStatusIcon = (status: Candidate["status"]) => {
  switch (status) {
    case "ai_analysis":
      return ChartBarIcon;
    case "ai_interview_1":
    case "ai_interview_2":
      return ChatBubbleLeftRightIcon;
    case "hr_interview":
      return UserIcon;
    case "offer":
      return CheckCircleIcon;
    case "hired":
      return UsersIcon;
    case "rejected":
      return XCircleIcon;
    default:
      return ClockIcon;
  }
};

const aiPipelineStages = [
  { id: "ai_analysis", name: "AI Analysis", description: "Initial AI screening" },
  { id: "ai_interview_1", name: "AI Interview 1", description: "First AI interview" },
  { id: "ai_interview_2", name: "AI Interview 2", description: "Second AI interview" },
  { id: "hr_interview", name: "HR Interview", description: "Human recruiter interview" },
  { id: "offer", name: "Offer", description: "Job offer extended" },
  { id: "hired", name: "Hired", description: "Successfully hired" },
];

export default function CandidateProfile() {
  const params = useParams();
  const candidateId = params.id as string;
  const [candidate, setCandidate] = useState<Candidate | null>(
    candidates.find((c) => c.id === candidateId) || null
  );

  if (!candidate) {
    return (
      <div className="p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Candidate Not Found</h1>
            <Link
              href="/dashboard/candidates"
              className="text-[#0891b2] hover:text-[#0fc4b5] font-medium"
            >
              Back to Candidates
            </Link>
          </div>
        </div>
      </div>
    );
  }


  const getCurrentStageIndex = () => {
    return aiPipelineStages.findIndex((stage) => stage.id === candidate.status);
  };

  const handleStatusChange = (newStatus: Candidate["status"]) => {
    setCandidate({ ...candidate, status: newStatus, lastActivity: "Just now" });
  };

  const StatusIcon = getStatusIcon(candidate.status);

  return (
    <div className="p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard/candidates"
            className="inline-flex items-center gap-2 text-[#0891b2] hover:text-[#0fc4b5] font-medium mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Candidates
          </Link>
          <Header
            title={candidate.name}
            subtitle={`${candidate.position} • Applied ${candidate.appliedDate}`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
                    <span className="text-xl">{getSourceIcon(candidate.source)}</span>
                  </div>
                  <p className="text-lg text-gray-600 mb-3">{candidate.position}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{candidate.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BriefcaseIcon className="w-4 h-4" />
                      <span>{candidate.experience} experience</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <PhoneIcon className="w-4 h-4" />
                      <span>{candidate.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <EnvelopeIcon className="w-4 h-4" />
                      <span>{candidate.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-[#0891b2] bg-[#0fc4b5]/10 px-2 py-1 rounded">
                        AI Score: {candidate.aiScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Pipeline Progress */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recruitment Pipeline</h3>
              <div className="space-y-4">
                {aiPipelineStages.map((stage, index) => {
                  const isCompleted = index < getCurrentStageIndex();
                  const isCurrent = stage.id === candidate.status;
                  const isRejected = candidate.status === "rejected";
                  
                  return (
                    <div key={stage.id} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted ? "bg-[#0891b2] text-white shadow-md" :
                        isCurrent ? "bg-[#0fc4b5] text-white shadow-md ring-2 ring-[#0fc4b5]/30" :
                        isRejected ? "bg-red-100 text-red-600" :
                        "bg-gray-200 text-gray-600"
                      }`}>
                        {isCompleted || isCurrent ? (
                          <CheckCircleIcon className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold ${
                            isCompleted ? "text-[#0891b2]" : isCurrent ? "text-[#0fc4b5]" : "text-gray-600"
                          }`}>
                            {stage.name}
                          </h4>
                          {isCurrent && (
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-[#0891b2] text-white shadow-sm">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{stage.description}</p>
                      </div>
                    </div>
                  );
                })}
                {candidate.status === "rejected" && (
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircleIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-red-600">Rejected</h4>
                      <p className="text-sm text-gray-600">Application was not successful</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Skills & Education */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Education</h3>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <AcademicCapIcon className="w-5 h-5 text-gray-600" />
                  <h4 className="font-medium text-gray-900">Education</h4>
                </div>
                <p className="text-gray-700">{candidate.education}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#0891b2]/15 text-[#0891b2] rounded-full text-sm font-semibold border border-[#0fc4b5]/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis & Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{candidate.notes}</p>
            </div>
          </div>

          {/* Right Column - Actions & Status */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <StatusIcon className="w-6 h-6 text-[#0891b2]" />
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(candidate.status)}`}>
                      {candidate.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Last activity: {candidate.lastActivity}</p>
                  <p>Applied: {candidate.appliedDate}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white rounded-lg hover:bg-[#0fc4b5] transition-colors shadow-md font-medium">
                  <CheckCircleIcon className="w-4 h-4" />
                  Advance to Next Stage
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 bg-[#0fc4b5] text-white rounded-lg hover:bg-[#0891b2] transition-colors shadow-md font-medium">
                  <ClockIcon className="w-4 h-4" />
                  Schedule Interview
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md font-medium">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  Send Message
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md font-medium">
                  <XCircleIcon className="w-4 h-4" />
                  Reject Candidate
                </button>
              </div>
            </div>

            {/* Job Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Applied For</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{candidate.jobTitle}</p>
                  <p className="text-sm text-gray-600">Job ID: {candidate.jobId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expected Salary</p>
                  <p className="font-medium text-gray-900">{candidate.salary}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(candidate.priority)}`}>
                    {candidate.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Resume */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume</h3>
              <button className="w-full flex items-center gap-2 px-4 py-2 border-2 border-[#0fc4b5] text-[#0891b2] rounded-lg hover:bg-[#0fc4b5]/10 transition-colors font-medium">
                <DocumentTextIcon className="w-4 h-4" />
                View Resume ({candidate.resume})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}