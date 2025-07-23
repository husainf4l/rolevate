"use client";

import React, { useState, useEffect } from "react";
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
  companyId: string;
  jobId?: string;
  type: "WHATSAPP" | "EMAIL" | "PHONE" | "SMS";
  direction: "INBOUND" | "OUTBOUND";
  status: "SENT" | "DELIVERED" | "READ" | "FAILED";
  content: string;
  subject?: string;
  whatsappId?: string;
  phoneNumber?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
  };
  job?: {
    title: string;
  };
}


const getTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "email":
      return <EnvelopeIcon className="w-6 h-6" />;
    case "whatsapp":
      return <ChatBubbleLeftRightIcon className="w-6 h-6" />;
    case "phone":
      return <PhoneIcon className="w-6 h-6" />;
    case "sms":
      return <ChatBubbleLeftRightIcon className="w-6 h-6" />;
    default:
      return <ChatBubbleLeftRightIcon className="w-6 h-6" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "email":
      return "bg-blue-100 text-blue-800";
    case "whatsapp":
      return "bg-green-100 text-green-800";
    case "phone":
      return "bg-purple-100 text-purple-800";
    case "sms":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case "sent":
      return <PaperAirplaneIcon className="w-4 h-4 text-gray-500" />;
    case "delivered":
      return <CheckIcon className="w-4 h-4 text-blue-500" />;
    case "read":
      return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    case "failed":
      return <XMarkIcon className="w-4 h-4 text-red-500" />;
    default:
      return <ClockIcon className="w-4 h-4 text-gray-400" />;
  }
};

export default function MessageDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const messageId = params.id as string;

  const [message, setMessage] = useState<CommunicationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyType, setReplyType] = useState<"EMAIL" | "WHATSAPP" | "PHONE" | "SMS">("EMAIL");
  const [replySubject, setReplySubject] = useState("");
  const [replyContent, setReplyContent] = useState("");

  // Fetch message from API
  const fetchMessage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`https://rolevate.com/api/communications/${messageId}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch message');
      }
      
      const data = await response.json();
      setMessage(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch message');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessage();
  }, [messageId]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header
          title="Loading Message"
          subtitle="Please wait while we fetch the message details"
        />
        <div className="pt-20 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#13ead9] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading message details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !message) {
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
                {error || "Message Not Found"}
              </h3>
              <p className="text-gray-600 mb-6">
                {error ? "An error occurred while fetching the message." : "The message you're looking for doesn't exist or has been deleted."}
              </p>
              <div className="flex justify-center gap-3">
                {error && (
                  <button
                    onClick={fetchMessage}
                    className="px-4 py-2 bg-[#0891b2] text-white rounded-lg hover:bg-[#0fc4b5] transition-colors"
                  >
                    Retry
                  </button>
                )}
                <Link
                  href="/dashboard/messages"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to Messages
                </Link>
              </div>
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

  const handleSendReply = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://rolevate.com/api/communications', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: message.candidateId,
          jobId: message.jobId,
          type: replyType,
          direction: 'OUTBOUND',
          subject: replyType === 'EMAIL' ? replySubject : undefined,
          content: replyContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      // Reset form
      setReplySubject("");
      setReplyContent("");
      setShowReplyForm(false);

      // Show success message
      alert("Reply sent successfully!");
    } catch (error) {
      console.error('Error sending reply:', error);
      alert("Failed to send reply. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Message Details"
        subtitle={`Communication with ${message.candidate.firstName} ${message.candidate.lastName}`}
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
                      <div className="flex items-center gap-1">
                        {getStatusIcon(message.status)}
                        <span className="text-sm text-gray-500 capitalize">
                          {message.status.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>
                      {message.direction === "INBOUND"
                        ? "Received from"
                        : "Sent to"}
                      : {message.candidate.firstName} {message.candidate.lastName}
                    </span>
                    <span>•</span>
                    <span>{formatTimestamp(message.sentAt || message.createdAt)}</span>
                  </div>
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
                  <p className="text-gray-900">{message.candidate.firstName} {message.candidate.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <p className="text-gray-900">{message.candidate.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position Applied
                  </label>
                  <p className="text-gray-900">{message.job?.title || 'No job specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Related Job ID
                  </label>
                  <p className="text-gray-900">{message.jobId || 'N/A'}</p>
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
                {message.type === "PHONE"
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
                  {message.type === "PHONE"
                    ? "Summary"
                    : "Content"}
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>

              {/* Additional message details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Communication Type
                  </label>
                  <p className="text-gray-900">{message.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Direction
                  </label>
                  <p className="text-gray-900">{message.direction}</p>
                </div>
                {message.phoneNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <p className="text-gray-900">{message.phoneNumber}</p>
                  </div>
                )}
                {message.whatsappId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp ID
                    </label>
                    <p className="text-gray-900">{message.whatsappId}</p>
                  </div>
                )}
              </div>
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
                          <option value="EMAIL">Email</option>
                          <option value="WHATSAPP">WhatsApp</option>
                          <option value="PHONE">Phone Call</option>
                          <option value="SMS">SMS</option>
                        </select>
                      </div>
                    </div>

                    {replyType === "EMAIL" && (
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
                        {replyType === "PHONE"
                          ? "Call Summary"
                          : "Message"}
                      </label>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`Enter your ${
                          replyType === "PHONE"
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
                        {replyType === "PHONE"
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
