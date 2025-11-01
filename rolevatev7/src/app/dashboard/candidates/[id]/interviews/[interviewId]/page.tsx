"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/dashboard/Header";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  UserIcon,
  CpuChipIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { Interview, getInterviewById } from "@/services/interview.service";
import { Application, getApplicationById } from "@/services/application";
import { apolloClient } from "@/lib/apollo";
import { gql } from "@apollo/client";

interface InterviewDetail extends Interview {
  candidate?: {
    name: string;
    email: string;
  };
  job?: {
    title: string;
    company?: {
      name: string;
    };
  };
}

export default function InterviewDetailsPage() {
  const params = useParams();
  const candidateId = params?.id as string;
  const interviewId = params?.interviewId as string;
  
  const [interview, setInterview] = useState<InterviewDetail | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [analysisJustGenerated, setAnalysisJustGenerated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch application data
        const appData = await getApplicationById(candidateId);
        setApplication(appData);

        // Fetch the specific interview directly by ID
        const specificInterview = await getInterviewById(interviewId);
        
        if (specificInterview) {
          setInterview(specificInterview);
        } else {
          // If interview not found, show empty state
          setInterview(null);
        }
      } catch (error) {
        console.error("Error fetching interview data:", error);
        setInterview(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [candidateId, interviewId]);

  const generateAnalysis = async () => {
    if (!interview?.id) return;
    
    try {
      setIsGeneratingAnalysis(true);
      
      const GENERATE_ANALYSIS_MUTATION = gql`
        mutation GenerateInterviewAnalysis($id: ID!) {
          generateInterviewAnalysis(id: $id) {
            id
            aiAnalysis
          }
        }
      `;

      const { data } = await apolloClient.mutate<{
        generateInterviewAnalysis: {
          id: string;
          aiAnalysis: any;
        }
      }>({
        mutation: GENERATE_ANALYSIS_MUTATION,
        variables: { id: interview.id }
      });

      if (data?.generateInterviewAnalysis?.aiAnalysis) {
        // Update the interview with the new AI analysis
        setInterview(prev => prev ? {
          ...prev,
          aiAnalysis: data.generateInterviewAnalysis.aiAnalysis
        } : null);
        
        // Clear any previous error and show success indicator
        setError(null);
        setAnalysisJustGenerated(true);
        
        // Hide success indicator after 3 seconds
        setTimeout(() => setAnalysisJustGenerated(false), 3000);
      }
    } catch (error) {
      console.error("Error generating analysis:", error);
      setError("Failed to generate analysis. Please try again.");
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Interview Details" subtitle="Loading interview information..." />
        <div className="pt-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading interview details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Interview Not Found" subtitle="The requested interview could not be found" />
        <div className="pt-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Interview Not Found</h3>
              <p className="text-gray-600 mb-4">{error || "The interview you're looking for doesn't exist."}</p>
              <Link
                href={`/dashboard/candidates/${candidateId}`}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Candidate
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SCHEDULED":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const minutes = Math.floor(date.getSeconds() / 60);
    const seconds = date.getSeconds() % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={`Interview with ${interview.candidate?.name || 'Candidate'}`}
        subtitle={`${interview.job?.title || 'Position'} • ${interview.job?.company?.name || 'Company'}`}
      />

      <div className="pt-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href={`/dashboard/candidates/${candidateId}`}
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to {interview.candidate?.name || 'Candidate'}
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex text-red-400 hover:text-red-600"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Interview Overview */}
              <div className="bg-white rounded-3xl shadow-lg border-0 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Interview Overview</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {new Date(interview.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(interview.status)}`}>
                      {interview.status === "COMPLETED" && "✓ "}
                      {interview.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <ClockIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <div className="text-lg font-semibold text-gray-900">
                        {interview.duration ? `${interview.duration} min` : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Duration</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <div className="text-lg font-semibold text-gray-900">
                        {interview.transcripts?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Exchanges</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <CalendarDaysIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <div className="text-lg font-semibold text-gray-900">
                        {interview.type.replace("_", " ")}
                      </div>
                      <div className="text-sm text-gray-600">Type</div>
                    </div>
                  </div>

                  {/* Recording Section */}
                  {interview.recordingUrl && (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Interview Recording</h4>
                      <div className="bg-gray-900 rounded-xl overflow-hidden">
                        <video 
                          controls 
                          className="w-full h-64"
                          poster="/images/video-placeholder.jpg"
                        >
                          <source src={interview.recordingUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}

                  {/* Notes Section */}
                  {interview.notes && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Interview Notes</h4>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-700 leading-relaxed">{interview.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Transcript Section */}
              {interview.transcripts && interview.transcripts.length > 0 && (
                <div className="bg-white rounded-3xl shadow-lg border-0 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Interview Transcript</h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {interview.transcripts.length} exchanges recorded
                        </p>
                      </div>
                      <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-150">
                        <DocumentTextIcon className="w-4 h-4" />
                        Export
                      </button>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="space-y-6">
                      {interview.transcripts.map((transcript) => (
                        <div key={transcript.id} className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                transcript.speaker === "AI"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {transcript.speaker === "AI" ? (
                                <CpuChipIcon className="w-5 h-5" />
                              ) : (
                                <UserIcon className="w-5 h-5" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                {transcript.speaker === "AI" ? "AI Interviewer" : "Candidate"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(transcript.timestamp)}
                              </span>
                              {transcript.confidence && (
                                <span className="text-xs text-gray-400">
                                  {Math.round(transcript.confidence * 100)}% confidence
                                </span>
                              )}
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-gray-900 leading-relaxed">{transcript.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Analysis */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CpuChipIcon className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">AI Analysis</h3>
                {analysisJustGenerated && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 animate-pulse">
                    <SparklesIcon className="w-3 h-3 mr-1" />
                    Just generated!
                  </span>
                )}
              </div>                {interview.aiAnalysis ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-purple-600">
                        {typeof interview.aiAnalysis === 'object' && 
                          ('score' in interview.aiAnalysis ? interview.aiAnalysis.score : 
                           'overall_score' in interview.aiAnalysis ? interview.aiAnalysis.overall_score : 'N/A')}%
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${typeof interview.aiAnalysis === 'object' && 
                                ('score' in interview.aiAnalysis ? interview.aiAnalysis.score : 
                                 'overall_score' in interview.aiAnalysis ? interview.aiAnalysis.overall_score : 0)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {typeof interview.aiAnalysis === 'object' && (
                      <>
                        {('improvement_areas' in interview.aiAnalysis && Array.isArray(interview.aiAnalysis.improvement_areas) && interview.aiAnalysis.improvement_areas.length > 0) && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Areas for Improvement</h4>
                            <ul className="space-y-1">
                              {interview.aiAnalysis.improvement_areas.map((area: string, index: number) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                                  <span className="text-gray-700">{area}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {('interviewer_feedback' in interview.aiAnalysis && interview.aiAnalysis.interviewer_feedback) && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Interviewer Feedback</h4>
                            <p className="text-gray-700 text-sm">{interview.aiAnalysis.interviewer_feedback}</p>
                          </div>
                        )}

                        {('candidate_feedback' in interview.aiAnalysis && interview.aiAnalysis.candidate_feedback) && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Candidate Feedback</h4>
                            <p className="text-gray-700 text-sm">{interview.aiAnalysis.candidate_feedback}</p>
                          </div>
                        )}
                      </>
                    )}

                    {typeof interview.aiAnalysis === 'object' && 'recommendation' in interview.aiAnalysis && interview.aiAnalysis.recommendation && (
                      <div className="pt-2 border-t">
                        <span className="text-xs text-gray-500">
                          Recommendation: <span className={`font-medium ${
                            interview.aiAnalysis.recommendation === 'reject' ? 'text-red-600' :
                            interview.aiAnalysis.recommendation === 'hire' ? 'text-green-600' :
                            'text-yellow-600'
                          }`}>
                            {interview.aiAnalysis.recommendation.charAt(0).toUpperCase() + interview.aiAnalysis.recommendation.slice(1)}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CpuChipIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm mb-4">AI Analysis not available for this interview</p>
                    <button
                      onClick={generateAnalysis}
                      disabled={isGeneratingAnalysis || !interview?.transcripts?.length}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      {isGeneratingAnalysis ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-4 h-4" />
                          Generate AI Analysis
                        </>
                      )}
                    </button>
                    {!interview?.transcripts?.length && (
                      <p className="text-xs text-gray-400 mt-2">Analysis requires transcript data</p>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-3xl shadow-lg border-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
                </div>
                <div className="p-6 space-y-3">
                  {interview.recordingUrl && (
                    <a
                      href={interview.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-150"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Watch Recording
                    </a>
                  )}
                  <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                    <DocumentTextIcon className="w-4 h-4" />
                    Download Transcript
                  </button>
                  <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                    <ChartBarIcon className="w-4 h-4" />
                    Export Analysis
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}