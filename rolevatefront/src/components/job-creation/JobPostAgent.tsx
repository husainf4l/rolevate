"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/hooks/useAuth";
import {
  InformationCircleIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

// Types for the job post data
interface JobData {
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  skills: string[];
  experienceLevel: string;
  location: string;
  workType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  department: string;
  enableAiInterview: boolean;
  isFeatured: boolean;
}

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SessionInfo {
  session_id: string;
  company_id: string;
  company_name: string;
  created_at: string;
  last_updated: string;
  current_step: string;
  is_complete: boolean;
  conversation_turns: number;
  job_data: JobData;
}

interface JobPostAgentProps {
  onJobDataUpdate?: (jobData: any) => void;
  onError?: (error: string) => void;
}

export const JobPostAgent: React.FC<JobPostAgentProps> = ({
  onJobDataUpdate,
  onError,
}) => {
  const { user } = useAuth();

  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [localSessionId, setLocalSessionId] = useState<string | null>(null); // For UI and localStorage
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_JOB_POST_API_URL || "https://rolevate.com/fastapi";
  const companyId = user?.companyId || "";
  const companyName = user?.company?.name || user?.company?.displayName || "";

  // Generate UUID for session ID
  const generateUUID = (): string => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  // Load session from localStorage on component mount
  useEffect(() => {
    const savedLocalSessionId = localStorage.getItem(
      "jobPostAgent_localSessionId"
    );
    const savedSessionId = localStorage.getItem("jobPostAgent_sessionId");
    const savedMessages = localStorage.getItem("jobPostAgent_messages");
    const savedIsComplete = localStorage.getItem("jobPostAgent_isComplete");

    // Generate or restore local session ID for UI purposes
    if (savedLocalSessionId) {
      setLocalSessionId(savedLocalSessionId);
    } else {
      const newLocalSessionId = generateUUID();
      setLocalSessionId(newLocalSessionId);
      localStorage.setItem("jobPostAgent_localSessionId", newLocalSessionId);
    }

    // Restore backend session ID if it exists, otherwise generate one
    if (savedSessionId) {
      setSessionId(savedSessionId);
    } else {
      const newSessionId = generateUUID();
      setSessionId(newSessionId);
    }

    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(
          parsedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        );
      } catch (err) {
        console.error("Failed to parse saved messages:", err);
      }
    }

    if (savedIsComplete) {
      setIsComplete(savedIsComplete === "true");
    }
  }, []);

  // Save session data to localStorage whenever it changes
  useEffect(() => {
    if (localSessionId) {
      localStorage.setItem("jobPostAgent_localSessionId", localSessionId);
    }
  }, [localSessionId]);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("jobPostAgent_sessionId", sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem("jobPostAgent_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("jobPostAgent_isComplete", isComplete.toString());
  }, [isComplete]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [inputValue]);

  // API call helper
  const apiCall = async (endpoint: string, data: Record<string, any>) => {
    const formData = new FormData();

    // Always include session_id - use existing one or generate new one
    const currentSessionId = sessionId || generateUUID();
    formData.append("session_id", currentSessionId);

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  // Start new conversation
  const startConversation = async (initialMessage: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate session ID if we don't have one
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId = generateUUID();
        setSessionId(currentSessionId);
      }

      const result = await apiCall("/create-job-post", {
        message: initialMessage,
        company_id: companyId,
        company_name: companyName,
      });

      if (result.status === "error") {
        throw new Error(result.error);
      }

      // Update session ID if backend returned a different one
      if (result.session_id && result.session_id !== currentSessionId) {
        setSessionId(result.session_id);
      }

      setIsComplete(result.is_complete);

      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "user",
        content: initialMessage,
        timestamp: new Date(),
      };

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: result.agent_response,
        timestamp: new Date(),
      };

      setMessages([userMessage, assistantMessage]);

      if (result.is_complete && onJobDataUpdate) {
        onJobDataUpdate(result.job_data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Continue conversation
  const continueConversation = async (message: string) => {
    if (!sessionId) {
      throw new Error("No active session");
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCall("/job-post-chat", {
        message,
      });

      if (result.status === "error") {
        throw new Error(result.error);
      }

      setIsComplete(result.is_complete);

      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "user",
        content: message,
        timestamp: new Date(),
      };

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: result.agent_response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      if (result.is_complete && onJobDataUpdate) {
        onJobDataUpdate(result.job_data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Debug logging for session management
  const logSessionAction = (action: string, details?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[JobPostAgent] ${action}:`, {
        localSessionId: localSessionId
          ? `${localSessionId.slice(0, 8)}...`
          : "none",
        backendSessionId: sessionId ? `${sessionId.slice(0, 8)}...` : "none",
        timestamp: new Date().toISOString(),
        ...details,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue("");

    logSessionAction("Submitting message", {
      hasBackendSessionId: !!sessionId,
      hasLocalSessionId: !!localSessionId,
      messageLength: message.length,
      messagesCount: messages.length,
    });

    if (messages.length === 0) {
      // First message - start conversation
      await startConversation(message);
    } else {
      // Continue conversation
      await continueConversation(message);
    }
  };

  // Handle key press for Shift+Enter functionality
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!inputValue.trim() || isLoading) return;
      handleSubmit(e);
    }
  };

  // Get session information
  const getSessionInfo = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(
        `${apiBaseUrl}/job-post-session/${sessionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSessionInfo(result);
      } else {
        console.error("Failed to get session info:", response.statusText);
      }
    } catch (err) {
      console.error("Failed to get session info:", err);
    }
  };

  // Cleanup function for component unmount
  const cleanupSession = () => {
    // This function could be called on component unmount if needed
    // For now, we keep sessions persistent across component lifecycles
  };

  // Start new session
  const startNewSession = () => {
    // Clear all session data
    setMessages([]);
    setSessionInfo(null);
    setIsComplete(false);
    setError(null);

    // Generate new session IDs
    const newLocalSessionId = generateUUID();
    const newSessionId = generateUUID();
    setLocalSessionId(newLocalSessionId);
    setSessionId(newSessionId);

    // Clear localStorage
    localStorage.removeItem("jobPostAgent_messages");
    localStorage.removeItem("jobPostAgent_isComplete");
    localStorage.setItem("jobPostAgent_localSessionId", newLocalSessionId);
    localStorage.setItem("jobPostAgent_sessionId", newSessionId);
  };

  // Delete session
  const deleteSession = async () => {
    if (!sessionId) return;

    try {
      await fetch(`${apiBaseUrl}/job-post-session/${sessionId}`, {
        method: "DELETE",
      });

      // Clear localStorage
      localStorage.removeItem("jobPostAgent_sessionId");
      localStorage.removeItem("jobPostAgent_messages");
      localStorage.removeItem("jobPostAgent_isComplete");
      localStorage.removeItem("jobPostAgent_localSessionId");

      startNewSession();
    } catch (err) {
      console.error("Failed to delete session:", err);
      // Even if deletion fails, clear local state
      localStorage.removeItem("jobPostAgent_sessionId");
      localStorage.removeItem("jobPostAgent_messages");
      localStorage.removeItem("jobPostAgent_isComplete");
      localStorage.removeItem("jobPostAgent_localSessionId");
      startNewSession();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">AI Job Post Creator</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {companyName} •{" "}
                {localSessionId
                  ? `Local Session: ${localSessionId.slice(0, 8)}...`
                  : "No local session"}{" "}
                {sessionId && `• Backend: ${sessionId.slice(0, 8)}...`}
              </p>
            </div>
            <div className="flex gap-2">
              {sessionId && (
                <>
                  <Button
                    variant="secondary"
                    onClick={getSessionInfo}
                    disabled={isLoading}
                    className="px-3 py-2 text-sm"
                  >
                    <InformationCircleIcon className="h-4 w-4 mr-1" />
                    Info
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={deleteSession}
                    disabled={isLoading}
                    className="px-3 py-2 text-sm"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </>
              )}
              <Button
                variant="secondary"
                onClick={startNewSession}
                disabled={isLoading}
                className="px-3 py-2 text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
          </div>

          {isComplete && (
            <Alert variant="success" className="mt-3">
              <CheckCircleIcon className="h-4 w-4" />
              <div>
                Job post completed! The AI has gathered all necessary
                information.
              </div>
            </Alert>
          )}

          {error && (
            <Alert variant="error" className="mt-3">
              <div>{error}</div>
            </Alert>
          )}
        </CardHeader>
      </Card>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Messages */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <ScrollArea height="400px">
              <div className="p-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <p className="text-lg mb-2">
                      👋 Welcome to AI Job Post Creator!
                    </p>
                    <p>Start by describing the position you want to create.</p>
                    <p className="text-sm mt-4">
                      Example: "Senior Software Engineer" or "Marketing Manager"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.type === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.type === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 flex items-center">
                          <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Form */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      messages.length > 0
                        ? "Continue the conversation... (Press Enter to send, Shift+Enter for new line)"
                        : "Describe the job position you want to create... (Press Enter to send, Shift+Enter for new line)"
                    }
                    disabled={isLoading}
                    className="min-h-[44px] max-h-[120px] resize-none"
                    rows={1}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Press Enter to send • Shift+Enter for new line
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  variant="primary"
                  className="px-4 py-2 h-11"
                >
                  {isLoading ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <PaperAirplaneIcon className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Session Info & Job Data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Session Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionInfo ? (
              <>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Step:</span>{" "}
                    {sessionInfo.current_step}
                  </div>
                  <div>
                    <span className="font-medium">Turns:</span>{" "}
                    {sessionInfo.conversation_turns}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(sessionInfo.created_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    <Badge
                      variant={
                        sessionInfo.is_complete ? "success" : "secondary"
                      }
                    >
                      {sessionInfo.is_complete ? "Complete" : "In Progress"}
                    </Badge>
                  </div>
                </div>

                {/* Job Data Preview */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Collected Data:</h4>
                  <div className="space-y-2 text-xs">
                    {sessionInfo.job_data.title && (
                      <div>
                        <span className="font-medium">Title:</span>{" "}
                        {sessionInfo.job_data.title}
                      </div>
                    )}
                    {sessionInfo.job_data.experienceLevel && (
                      <div>
                        <span className="font-medium">Level:</span>{" "}
                        {sessionInfo.job_data.experienceLevel}
                      </div>
                    )}
                    {sessionInfo.job_data.location && (
                      <div>
                        <span className="font-medium">Location:</span>{" "}
                        {sessionInfo.job_data.location}
                      </div>
                    )}
                    {sessionInfo.job_data.workType && (
                      <div>
                        <span className="font-medium">Work Type:</span>{" "}
                        {sessionInfo.job_data.workType}
                      </div>
                    )}
                    {sessionInfo.job_data.skills.length > 0 && (
                      <div>
                        <span className="font-medium">Skills:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {sessionInfo.job_data.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {(sessionInfo.job_data.salaryMin ||
                      sessionInfo.job_data.salaryMax) && (
                      <div>
                        <span className="font-medium">Salary:</span>{" "}
                        {sessionInfo.job_data.salaryMin}-
                        {sessionInfo.job_data.salaryMax}{" "}
                        {sessionInfo.job_data.currency}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {sessionId ? (
                  <Button
                    variant="secondary"
                    onClick={getSessionInfo}
                    className="text-sm"
                  >
                    Load Session Info
                  </Button>
                ) : (
                  "No active backend session"
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobPostAgent;
