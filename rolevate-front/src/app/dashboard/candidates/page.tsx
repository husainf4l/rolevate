"use client";

import React, { useState } from "react";
import Header from "@/components/dashboard/Header";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

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
  status:
    | "ai_analysis"
    | "ai_interview_1"
    | "ai_interview_2"
    | "hr_interview"
    | "offer"
    | "hired"
    | "rejected";
  appliedDate: string;
  lastActivity: string;
  salary: string;
  aiScore: number;
  cvRating: number;
  interview1Rating: number;
  interview2Rating: number;
  hrRating: number;
  overallRating: number;
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
    education: "Bachelor's in Computer Science - AUB",
    skills: ["React", "TypeScript", "Node.js", "AWS", "GraphQL"],
    status: "ai_interview_2",
    appliedDate: "2024-12-01",
    lastActivity: "2 hours ago",
    salary: "AED 18,000",
    aiScore: 89,
    cvRating: 92,
    interview1Rating: 88,
    interview2Rating: 85,
    hrRating: 0,
    overallRating: 88,
    notes:
      "AI Analysis: Strong technical skills match. Passed AI Interview 1 with excellent problem-solving. Currently in AI Interview 2.",
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
    education: "Bachelor's in Software Engineering - KSU",
    skills: ["React", "JavaScript", "CSS", "MongoDB", "Express"],
    status: "ai_interview_1",
    appliedDate: "2024-11-28",
    lastActivity: "1 day ago",
    salary: "SAR 14,000",
    aiScore: 76,
    cvRating: 78,
    interview1Rating: 74,
    interview2Rating: 0,
    hrRating: 0,
    overallRating: 76,
    notes:
      "AI Analysis: Good skills match. Solid fundamentals. Currently in first AI interview stage.",
    resume: "mohammed_hassan_resume.pdf",
    jobId: "2",
    jobTitle: "React Developer",
    source: "website",
    priority: "medium",
    tags: ["Arabic Speaker", "Local"],
  },
  {
    id: "3",
    name: "Fatima Al-Zahra",
    email: "fatima.zahra@email.com",
    phone: "+974 77 456 7890",
    position: "UI/UX Designer",
    location: "Doha, Qatar",
    experience: "4 years",
    education: "Master's in Design - QU",
    skills: ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"],
    status: "offer",
    appliedDate: "2024-11-25",
    lastActivity: "3 hours ago",
    salary: "QAR 12,000",
    aiScore: 94,
    cvRating: 96,
    interview1Rating: 92,
    interview2Rating: 94,
    hrRating: 91,
    overallRating: 94,
    notes:
      "AI Analysis: Excellent portfolio match. Passed both AI interviews and HR interview. Offer extended.",
    resume: "fatima_zahra_resume.pdf",
    jobId: "3",
    jobTitle: "UI/UX Designer",
    source: "referral",
    priority: "high",
    tags: ["Design Leader", "Bilingual", "Portfolio+"],
  },
  {
    id: "4",
    name: "Omar Khalil",
    email: "omar.khalil@email.com",
    phone: "+965 99 321 6540",
    position: "Full Stack Developer",
    location: "Kuwait City, Kuwait",
    experience: "6 years",
    education: "Bachelor's in Computer Engineering - KU",
    skills: ["Node.js", "Python", "React", "PostgreSQL", "Docker"],
    status: "hired",
    appliedDate: "2024-11-20",
    lastActivity: "1 week ago",
    salary: "KWD 1,100",
    aiScore: 92,
    cvRating: 94,
    interview1Rating: 90,
    interview2Rating: 92,
    hrRating: 89,
    overallRating: 92,
    notes:
      "AI Analysis: Outstanding technical match. Completed full recruitment pipeline successfully.",
    resume: "omar_khalil_resume.pdf",
    jobId: "4",
    jobTitle: "Full Stack Developer",
    source: "recruiter",
    priority: "high",
    tags: ["Senior Level", "Team Lead", "Full Stack"],
  },
  {
    id: "5",
    name: "Layla Ibrahim",
    email: "layla.ibrahim@email.com",
    phone: "+973 36 789 0123",
    position: "DevOps Engineer",
    location: "Manama, Bahrain",
    experience: "4 years",
    education: "Bachelor's in IT - University of Bahrain",
    skills: ["AWS", "Docker", "Kubernetes", "Jenkins", "Terraform"],
    status: "ai_analysis",
    appliedDate: "2024-12-05",
    lastActivity: "1 hour ago",
    salary: "BHD 1,200",
    aiScore: 71,
    cvRating: 73,
    interview1Rating: 0,
    interview2Rating: 0,
    hrRating: 0,
    overallRating: 71,
    notes:
      "AI Analysis: Currently being analyzed by AI system. Initial score shows potential match.",
    resume: "layla_ibrahim_resume.pdf",
    jobId: "6",
    jobTitle: "DevOps Engineer",
    source: "website",
    priority: "medium",
    tags: ["AWS Certified", "Remote Ready"],
  },
  {
    id: "6",
    name: "Ahmed Mansour",
    email: "ahmed.mansour@email.com",
    phone: "+962 79 555 4321",
    position: "Mobile App Developer",
    location: "Amman, Jordan",
    experience: "3 years",
    education: "Bachelor's in Software Engineering - JU",
    skills: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase"],
    status: "rejected",
    appliedDate: "2024-11-15",
    lastActivity: "2 weeks ago",
    salary: "JOD 900",
    aiScore: 45,
    cvRating: 42,
    interview1Rating: 0,
    interview2Rating: 0,
    hrRating: 0,
    overallRating: 45,
    notes:
      "AI Analysis: Skills mismatch detected. Did not meet minimum requirements for AI interview stage.",
    resume: "ahmed_mansour_resume.pdf",
    jobId: "7",
    jobTitle: "Mobile App Developer",
    source: "website",
    priority: "low",
    tags: ["Junior Level", "Mobile"],
  },
  {
    id: "7",
    name: "Nour El-Din",
    email: "nour.eldin@email.com",
    phone: "+20 10 123 4567",
    position: "Data Scientist",
    location: "Cairo, Egypt",
    experience: "4 years",
    education: "PhD in Data Science - Cairo University",
    skills: ["Python", "R", "Machine Learning", "TensorFlow", "SQL"],
    status: "hr_interview",
    appliedDate: "2024-11-30",
    lastActivity: "6 hours ago",
    salary: "EGP 30,000",
    aiScore: 91,
    cvRating: 93,
    interview1Rating: 89,
    interview2Rating: 91,
    hrRating: 88,
    overallRating: 91,
    notes:
      "AI Analysis: Excellent match. Passed both AI interviews. Scheduled for HR interview.",
    resume: "nour_eldin_resume.pdf",
    jobId: "8",
    jobTitle: "Data Scientist",
    source: "linkedin",
    priority: "high",
    tags: ["PhD", "ML Expert", "Analytics"],
  },
  {
    id: "8",
    name: "Yusuf Al-Rashid",
    email: "yusuf.rashid@email.com",
    phone: "+971 56 444 7777",
    position: "Product Manager",
    location: "Abu Dhabi, UAE",
    experience: "7 years",
    education: "MBA - INSEAD, Bachelor's in Engineering",
    skills: ["Product Strategy", "Agile", "Data Analysis", "Leadership", "B2B"],
    status: "ai_analysis",
    appliedDate: "2024-12-03",
    lastActivity: "4 hours ago",
    salary: "AED 22,000",
    aiScore: 83,
    cvRating: 85,
    interview1Rating: 0,
    interview2Rating: 0,
    hrRating: 0,
    overallRating: 83,
    notes:
      "AI Analysis: Strong leadership profile. Currently undergoing initial AI analysis.",
    resume: "yusuf_rashid_resume.pdf",
    jobId: "5",
    jobTitle: "Product Manager",
    source: "referral",
    priority: "high",
    tags: ["MBA", "Leadership", "Healthcare"],
  },
];

const getStatusColor = (status: Candidate["status"]) => {
  switch (status) {
    case "ai_analysis":
      return "bg-gray-100 text-gray-800";
    case "ai_interview_1":
      return "bg-gray-100 text-gray-800";
    case "ai_interview_2":
      return "bg-gray-100 text-gray-800";
    case "hr_interview":
      return "bg-blue-100 text-blue-800";
    case "offer":
      return "bg-green-100 text-green-800";
    case "hired":
      return "bg-green-100 text-green-800";
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
      return "bg-gray-100 text-gray-800";
    case "low":
      return "bg-gray-100 text-gray-800";
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

export default function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      filterStatus === "all" || candidate.status === filterStatus;
    const matchesPosition =
      filterPosition === "all" || candidate.position === filterPosition;
    const matchesPriority =
      filterPriority === "all" || candidate.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPosition && matchesPriority;
  });

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSelectAll = () => {
    setSelectedCandidates(
      selectedCandidates.length === filteredCandidates.length
        ? []
        : filteredCandidates.map((c) => c.id)
    );
  };

  const statusCounts = {
    ai_analysis: candidates.filter((c) => c.status === "ai_analysis").length,
    ai_interview_1: candidates.filter((c) => c.status === "ai_interview_1")
      .length,
    ai_interview_2: candidates.filter((c) => c.status === "ai_interview_2")
      .length,
    hr_interview: candidates.filter((c) => c.status === "hr_interview").length,
    offer: candidates.filter((c) => c.status === "offer").length,
    hired: candidates.filter((c) => c.status === "hired").length,
    rejected: candidates.filter((c) => c.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Recruitment Pipeline"
        subtitle="Track and manage candidates through your AI-powered hiring process"
      />

      <div className="pt-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Action Buttons */}
          <div className="mb-8 flex justify-end">
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                Export Report
              </button>
              <button className="px-4 py-2 bg-[#0891b2] text-white rounded-lg hover:bg-[#0fc4b5] transition-colors font-medium">
                Add Candidate
              </button>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {statusCounts.ai_analysis}
                </div>
                <div className="text-sm text-gray-600 mb-2">AI Analysis</div>
                <div className="w-8 h-8 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {statusCounts.ai_interview_1}
                </div>
                <div className="text-sm text-gray-600 mb-2">AI Interview 1</div>
                <div className="w-8 h-8 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {statusCounts.ai_interview_2}
                </div>
                <div className="text-sm text-gray-600 mb-2">AI Interview 2</div>
                <div className="w-8 h-8 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-[#0891b2] mb-1">
                  {statusCounts.hr_interview}
                </div>
                <div className="text-sm text-gray-600 mb-2">HR Interview</div>
                <div className="w-8 h-8 mx-auto bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-[#0891b2]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {statusCounts.offer}
                </div>
                <div className="text-sm text-gray-600 mb-2">Offer Sent</div>
                <div className="w-8 h-8 mx-auto bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {statusCounts.hired}
                </div>
                <div className="text-sm text-gray-600 mb-2">Hired</div>
                <div className="w-8 h-8 mx-auto bg-green-100 rounded-lg flex items-center justify-center">
                  <UsersIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {statusCounts.rejected}
                </div>
                <div className="text-sm text-gray-600 mb-2">Rejected</div>
                <div className="w-8 h-8 mx-auto bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircleIcon className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Filter & Search
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search candidates by name, email, position, or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="ai_analysis">AI Analysis</option>
                    <option value="ai_interview_1">AI Interview 1</option>
                    <option value="ai_interview_2">AI Interview 2</option>
                    <option value="hr_interview">HR Interview</option>
                    <option value="offer">Offer Sent</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <select
                    value={filterPosition}
                    onChange={(e) => setFilterPosition(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent text-sm"
                  >
                    <option value="all">All Positions</option>
                    <option value="Senior Frontend Developer">
                      Senior Frontend Developer
                    </option>
                    <option value="React Developer">React Developer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="Full Stack Developer">
                      Full Stack Developer
                    </option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Mobile App Developer">
                      Mobile App Developer
                    </option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Product Manager">Product Manager</option>
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent text-sm"
                  >
                    <option value="all">All Priority</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div className="lg:col-span-1">
                  <button className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm">
                    <FunnelIcon className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedCandidates.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {selectedCandidates.length}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-blue-900">
                        {selectedCandidates.length} candidate
                        {selectedCandidates.length !== 1 ? "s" : ""} selected
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 text-sm bg-[#0891b2] text-white rounded-lg hover:bg-[#0fc4b5] transition-colors font-medium">
                        Advance Stage
                      </button>
                      <button className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium">
                        Send Offer
                      </button>
                      <button className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Data Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Candidates ({filteredCandidates.length})
                  </h2>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        selectedCandidates.length === filteredCandidates.length &&
                        filteredCandidates.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-[#0891b2] focus:ring-[#0891b2]"
                    />
                    <span className="text-sm text-gray-600">Select All</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Export
                  </button>
                  <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Print
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedCandidates.length === filteredCandidates.length &&
                          filteredCandidates.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-[#0891b2] focus:ring-[#0891b2]"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CV Score
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interview 1
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interview 2
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      HR Interview
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overall
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCandidates.map((candidate) => (
                    <tr
                      key={candidate.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.includes(candidate.id)}
                          onChange={() => handleSelectCandidate(candidate.id)}
                          className="rounded border-gray-300 text-[#0891b2] focus:ring-[#0891b2]"
                        />
                      </td>

                      {/* Candidate Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#0891b2] to-[#0fc4b5] rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {candidate.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {candidate.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {candidate.email}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {candidate.location}
                              </span>
                              <span className="text-lg">
                                {getSourceIcon(candidate.source)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {candidate.position}
                        </div>
                        <div className="text-sm text-gray-500">
                          {candidate.experience}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                              candidate.priority
                            )}`}
                          >
                            {candidate.priority}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            candidate.status
                          )}`}
                        >
                          {candidate.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* CV Score */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {candidate.cvRating}%
                        </span>
                      </td>

                      {/* Interview 1 */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {candidate.interview1Rating > 0 ? (
                          <span className="text-sm font-semibold text-gray-900">
                            {candidate.interview1Rating}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>

                      {/* Interview 2 */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {candidate.interview2Rating > 0 ? (
                          <span className="text-sm font-semibold text-gray-900">
                            {candidate.interview2Rating}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>

                      {/* HR Interview */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {candidate.hrRating > 0 ? (
                          <span className="text-sm font-semibold text-gray-900">
                            {candidate.hrRating}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>

                      {/* Overall */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {candidate.overallRating}%
                        </span>
                      </td>

                      {/* Applied Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">
                          {candidate.appliedDate}
                        </div>
                        <div className="text-sm text-gray-500">
                          {candidate.lastActivity}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/dashboard/candidates/${candidate.id}`}
                            className="text-[#0891b2] hover:text-[#0fc4b5] font-medium text-sm"
                          >
                            View
                          </Link>
                          <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                            Advance
                          </button>
                          <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
