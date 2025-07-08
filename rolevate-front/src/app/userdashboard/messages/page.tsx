"use client";

import React from "react";
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  EllipsisVerticalIcon,
  CheckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: "text" | "file" | "system";
}

interface Conversation {
  id: string;
  participantName: string;
  participantRole: string;
  participantCompany: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  status: "active" | "archived" | "closed";
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    participantName: "Sarah Johnson",
    participantRole: "Engineering Manager",
    participantCompany: "TechCorp Inc.",
    lastMessage:
      "Thanks for your interest! We'd like to schedule a technical interview.",
    lastMessageTime: "2025-01-09T15:30:00Z",
    unreadCount: 2,
    status: "active",
    messages: [
      {
        id: "1",
        senderId: "sarah",
        senderName: "Sarah Johnson",
        senderRole: "Engineering Manager",
        content:
          "Hi John! Thank you for applying to our Senior Frontend Developer position. I've reviewed your application and I'm impressed with your experience.",
        timestamp: "2025-01-09T14:00:00Z",
        read: true,
        type: "text",
      },
      {
        id: "2",
        senderId: "john",
        senderName: "John Doe",
        senderRole: "Candidate",
        content:
          "Thank you for reaching out! I'm very excited about this opportunity and would love to discuss how I can contribute to your team.",
        timestamp: "2025-01-09T14:30:00Z",
        read: true,
        type: "text",
      },
      {
        id: "3",
        senderId: "sarah",
        senderName: "Sarah Johnson",
        senderRole: "Engineering Manager",
        content:
          "Thanks for your interest! We'd like to schedule a technical interview. Are you available next week?",
        timestamp: "2025-01-09T15:30:00Z",
        read: false,
        type: "text",
      },
    ],
  },
  {
    id: "2",
    participantName: "Mike Chen",
    participantRole: "Design Director",
    participantCompany: "DesignHub",
    lastMessage:
      "Your portfolio looks great! When would be a good time to chat?",
    lastMessageTime: "2025-01-08T11:45:00Z",
    unreadCount: 1,
    status: "active",
    messages: [
      {
        id: "1",
        senderId: "mike",
        senderName: "Mike Chen",
        senderRole: "Design Director",
        content:
          "Hi John! I saw your application for the UI/UX Designer position. Your portfolio looks great! When would be a good time to chat?",
        timestamp: "2025-01-08T11:45:00Z",
        read: false,
        type: "text",
      },
    ],
  },
  {
    id: "3",
    participantName: "Alex Rodriguez",
    participantRole: "CTO",
    participantCompany: "StartupXYZ",
    lastMessage: "Great meeting you today! We'll be in touch soon.",
    lastMessageTime: "2025-01-08T16:20:00Z",
    unreadCount: 0,
    status: "active",
    messages: [
      {
        id: "1",
        senderId: "alex",
        senderName: "Alex Rodriguez",
        senderRole: "CTO",
        content:
          "Great meeting you today! We'll be in touch soon with next steps.",
        timestamp: "2025-01-08T16:20:00Z",
        read: true,
        type: "text",
      },
    ],
  },
];

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor(
    (now.getTime() - time.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }
};

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] =
    React.useState<Conversation | null>(mockConversations[0] || null);
  const [newMessage, setNewMessage] = React.useState("");
  const totalUnread = mockConversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      // In a real app, this would send the message to the backend
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="flex-1 h-screen">
      <div className="flex h-full">
        {/* Conversations List */}
        <div className="w-80 border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0fc4b5] focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="overflow-y-auto">
            {mockConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedConversation?.id === conversation.id
                    ? "bg-blue-50 border-l-4 border-l-[#0fc4b5]"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#0fc4b5] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {conversation.participantName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.participantName}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.participantRole} at{" "}
                        {conversation.participantCompany}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">
                      {formatTimeAgo(conversation.lastMessageTime)}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-[#0fc4b5] rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {conversation.lastMessage}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#0fc4b5] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {selectedConversation.participantName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-medium text-gray-900">
                        {selectedConversation.participantName}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.participantRole} at{" "}
                        {selectedConversation.participantCompany}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <EllipsisVerticalIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === "john"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === "john"
                          ? "bg-[#0fc4b5] text-white"
                          : "bg-white text-gray-900 border border-gray-200"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span
                          className={`text-xs ${
                            message.senderId === "john"
                              ? "text-white/70"
                              : "text-gray-500"
                          }`}
                        >
                          {formatTimeAgo(message.timestamp)}
                        </span>
                        {message.senderId === "john" && (
                          <div className="flex items-center space-x-1">
                            {message.read ? (
                              <CheckIcon className="w-3 h-3 text-white/70" />
                            ) : (
                              <ClockIcon className="w-3 h-3 text-white/70" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <PaperClipIcon className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder="Type your message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0fc4b5] focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-[#0fc4b5] text-white rounded-lg hover:bg-[#0ba399] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* No Conversation Selected */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600">
                  Choose a conversation from the list to start messaging.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Total</p>
            <p className="text-lg font-bold text-gray-900">
              {mockConversations.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Unread</p>
            <p className="text-lg font-bold text-[#0fc4b5]">{totalUnread}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Active</p>
            <p className="text-lg font-bold text-green-600">
              {mockConversations.filter((c) => c.status === "active").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
