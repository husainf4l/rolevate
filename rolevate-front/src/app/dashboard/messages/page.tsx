"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/Header";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  VideoCameraIcon,
  PaperAirplaneIcon,
  UserIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
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

interface CommunicationStats {
  total: number;
  byType: { [key: string]: number };
  byStatus: { [key: string]: number };
}


const getTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "email":
      return <EnvelopeIcon className="w-5 h-5" />;
    case "whatsapp":
      return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
    case "phone":
      return <PhoneIcon className="w-5 h-5" />;
    case "sms":
      return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
    default:
      return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
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

export default function CommunicationPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [communications, setCommunications] = useState<CommunicationRecord[]>([]);
  const [stats, setStats] = useState<CommunicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch communications from API
  const fetchCommunications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      
      if (filterType !== "all") params.append("type", filterType.toUpperCase());
      if (filterStatus !== "all") params.append("status", filterStatus.toUpperCase());
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4005/api/communications?${params}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch communications');
      
      const data = await response.json();
      setCommunications(data.communications || []);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch communications');
      setCommunications([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch communication stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4005/api/communications/stats', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Filter communications locally by search term
  const filteredCommunications = communications.filter((comm) => {
    if (!searchTerm) return true;
    
    const candidateName = `${comm.candidate.firstName} ${comm.candidate.lastName}`;
    const jobTitle = comm.job?.title || '';
    
    return (
      candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchCommunications();
    fetchStats();
  }, [page, filterType, filterStatus]);

  // Reset page when filters change
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [filterType, filterStatus]);

  return (
    <div className="min-h-screen">
      <Header
        title="Communication Center"
        subtitle="Track all candidate communications across channels"
      />

      <div className="pt-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Action Buttons */}
          <div className="mb-8 flex justify-between items-center">
            <div></div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                Export Report
              </button>
              <button className="px-4 py-2 bg-[#0891b2] text-white rounded-lg hover:bg-[#0fc4b5] transition-colors font-medium">
                New Communication
              </button>
            </div>
          </div>

          {/* Communication Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Communications
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.total || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#0891b2]/10">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-[#0891b2]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Emails Sent
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.byType?.EMAIL || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Phone Calls
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.byType?.PHONE || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-100">
                  <PhoneIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    WhatsApp Messages
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.byType?.WHATSAPP || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Delivered
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.byStatus?.DELIVERED || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#0fc4b5]/10">
                  <CheckCircleIcon className="w-6 h-6 text-[#0fc4b5]" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
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
                      placeholder="Search communications by candidate, content, or subject..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Phone</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891b2] focus:border-transparent text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="sent">Sent</option>
                    <option value="delivered">Delivered</option>
                    <option value="read">Read</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <button className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm">
                    <FunnelIcon className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Communications List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Communications ({filteredCommunications.length})
                </h2>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Export
                  </button>
                  <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Archive
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#13ead9] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading communications...</p>
                </div>
              ) : error ? (
                <div className="p-12 text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button 
                    onClick={() => fetchCommunications()}
                    className="px-4 py-2 bg-[#0891b2] text-white rounded-lg hover:bg-[#0fc4b5] transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredCommunications.length === 0 ? (
                <div className="p-12 text-center">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No communications found</p>
                  <p className="text-sm text-gray-400">
                    {searchTerm ? 'Try adjusting your search terms' : 'Start communicating with candidates to see messages here'}
                  </p>
                </div>
              ) : (
                filteredCommunications.map((comm) => (
                <div
                  key={comm.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/messages/${comm.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(
                          comm.type
                        )}`}
                      >
                        {getTypeIcon(comm.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {comm.candidate.firstName} {comm.candidate.lastName}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {comm.job?.title || 'No job specified'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            comm.direction === 'OUTBOUND' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {comm.direction.toLowerCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(comm.sentAt || comm.createdAt)}
                          </span>
                          {getStatusIcon(comm.status)}
                        </div>
                      </div>

                      {comm.subject && (
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {comm.subject}
                        </p>
                      )}

                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {comm.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Type: {comm.type}</span>
                          {comm.phoneNumber && (
                            <span>Phone: {comm.phoneNumber}</span>
                          )}
                          {comm.whatsappId && (
                            <span className="flex items-center gap-1">
                              <DocumentTextIcon className="w-3 h-3" />
                              WhatsApp ID: {comm.whatsappId.slice(0, 8)}...
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/candidates/${comm.candidateId}`}
                            className="text-[#0891b2] hover:text-[#0fc4b5] font-medium text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Profile
                          </Link>
                          <button
                            className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Reply
                          </button>
                          <button
                            className="text-gray-400 hover:text-gray-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <EllipsisVerticalIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {!loading && !error && filteredCommunications.length > 0 && totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
