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
} from "@heroicons/react/24/outline";

type JobPostStatus = "active" | "paused" | "draft" | "completed";
type AgentStatus = "active" | "inactive" | "configuring";
type CandidateStatus = "applied" | "cv_review" | "interview_scheduled" | "interviewed" | "shortlisted" | "rejected" | "hired";

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
  const [activeTab, setActiveTab] = useState<"overview" | "agents" | "candidates" | "analytics">("overview");
  const [selectedAgent, setSelectedAgent] = useState<"cvAnalysis" | "interview" | "whatsapp" | null>(null);
  const [candidateFilter, setCandidateFilter] = useState<CandidateStatus | "all">("all");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [notifications, setNotifications] = useState<Array<{id: string, type: 'success' | 'warning' | 'error', message: string}>>([]);
  const [showPromptGenerator, setShowPromptGenerator] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'hr' | 'ai', message: string, timestamp: Date}>>([]);
  const [currentInput, setCurrentInput] = useState("");

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
    candidates: [
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
        skills: ["Corporate Banking", "Relationship Management", "Arabic", "English"],
        notes: "Strong candidate with excellent banking background"
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
        notes: "Good potential, needs skills assessment"
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
        skills: ["Corporate Banking", "Risk Management", "Leadership", "Arabic", "English"],
        notes: "Excellent candidate, ready for final interview"
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
        notes: "Interview scheduled for next week"
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
        notes: "Insufficient experience for senior role"
      }
    ],
    analytics: {
      views: 1247,
      applications: 127,
      cvScreeningPass: 89,
      interviewInvitations: 34,
      offers: 3,
      conversionRate: 2.4,
      avgTimeToHire: 18
    },
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
    addNotification('success', `${agentType} agent status updated successfully`);
  };

  const addNotification = (type: 'success' | 'warning' | 'error', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const getCandidateStatusBadge = (status: CandidateStatus) => {
    const statusConfig = {
      applied: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", text: "Applied" },
      cv_review: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", text: "CV Review" },
      interview_scheduled: { color: "bg-purple-500/20 text-purple-400 border-purple-500/30", text: "Interview Scheduled" },
      interviewed: { color: "bg-orange-500/20 text-orange-400 border-orange-500/30", text: "Interviewed" },
      shortlisted: { color: "bg-green-500/20 text-green-400 border-green-500/30", text: "Shortlisted" },
      rejected: { color: "bg-red-500/20 text-red-400 border-red-500/30", text: "Rejected" },
      hired: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", text: "Hired" },
    };
    
    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const filteredCandidates = jobPost.candidates.filter(candidate => {
    const matchesFilter = candidateFilter === "all" || candidate.status === candidateFilter;
    const matchesSearch = candidate.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(candidateSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCandidateSelect = (candidateId: string, selected: boolean) => {
    if (selected) {
      setSelectedCandidates(prev => [...prev, candidateId]);
    } else {
      setSelectedCandidates(prev => prev.filter(id => id !== candidateId));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action ${action} for candidates:`, selectedCandidates);
    addNotification('success', `${action} applied to ${selectedCandidates.length} candidates`);
    setSelectedCandidates([]);
    setShowBulkActions(false);
  };

  // Auto-show bulk actions when candidates are selected
  useEffect(() => {
    setShowBulkActions(selectedCandidates.length > 0);
  }, [selectedCandidates]);

  const startPromptGeneration = () => {
    setShowPromptGenerator(true);
    setConversationHistory([{
      role: 'ai',
      message: `Hello! I'm here to help you create the perfect AI prompts for your "${jobPost.title}" position. I'll ask you some questions about your requirements and expectations, then generate customized system prompts for your CV Analysis, Interview, and WhatsApp agents. Let's start!\n\nCan you tell me what specific qualities and skills are most important for this role?`,
      timestamp: new Date()
    }]);
  };

  const handlePromptConversation = (message: string) => {
    // Add HR message
    setConversationHistory(prev => [...prev, {
      role: 'hr',
      message,
      timestamp: new Date()
    }]);

    // Simulate AI response (in real implementation, this would be an API call)
    setTimeout(() => {
      const aiResponses = [
        "That's very helpful! Now, what level of experience are you looking for? Are there any specific certifications or educational requirements?",
        "Excellent insights! For the interview process, what type of questions do you think would best assess these candidates? Should we focus more on technical knowledge, soft skills, or cultural fit?",
        "Perfect! For WhatsApp communication, what tone would you prefer? Should it be more formal given the banking context, or would you like a balance of professional yet approachable?",
        "Great! Based on our conversation, I'll now generate optimized prompts for your three AI agents. These will reflect the specific requirements and tone you've outlined."
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      setConversationHistory(prev => [...prev, {
        role: 'ai',
        message: randomResponse,
        timestamp: new Date()
      }]);
    }, 1500);
  };

  const generatePrompts = () => {
    // Simulate prompt generation based on conversation
    addNotification('success', 'AI prompts generated successfully based on your conversation!');
    setShowPromptGenerator(false);
    
    // In real implementation, this would update the actual agent prompts
    console.log('Generated prompts based on conversation:', conversationHistory);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      addNotification('success', 'Voice recording started');
      // In real implementation, start voice recording
    } else {
      addNotification('success', 'Voice recording stopped and transcribed');
      // In real implementation, stop recording and transcribe
      handlePromptConversation("This is a sample transcribed message from voice input.");
    }
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
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-400 text-sm font-medium">System Prompt:</p>
          <div className="flex items-center gap-1 text-xs text-[#00C6AD] bg-[#00C6AD]/10 px-2 py-1 rounded">
            <SparklesIcon className="h-3 w-3" />
            <span>AI Generated</span>
          </div>
        </div>
        <p className="text-gray-300 text-sm line-clamp-3">{agent.systemPrompt}</p>
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => setSelectedAgent(agentType)}
            className="text-[#00C6AD] text-sm hover:underline"
          >
            View & Edit Full Prompt
          </button>
          <button
            onClick={() => setShowPromptGenerator(true)}
            className="text-xs text-gray-400 hover:text-[#00C6AD] flex items-center gap-1"
          >
            <SparklesIcon className="h-3 w-3" />
            Regenerate
          </button>
        </div>
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
            <button 
              onClick={() => addNotification('success', 'Job post shared successfully')}
              className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              title="Share Job Post"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
            <button 
              onClick={() => addNotification('success', 'Job post duplicated')}
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

            {/* Prompt Generator Feature */}
            <div className="bg-gradient-to-r from-[#00C6AD]/10 to-blue-600/10 border border-[#00C6AD]/30 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#00C6AD]/20 rounded-lg">
                    <SparklesIcon className="h-8 w-8 text-[#00C6AD]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">AI Prompt Generator</h3>
                    <p className="text-gray-300">Let our AI interview you to create perfect prompts for your agents</p>
                  </div>
                </div>
                <button
                  onClick={startPromptGeneration}
                  className="bg-[#00C6AD] hover:bg-[#14B8A6] text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium"
                >
                  <SparklesIcon className="h-5 w-5" />
                  Generate AI Prompts
                </button>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircleIcon className="h-4 w-4 text-[#00C6AD]" />
                  <span>Conversational interview process</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircleIcon className="h-4 w-4 text-[#00C6AD]" />
                  <span>Voice or text input supported</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircleIcon className="h-4 w-4 text-[#00C6AD]" />
                  <span>Optimized for banking industry</span>
                </div>
              </div>
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
          <div className="space-y-6">
            {/* Bulk Actions Bar */}
            {showBulkActions && (
              <div className="bg-[#00C6AD]/10 border border-[#00C6AD]/30 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-[#00C6AD] font-medium">
                    {selectedCandidates.length} candidate(s) selected
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleBulkAction('Schedule Interview')}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Schedule Interview
                    </button>
                    <button 
                      onClick={() => handleBulkAction('Send Message')}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Send Message
                    </button>
                    <button 
                      onClick={() => handleBulkAction('Reject')}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCandidates([])}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Filters and Search */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD]"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={candidateFilter}
                    onChange={(e) => setCandidateFilter(e.target.value as CandidateStatus | "all")}
                    className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD]"
                  >
                    <option value="all">All Status</option>
                    <option value="applied">Applied</option>
                    <option value="cv_review">CV Review</option>
                    <option value="interview_scheduled">Interview Scheduled</option>
                    <option value="interviewed">Interviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                  </select>
                  <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2">
                    <FunnelIcon className="h-4 w-4" />
                    More Filters
                  </button>
                </div>
              </div>

              {/* Candidates List */}
              <div className="space-y-4">
                {filteredCandidates.map((candidate) => (
                  <div key={candidate.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={(e) => handleCandidateSelect(candidate.id, e.target.checked)}
                        className="w-4 h-4 text-[#00C6AD] bg-gray-800 border-gray-600 rounded focus:ring-[#00C6AD] focus:ring-2"
                      />
                      <div className="w-12 h-12 bg-[#00C6AD]/20 rounded-full flex items-center justify-center">
                        <span className="text-[#00C6AD] font-semibold text-lg">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-white font-semibold">{candidate.name}</h3>
                            <p className="text-gray-400 text-sm">{candidate.email}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {getCandidateStatusBadge(candidate.status)}
                            <div className="flex items-center gap-1">
                              <StarIcon className="h-4 w-4 text-yellow-400" />
                              <span className="text-white font-medium">{candidate.cvScore}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Experience:</span>
                            <span className="text-white ml-1">{candidate.experience} years</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Location:</span>
                            <span className="text-white ml-1">{candidate.location}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Applied:</span>
                            <span className="text-white ml-1">{candidate.appliedAt}</span>
                          </div>
                          {candidate.interviewRating && (
                            <div>
                              <span className="text-gray-400">Interview:</span>
                              <span className="text-white ml-1">{candidate.interviewRating}/10</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {candidate.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                        {candidate.notes && (
                          <p className="text-gray-400 text-sm mt-2 italic">{candidate.notes}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button className="p-2 bg-[#00C6AD] text-white rounded hover:bg-[#14B8A6] transition-colors">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">
                          <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCandidates.length === 0 && (
                <div className="text-center py-12">
                  <UserGroupIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No candidates found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Job Views</p>
                    <p className="text-2xl font-bold text-white">{jobPost.analytics.views.toLocaleString()}</p>
                    <p className="text-green-400 text-sm">+12% from last week</p>
                  </div>
                  <EyeIcon className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Applications</p>
                    <p className="text-2xl font-bold text-white">{jobPost.analytics.applications}</p>
                    <p className="text-green-400 text-sm">+8% from last week</p>
                  </div>
                  <DocumentTextIcon className="h-8 w-8 text-[#00C6AD]" />
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Conversion Rate</p>
                    <p className="text-2xl font-bold text-white">{jobPost.analytics.conversionRate}%</p>
                    <p className="text-yellow-400 text-sm">-2% from last week</p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg. Time to Hire</p>
                    <p className="text-2xl font-bold text-white">{jobPost.analytics.avgTimeToHire} days</p>
                    <p className="text-green-400 text-sm">-3 days faster</p>
                  </div>
                  <ClockIcon className="h-8 w-8 text-green-400" />
                </div>
              </div>
            </div>

            {/* Recruitment Funnel */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Recruitment Funnel</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-32 text-gray-400 text-sm">Job Views</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{width: '100%'}}></div>
                  </div>
                  <div className="w-16 text-white text-sm font-medium">{jobPost.analytics.views}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-gray-400 text-sm">Applications</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <div className="bg-[#00C6AD] h-3 rounded-full" style={{width: `${(jobPost.analytics.applications / jobPost.analytics.views) * 100}%`}}></div>
                  </div>
                  <div className="w-16 text-white text-sm font-medium">{jobPost.analytics.applications}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-gray-400 text-sm">CV Screening</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <div className="bg-yellow-500 h-3 rounded-full" style={{width: `${(jobPost.analytics.cvScreeningPass / jobPost.analytics.views) * 100}%`}}></div>
                  </div>
                  <div className="w-16 text-white text-sm font-medium">{jobPost.analytics.cvScreeningPass}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-gray-400 text-sm">Interviews</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <div className="bg-orange-500 h-3 rounded-full" style={{width: `${(jobPost.analytics.interviewInvitations / jobPost.analytics.views) * 100}%`}}></div>
                  </div>
                  <div className="w-16 text-white text-sm font-medium">{jobPost.analytics.interviewInvitations}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-gray-400 text-sm">Offers</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{width: `${(jobPost.analytics.offers / jobPost.analytics.views) * 100}%`}}></div>
                  </div>
                  <div className="w-16 text-white text-sm font-medium">{jobPost.analytics.offers}</div>
                </div>
              </div>
            </div>

            {/* AI Agent Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5 text-[#00C6AD]" />
                  CV Analysis Performance
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">CVs Processed</span>
                    <span className="text-white font-medium">{jobPost.agents.cvAnalysis.metrics.cvsProcessed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Score</span>
                    <span className="text-white font-medium">{jobPost.agents.cvAnalysis.metrics.averageScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pass Rate</span>
                    <span className="text-white font-medium">{jobPost.agents.cvAnalysis.metrics.passRate}%</span>
                  </div>
                  <div className="mt-4 bg-gray-700 rounded-full h-2">
                    <div className="bg-[#00C6AD] h-2 rounded-full" style={{width: `${jobPost.agents.cvAnalysis.metrics.passRate}%`}}></div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-[#00C6AD]" />
                  Interview AI Performance
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Interviews Conducted</span>
                    <span className="text-white font-medium">{jobPost.agents.interview.metrics.interviewsConducted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Rating</span>
                    <span className="text-white font-medium">{jobPost.agents.interview.metrics.averageRating}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completion Rate</span>
                    <span className="text-white font-medium">{jobPost.agents.interview.metrics.completionRate}%</span>
                  </div>
                  <div className="mt-4 bg-gray-700 rounded-full h-2">
                    <div className="bg-[#00C6AD] h-2 rounded-full" style={{width: `${jobPost.agents.interview.metrics.completionRate}%`}}></div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <DevicePhoneMobileIcon className="h-5 w-5 text-[#00C6AD]" />
                  WhatsApp Performance
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Messages Sent</span>
                    <span className="text-white font-medium">{jobPost.agents.whatsapp.metrics.messagesSent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Response Rate</span>
                    <span className="text-white font-medium">{jobPost.agents.whatsapp.metrics.responseRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Engagement Rate</span>
                    <span className="text-white font-medium">{jobPost.agents.whatsapp.metrics.engagementRate}%</span>
                  </div>
                  <div className="mt-4 bg-gray-700 rounded-full h-2">
                    <div className="bg-[#00C6AD] h-2 rounded-full" style={{width: `${jobPost.agents.whatsapp.metrics.engagementRate}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 min-w-80 ${
              notification.type === 'success' ? 'bg-green-900 border-green-700 text-green-100' :
              notification.type === 'warning' ? 'bg-yellow-900 border-yellow-700 text-yellow-100' :
              'bg-red-900 border-red-700 text-red-100'
            }`}
          >
            {notification.type === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-400" />}
            {notification.type === 'warning' && <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />}
            {notification.type === 'error' && <XMarkIcon className="h-5 w-5 text-red-400" />}
            <span className="flex-1">{notification.message}</span>
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              className="text-gray-400 hover:text-white"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* AI Prompt Generator Modal */}
      {showPromptGenerator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#00C6AD]/20 rounded-lg">
                    <SparklesIcon className="h-6 w-6 text-[#00C6AD]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">AI Prompt Generator</h3>
                    <p className="text-gray-400">Creating optimized prompts for {jobPost.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPromptGenerator(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Conversation Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4 mb-6">
                {conversationHistory.map((entry, index) => (
                  <div key={index} className={`flex gap-3 ${entry.role === 'hr' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      entry.role === 'hr' 
                        ? 'bg-[#00C6AD] text-white' 
                        : 'bg-gray-700 text-gray-100'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {entry.role === 'ai' && <SparklesIcon className="h-4 w-4 text-[#00C6AD]" />}
                        <span className="text-xs font-medium">
                          {entry.role === 'hr' ? 'HR Manager' : 'Rolevate AI'}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{entry.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {entry.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-gray-700">
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && currentInput.trim()) {
                          handlePromptConversation(currentInput);
                          setCurrentInput('');
                        }
                      }}
                      placeholder="Type your response or use voice input..."
                      className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD]"
                    />
                    <button
                      onClick={toggleRecording}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        isRecording 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      title={isRecording ? 'Stop Recording' : 'Start Voice Input'}
                    >
                      {isRecording ? <StopIcon className="h-5 w-5" /> : <MicrophoneIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (currentInput.trim()) {
                      handlePromptConversation(currentInput);
                      setCurrentInput('');
                    }
                  }}
                  disabled={!currentInput.trim()}
                  className="bg-[#00C6AD] hover:bg-[#14B8A6] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Send
                </button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-400">
                  {conversationHistory.length > 2 && (
                    <span>Ready to generate prompts when you are!</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPromptGenerator(false)}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  {conversationHistory.length > 2 && (
                    <button
                      onClick={generatePrompts}
                      className="px-4 py-2 bg-[#00C6AD] text-white rounded-lg hover:bg-[#14B8A6] transition-colors flex items-center gap-2"
                    >
                      <SparklesIcon className="h-4 w-4" />
                      Generate Prompts
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
