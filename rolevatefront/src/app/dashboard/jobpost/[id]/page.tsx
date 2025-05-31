"use client";

import React, { useState } from "react";
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
} from "@heroicons/react/24/outline";

type JobPostStatus = "active" | "paused" | "draft" | "completed";
type AgentStatus = "active" | "inactive" | "configuring";

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
  const [activeTab, setActiveTab] = useState<"overview" | "agents" | "candidates">("overview");
  const [selectedAgent, setSelectedAgent] = useState<"cvAnalysis" | "interview" | "whatsapp" | null>(null);

  // Mock data for the specific job post
  const jobPost: JobPost = {
    id: params.id as string,
    title: "Senior Relationship Manager",
    department: "Corporate Banking",
    location: "Dubai, UAE",
    type: "full-time",
    status: "active",
    applicants: 127,
    createdBy: "Al-hussein Abdullah",
    createdAt: "May 18, 2025, 2:34 AM",
    description: "We are seeking an experienced Senior Relationship Manager to join our Corporate Banking division. The successful candidate will manage high-value corporate clients and develop strategic banking relationships.",
    requirements: [
      "Bachelor's degree in Finance, Business, or related field",
      "5+ years experience in corporate banking",
      "Strong relationship management skills",
      "Fluency in Arabic and English",
      "Knowledge of Islamic banking principles preferred"
    ],
    benefits: [
      "Competitive salary package",
      "Health insurance",
      "Annual bonus based on performance",
      "Professional development opportunities",
      "Flexible working arrangements"
    ],
    salary: "AED 15,000 - 25,000",
    agents: {
      cvAnalysis: {
        id: "cv-agent-1",
        name: "Banking CV Analyzer",
        status: "active",
        systemPrompt: "You are an expert banking recruitment specialist. Analyze CVs for corporate banking positions, focusing on relevant experience, educational background, and banking industry knowledge. Score candidates based on their fit for relationship management roles in the MENA region.",
        settings: {
          minimumScore: 70,
          requiredSkills: ["Corporate Banking", "Relationship Management", "Financial Analysis", "Arabic Language"],
          experienceThreshold: 5,
          languageRequirements: ["Arabic", "English"]
        },
        metrics: {
          cvsProcessed: 342,
          averageScore: 68,
          passRate: 37
        }
      },
      interview: {
        id: "interview-agent-1",
        name: "Laila Banking Interview AI",
        status: "active",
        systemPrompt: "You are Laila, a professional banking interview specialist. Conduct comprehensive interviews for Senior Relationship Manager positions. Focus on relationship building skills, banking knowledge, client management experience, and cultural fit. Adapt between Arabic and English as needed. Maintain a warm yet professional demeanor throughout.",
        settings: {
          interviewDuration: 45,
          languages: ["Arabic", "English"],
          questionTypes: ["Behavioral", "Technical", "Situational", "Cultural Fit"],
          difficultyLevel: "senior"
        },
        metrics: {
          interviewsConducted: 89,
          averageRating: 7.4,
          completionRate: 94
        }
      },
      whatsapp: {
        id: "whatsapp-agent-1",
        name: "WhatsApp Banking Communicator",
        status: "active",
        systemPrompt: "You are a professional banking recruitment assistant communicating via WhatsApp. Maintain formal yet friendly communication suitable for banking professionals. Guide candidates through the recruitment process, schedule interviews, and provide updates. Use appropriate Arabic or English based on candidate preference.",
        settings: {
          responseDelay: 5,
          workingHours: { start: "08:00", end: "18:00" },
          messageTemplates: [
            "Interview Invitation",
            "Document Request",
            "Interview Reminder",
            "Result Notification"
          ],
          autoReminders: true
        },
        metrics: {
          messagesSent: 456,
          responseRate: 78,
          engagementRate: 82
        }
      }
    }
  };

  const getStatusBadge = (status: JobPostStatus | AgentStatus) => {
    const statusConfig = {
      active: { color: "bg-green-500/20 text-green-400 border-green-500/30", text: "Active" },
      paused: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", text: "Paused" },
      draft: { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", text: "Draft" },
      completed: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", text: "Completed" },
      inactive: { color: "bg-red-500/20 text-red-400 border-red-500/30", text: "Inactive" },
      configuring: { color: "bg-orange-500/20 text-orange-400 border-orange-500/30", text: "Configuring" },
    };
    
    const config = statusConfig[status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const toggleAgentStatus = (agentType: "cvAnalysis" | "interview" | "whatsapp") => {
    // Implementation for toggling agent status
    console.log(`Toggling ${agentType} agent status`);
  };

  const AgentCard = ({ agentType, agent, icon: Icon }: { 
    agentType: "cvAnalysis" | "interview" | "whatsapp", 
    agent: any, 
    icon: any 
  }) => (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00C6AD]/20 rounded-lg">
            <Icon className="h-6 w-6 text-[#00C6AD]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">{agent.name}</h3>
            <p className="text-gray-400 text-sm">{agent.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(agent.status)}
          <button
            onClick={() => toggleAgentStatus(agentType)}
            className={`p-2 rounded-lg transition-colors ${
              agent.status === 'active' 
                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            }`}
          >
            {agent.status === 'active' ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setSelectedAgent(agentType)}
            className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <CogIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Agent Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {agentType === 'cvAnalysis' && (
          <>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{agent.metrics.cvsProcessed}</p>
              <p className="text-gray-400 text-xs">CVs Processed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{agent.metrics.averageScore}</p>
              <p className="text-gray-400 text-xs">Avg Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{agent.metrics.passRate}%</p>
              <p className="text-gray-400 text-xs">Pass Rate</p>
            </div>
          </>
        )}
        {agentType === 'interview' && (
          <>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{agent.metrics.interviewsConducted}</p>
              <p className="text-gray-400 text-xs">Interviews</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{agent.metrics.averageRating}</p>
              <p className="text-gray-400 text-xs">Avg Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{agent.metrics.completionRate}%</p>
              <p className="text-gray-400 text-xs">Completion</p>
            </div>
          </>
        )}
        {agentType === 'whatsapp' && (
          <>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{agent.metrics.messagesSent}</p>
              <p className="text-gray-400 text-xs">Messages</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{agent.metrics.responseRate}%</p>
              <p className="text-gray-400 text-xs">Response Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{agent.metrics.engagementRate}%</p>
              <p className="text-gray-400 text-xs">Engagement</p>
            </div>
          </>
        )}
      </div>

      {/* System Prompt Preview */}
      <div className="bg-gray-900 rounded-lg p-4">
        <p className="text-gray-400 text-sm font-medium mb-2">System Prompt:</p>
        <p className="text-gray-300 text-sm line-clamp-3">{agent.systemPrompt}</p>
        <button
          onClick={() => setSelectedAgent(agentType)}
          className="mt-2 text-[#00C6AD] text-sm hover:underline"
        >
          View & Edit Full Prompt
        </button>
      </div>
    </div>
  );

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
              <p className="text-gray-400">{jobPost.department} • {jobPost.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(jobPost.status)}
            <button className="bg-[#00C6AD] hover:bg-[#14B8A6] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <PencilIcon className="h-4 w-4" />
              Edit Job
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
          {[
            { id: "overview", label: "Overview" },
            { id: "agents", label: "AI Agents" },
            { id: "candidates", label: "Candidates" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#00C6AD] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
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
                <h2 className="text-xl font-semibold text-white mb-4">Job Description</h2>
                <p className="text-gray-300 mb-6">{jobPost.description}</p>
                
                <h3 className="text-lg font-semibold text-white mb-3">Requirements</h3>
                <ul className="space-y-2 mb-6">
                  {jobPost.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <CheckCircleIcon className="h-5 w-5 text-[#00C6AD] mt-0.5 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>

                <h3 className="text-lg font-semibold text-white mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {jobPost.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
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
                <h3 className="text-lg font-semibold text-white mb-4">Job Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Applicants</span>
                    <span className="text-white font-semibold">{jobPost.applicants}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Salary Range</span>
                    <span className="text-white font-semibold">{jobPost.salary}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Created By</span>
                    <span className="text-white font-semibold">{jobPost.createdBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white font-semibold">{jobPost.createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">AI Agent Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">CV Analysis</span>
                    <div className={`w-3 h-3 rounded-full ${jobPost.agents.cvAnalysis.status === 'active' ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Interview AI</span>
                    <div className={`w-3 h-3 rounded-full ${jobPost.agents.interview.status === 'active' ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">WhatsApp</span>
                    <div className={`w-3 h-3 rounded-full ${jobPost.agents.whatsapp.status === 'active' ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "agents" && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">AI Agent Management</h2>
              <p className="text-gray-400">Configure and monitor your recruitment automation agents</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AgentCard
                agentType="cvAnalysis"
                agent={jobPost.agents.cvAnalysis}
                icon={DocumentTextIcon}
              />
              <AgentCard
                agentType="interview"
                agent={jobPost.agents.interview}
                icon={ChatBubbleLeftRightIcon}
              />
              <AgentCard
                agentType="whatsapp"
                agent={jobPost.agents.whatsapp}
                icon={DevicePhoneMobileIcon}
              />
            </div>
          </div>
        )}

        {activeTab === "candidates" && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Candidate Pipeline</h2>
            <p className="text-gray-400">Candidate management interface coming soon...</p>
          </div>
        )}
      </div>

      {/* Agent Configuration Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  Configure {jobPost.agents[selectedAgent].name}
                </h3>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-white font-medium mb-2">System Prompt</label>
                <textarea
                  className="w-full h-40 bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-300 resize-none focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD]"
                  defaultValue={jobPost.agents[selectedAgent].systemPrompt}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Settings based on agent type */}
                {selectedAgent === 'cvAnalysis' && (
                  <>
                    <div>
                      <label className="block text-white font-medium mb-2">Minimum Score</label>
                      <input
                        type="number"
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-300 focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD]"
                        defaultValue={jobPost.agents.cvAnalysis.settings.minimumScore}
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Experience Threshold (years)</label>
                      <input
                        type="number"
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-300 focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD]"
                        defaultValue={jobPost.agents.cvAnalysis.settings.experienceThreshold}
                      />
                    </div>
                  </>
                )}
                
                {selectedAgent === 'interview' && (
                  <>
                    <div>
                      <label className="block text-white font-medium mb-2">Interview Duration (minutes)</label>
                      <input
                        type="number"
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-300 focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD]"
                        defaultValue={jobPost.agents.interview.settings.interviewDuration}
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Difficulty Level</label>
                      <select
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-300 focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD]"
                        defaultValue={jobPost.agents.interview.settings.difficultyLevel}
                      >
                        <option value="junior">Junior</option>
                        <option value="mid">Mid-level</option>
                        <option value="senior">Senior</option>
                      </select>
                    </div>
                  </>
                )}
                
                {selectedAgent === 'whatsapp' && (
                  <>
                    <div>
                      <label className="block text-white font-medium mb-2">Response Delay (minutes)</label>
                      <input
                        type="number"
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-300 focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD]"
                        defaultValue={jobPost.agents.whatsapp.settings.responseDelay}
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Auto Reminders</label>
                      <select
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-300 focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD]"
                        defaultValue={jobPost.agents.whatsapp.settings.autoReminders ? "true" : "false"}
                      >
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="px-4 py-2 bg-[#00C6AD] text-white rounded-lg hover:bg-[#14B8A6] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPostDetail;
