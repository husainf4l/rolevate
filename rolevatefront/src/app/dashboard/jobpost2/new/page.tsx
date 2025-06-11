"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import {
  n8nService,
  type N8NJobData,
  type N8NProcessRequest,
} from "../../../../services/n8n.service";

type JobType = "full-time" | "part-time" | "contract";

interface NewJobFormData {
  title: string;
  department: string;
  location: string;
  type: JobType;
  description: string;
  requirements: string[];
  benefits: string[];
}

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatState {
  currentStep:
    | "greeting"
    | "title"
    | "department"
    | "location"
    | "type"
    | "description"
    | "requirements"
    | "benefits"
    | "completed";
  messages: ChatMessage[];
  extractedData: Partial<NewJobFormData>;
  suggestions: string[];
  confidence: number;
}

const NewJobPost = () => {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [chatState, setChatState] = useState<ChatState>({
    currentStep: "greeting",
    messages: [
      {
        id: "1",
        type: "assistant",
        content:
          "Hello! I'm your AI assistant for creating job posts. I'll help you gather all the information needed to create an amazing job posting. Once we're done, I'll automatically create the job post for you. Let's start! What position are you looking to hire for?",
        timestamp: new Date(),
      },
    ],
    extractedData: {
      requirements: [],
      benefits: [],
    },
    suggestions: [],
    confidence: 0,
  });

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatState.messages]);

  // Process user message through n8n
  const processUserMessage = async (message: string) => {
    setIsTyping(true);

    try {
      // Prepare conversation history for n8n
      const conversationHistory = chatState.messages.map((msg) => ({
        role: msg.type === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      }));

      const n8nRequest: N8NProcessRequest = {
        userMessage: message,
        currentStep: chatState.currentStep,
        conversationHistory,
        extractedData: chatState.extractedData,
      };

      console.log("🎯 Processing user message:", message);
      console.log("📊 Current step:", chatState.currentStep);
      console.log("💾 Current extracted data:", chatState.extractedData);

      // Call n8n service for AI processing
      const response = await n8nService.processJobMessage(n8nRequest);

      if (response.success && response.data) {
        const {
          extractedData,
          nextQuestion,
          confidence,
          suggestions = [],
        } = response.data;

        console.log("✅ n8n processing successful!");
        console.log("📈 Confidence:", confidence);
        console.log("💡 Suggestions:", suggestions);

        const aiMessage: ChatMessage = {
          id: Date.now().toString(),
          type: "assistant",
          content: nextQuestion,
          timestamp: new Date(),
        };

        const nextStep = getNextStep(chatState.currentStep);

        setChatState((prev) => ({
          ...prev,
          currentStep: nextStep,
          messages: [...prev.messages, aiMessage],
          extractedData,
          suggestions,
          confidence,
        }));

        // If completed, show success message after a delay
        if (nextStep === "completed") {
          setTimeout(() => {
            const completionMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              type: "assistant",
              content:
                "🎉 Perfect! I've successfully collected all the information and your job post has been created automatically. You can now view it in your job posts dashboard or create another one.",
              timestamp: new Date(),
            };

            setChatState((prev) => ({
              ...prev,
              messages: [...prev.messages, completionMessage],
            }));
          }, 2000);
        }
      } else {
        throw new Error(response.error || "Failed to process message");
      }
    } catch (error) {
      console.error("❌ Error processing message:", error);

      // Show error message to user
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "assistant",
        content:
          "I'm sorry, I'm having trouble processing your message right now. Please try again or contact support if the issue persists.",
        timestamp: new Date(),
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const getNextStep = (currentStep: string): ChatState["currentStep"] => {
    const stepOrder: ChatState["currentStep"][] = [
      "greeting",
      "title",
      "department",
      "location",
      "type",
      "description",
      "requirements",
      "benefits",
      "completed",
    ];
    const currentIndex = stepOrder.indexOf(
      currentStep as ChatState["currentStep"]
    );
    return currentIndex < stepOrder.length - 1
      ? stepOrder[currentIndex + 1]
      : "completed";
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    const messageToProcess = currentMessage;
    setCurrentMessage("");

    await processUserMessage(messageToProcess);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/jobpost2");
  };

  const handleNewJobPost = () => {
    // Reset chat state for new job post
    setChatState({
      currentStep: "greeting",
      messages: [
        {
          id: "1",
          type: "assistant",
          content:
            "Hello! I'm your AI assistant for creating job posts. I'll help you gather all the information needed to create an amazing job posting. Once we're done, I'll automatically create the job post for you. Let's start! What position are you looking to hire for?",
          timestamp: new Date(),
        },
      ],
      extractedData: {
        requirements: [],
        benefits: [],
      },
      suggestions: [],
      confidence: 0,
    });
    setCurrentMessage("");
  };

  const getStepProgress = () => {
    const steps = [
      "greeting",
      "title",
      "department",
      "location",
      "type",
      "description",
      "requirements",
      "benefits",
      "completed",
    ];
    const currentIndex = steps.indexOf(chatState.currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-900">
      <div className="px-20 py-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BriefcaseIcon className="h-8 w-8 text-[#00C6AD]" />
              AI Job Post Assistant
            </h1>
            <p className="text-gray-400 mt-1">
              Let our AI assistant help you create the perfect job posting
              through conversation
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {chatState.currentStep !== "completed" && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(getStepProgress())}% Complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-[#00C6AD] h-2 rounded-full transition-all duration-300"
                style={{ width: `${getStepProgress()}%` }}
              />
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gray-750 px-6 py-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00C6AD] rounded-full flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    ROLEVATE AI Assistant
                  </h3>
                  <p className="text-sm text-gray-400">
                    {chatState.currentStep === "completed"
                      ? "Job post creation completed!"
                      : "Powered by advanced AI to create perfect job posts"}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {chatState.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.type === "user"
                        ? "bg-[#00C6AD] text-white"
                        : "bg-gray-700 text-gray-100"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.type === "user"
                          ? "text-teal-100"
                          : "text-gray-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 rounded-lg px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-700">
              {/* AI Suggestions */}
              {chatState.suggestions &&
                chatState.suggestions.length > 0 &&
                chatState.currentStep !== "completed" && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <LightBulbIcon className="h-4 w-4 text-[#00C6AD]" />
                      <span className="text-sm text-gray-400">
                        Quick suggestions:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {chatState.suggestions
                        .slice(0, 4)
                        .map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentMessage(suggestion)}
                            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-full border border-gray-600 hover:border-[#00C6AD] transition-all"
                          >
                            {suggestion}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

              {/* Completion Actions */}
              {chatState.currentStep === "completed" && (
                <div className="mb-4 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-medium">
                      Job Post Created Successfully!
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    Your job post has been automatically created and is now
                    available in your dashboard.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-[#00C6AD] hover:bg-[#14B8A6] text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      View Job Posts
                    </button>
                    <button
                      onClick={handleNewJobPost}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Create Another
                    </button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="flex gap-3">
                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    chatState.currentStep === "completed"
                      ? "Job post completed! Use the buttons above to continue."
                      : "Type your response..."
                  }
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00C6AD] focus:border-[#00C6AD] text-white placeholder-gray-400 resize-none"
                  rows={2}
                  disabled={isTyping || chatState.currentStep === "completed"}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={
                    !currentMessage.trim() ||
                    isTyping ||
                    chatState.currentStep === "completed"
                  }
                  className="px-4 py-3 bg-[#00C6AD] hover:bg-[#14B8A6] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Confidence Indicator */}
              {chatState.confidence > 0 &&
                chatState.currentStep !== "completed" && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                    <SparklesIcon className="h-4 w-4" />
                    <span>
                      AI Confidence: {Math.round(chatState.confidence * 100)}%
                    </span>
                    <div className="flex-1 bg-gray-700 rounded-full h-1 ml-2">
                      <div
                        className="bg-[#00C6AD] h-1 rounded-full transition-all duration-300"
                        style={{ width: `${chatState.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Help Section */}
          {chatState.currentStep !== "completed" && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium mb-1">How it works</h4>
                  <p className="text-gray-400 text-sm">
                    I'll guide you through creating your job post step by step.
                    Just answer my questions naturally, and I'll automatically
                    create and publish your job post when we're done. You can
                    use the suggestions or type your own responses.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewJobPost;
