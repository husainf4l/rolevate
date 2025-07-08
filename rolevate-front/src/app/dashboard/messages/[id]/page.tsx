"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/dashboard/Header";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  VideoCameraIcon,
  PaperAirplaneIcon,
  UserIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  PencilIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface CommunicationRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  type: "email" | "whatsapp" | "call" | "video" | "sms" | "linkedin";
  direction: "inbound" | "outbound";
  subject?: string;
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read" | "replied" | "failed";
  hrUser: string;
  attachments?: string[];
  duration?: number;
  tags?: string[];
  priority: "high" | "medium" | "low";
  relatedJobId: string;
  followUp?: string;
}

// Demo data - In a real app, this would come from an API
const communicationHistory: CommunicationRecord[] = [
  {
    id: "1",
    candidateId: "1",
    candidateName: "Sarah Al-Ahmad",
    candidateEmail: "sarah.ahmad@email.com",
    position: "Senior Frontend Developer",
    type: "email",
    direction: "outbound",
    subject: "Interview Invitation - Senior Frontend Developer Position",
    content:
      "Dear Sarah,\n\nWe are pleased to invite you for an interview for the Senior Frontend Developer position at Rolevate.\n\nYour profile shows excellent qualifications and experience that align perfectly with our requirements. We were particularly impressed by your React expertise and portfolio of projects.\n\nInterview Details:\n- Date: December 10, 2024\n- Time: 2:00 PM - 3:00 PM\n- Location: Virtual (Teams link will be provided)\n- Duration: 60 minutes\n\nThe interview will consist of:\n1. Technical discussion (30 mins)\n2. Code review session (20 mins)\n3. Cultural fit assessment (10 mins)\n\nPlease confirm your availability by replying to this email by December 9, 2024.\n\nWe look forward to speaking with you!\n\nBest regards,\nEmma Johnson\nSenior HR Manager\nRolevate Technologies",
    timestamp: "2024-12-08 10:30",
    status: "read",
    hrUser: "Emma Johnson",
    attachments: ["interview_details.pdf", "company_overview.pdf"],
    tags: ["interview", "invitation", "frontend"],
    priority: "high",
    relatedJobId: "1",
    followUp: "2024-12-10 14:00",
  },
  {
    id: "2",
    candidateId: "1",
    candidateName: "Sarah Al-Ahmad",
    candidateEmail: "sarah.ahmad@email.com",
    position: "Senior Frontend Developer",
    type: "whatsapp",
    direction: "inbound",
    content:
      "Hi Emma, thank you for the interview invitation. I'm available for the scheduled time and very excited about the opportunity. I've reviewed the company overview and I'm impressed with Rolevate's mission and technology stack. Looking forward to discussing how I can contribute to the team!",
    timestamp: "2024-12-08 14:15",
    status: "delivered",
    hrUser: "Emma Johnson",
    tags: ["response", "confirmation", "positive"],
    priority: "medium",
    relatedJobId: "1",
  },
  // Add more demo data as needed
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "email":
      return <EnvelopeIcon className="w-6 h-6" />;
    case "whatsapp":
      return <ChatBubbleLeftRightIcon className="w-6 h-6" />;
    case "call":
      return <PhoneIcon className="w-6 h-6" />;
    case "video":
      return <VideoCameraIcon className="w-6 h-6" />;
    case "sms":
      return <ChatBubbleLeftRightIcon className="w-6 h-6" />;
    case "linkedin":
      return <UserIcon className="w-6 h-6" />;
    default:
      return <ChatBubbleLeftRightIcon className="w-6 h-6" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "email":
      return "bg-blue-100 text-blue-800";
    case "whatsapp":
      return "bg-green-100 text-green-800";
    case "call":
      return "bg-purple-100 text-purple-800";
    case "video":
      return "bg-red-100 text-red-800";
    case "sms":
      return "bg-yellow-100 text-yellow-800";
    case "linkedin":
      return "bg-indigo-100 text-indigo-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "sent":
      return <PaperAirplaneIcon className="w-4 h-4 text-gray-500" />;
    case "delivered":
      return <CheckIcon className="w-4 h-4 text-blue-500" />;
    case "read":
      return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    case "replied":
      return <ChatBubbleLeftRightIcon className="w-4 h-4 text-[#0891b2]" />;
    case "failed":
      return <XMarkIcon className="w-4 h-4 text-red-500" />;
    default:
      return <ClockIcon className="w-4 h-4 text-gray-400" />;
  }
};

const getPriorityColor = (priority: string) => {
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

export default function MessageDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const messageId = params.id as string;

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyType, setReplyType] = useState<
    "email" | "whatsapp" | "call" | "video" | "sms" | "linkedin"
  >("email");
  const [replySubject, setReplySubject] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyPriority, setReplyPriority] = useState<"high" | "medium" | "low">(
    "medium"
  );

  // Find the message by ID
  const message = communicationHistory.find((m) => m.id === messageId);

  if (!message) {
    return (
      <div className="min-h-screen">
        <Header
          title="Message Not Found"
          subtitle="The requested message could not be found"
        />
        <div className="pt-20 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Message Not Found
              </h3>
              <p className="text-gray-600 mb-6">
                The message you're looking for doesn't exist or has been
                deleted.
              </p>
              <Link
                href="/dashboard/messages"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white rounded-lg hover:bg-[#0fc4b5] transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Messages
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleSendReply = () => {
    // In a real app, this would send the reply via API
    console.log("Sending reply:", {
      type: replyType,
      subject: replySubject,
      content: replyContent,
      priority: replyPriority,
      candidateId: message.candidateId,
    });

    // Reset form
    setReplySubject("");
    setReplyContent("");
    setShowReplyForm(false);

    // Show success message (you might want to add a toast notification here)
    alert("Reply sent successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Message Details"
        subtitle={`Communication with ${message.candidateName}`}
      />

      <div className="pt-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/dashboard/messages"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Messages
            </Link>
          </div>

          {/* Message Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${getTypeColor(
                      message.type
                    )}`}
                  >
                    {getTypeIcon(message.type)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-xl font-bold text-gray-900">
                      {message.type.charAt(0).toUpperCase() +
                        message.type.slice(1)}{" "}
                      Communication
                    </h1>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                          message.priority
                        )}`}
                      >
                        {message.priority} priority
                      </span>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(message.status)}
                        <span className="text-sm text-gray-500 capitalize">
                          {message.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>
                      {message.direction === "inbound"
                        ? "Received from"
                        : "Sent to"}
                      : {message.candidateName}
                    </span>
                    <span>•</span>
                    <span>{formatTimestamp(message.timestamp)}</span>
                    <span>•</span>
                    <span>By: {message.hrUser}</span>
                  </div>
                  {message.duration && (
                    <div className="text-sm text-gray-600 mb-3">
                      Duration: {message.duration} minutes
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Candidate Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <p className="text-gray-900">{message.candidateName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <p className="text-gray-900">{message.candidateEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position Applied
                  </label>
                  <p className="text-gray-900">{message.position}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Related Job ID
                  </label>
                  <p className="text-gray-900">{message.relatedJobId}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  href={`/dashboard/candidates/${message.candidateId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-[#0891b2] hover:text-[#0fc4b5] border border-[#0891b2] hover:border-[#0fc4b5] rounded-lg font-medium transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  View Full Candidate Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {message.type === "call" || message.type === "video"
                  ? "Call Summary"
                  : "Message Content"}
              </h2>

              {message.subject && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 font-medium">
                      {message.subject}
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {message.type === "call" || message.type === "video"
                    ? "Summary"
                    : "Content"}
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments
                  </label>
                  <div className="space-y-2">
                    {message.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <DocumentTextIcon className="w-5 h-5 text-gray-500" />
                          <span className="text-sm text-gray-900">
                            {attachment}
                          </span>
                        </div>
                        <button className="text-[#0891b2] hover:text-[#0fc4b5] text-sm font-medium transition-colors">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {message.tags && message.tags.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {message.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up */}
              {message.followUp && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Reminder
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <CalendarDaysIcon className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Scheduled for: {message.followUp}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white rounded-lg hover:bg-[#0fc4b5] transition-colors font-medium"
                  >
                    <PencilIcon className="w-4 h-4" />
                    {showReplyForm ? "Cancel Reply" : "Reply"}
                  </button>
                  <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    <PlusIcon className="w-4 h-4" />
                    New Communication
                  </button>
                </div>
              </div>

              {/* Reply Form */}
              {showReplyForm && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Communication Type
                        </label>
                        <select
                          value={replyType}
                          onChange={(e) => setReplyType(e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent"
                        >
                          <option value="email">Email</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="call">Phone Call</option>
                          <option value="video">Video Call</option>
                          <option value="sms">SMS</option>
                          <option value="linkedin">LinkedIn</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <select
                          value={replyPriority}
                          onChange={(e) =>
                            setReplyPriority(e.target.value as any)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    {replyType === "email" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={replySubject}
                          onChange={(e) => setReplySubject(e.target.value)}
                          placeholder="Enter email subject"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {replyType === "call" || replyType === "video"
                          ? "Call Summary"
                          : "Message"}
                      </label>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`Enter your ${
                          replyType === "call" || replyType === "video"
                            ? "call summary"
                            : "message"
                        }`}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowReplyForm(false)}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendReply}
                        disabled={!replyContent.trim()}
                        className="px-4 py-2 bg-[#0891b2] text-white rounded-lg hover:bg-[#0fc4b5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send{" "}
                        {replyType === "call" || replyType === "video"
                          ? "Summary"
                          : "Message"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
