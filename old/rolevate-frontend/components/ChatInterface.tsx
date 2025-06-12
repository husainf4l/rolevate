"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  initialMessages?: Message[];
  onSendMessage?: (message: string) => void;
  interviewType?: "technical" | "behavioral" | "systemDesign" | "general";
}

export default function ChatInterface({
  initialMessages,
  onSendMessage,
  interviewType = "general",
}: ChatInterfaceProps) {
  // Default messages based on interview type
  const getDefaultInitialMessages = (): Message[] => {
    switch (interviewType) {
      case "technical":
        return [
          {
            role: "assistant",
            content:
              "Hello, I'm your technical interviewer today. Let's start by discussing your experience with data structures. Can you explain how you would implement a hash table and its time complexity?",
          },
        ];
      case "behavioral":
        return [
          {
            role: "assistant",
            content:
              "Hello, thank you for joining this interview. I'd like to start by asking you to describe a situation where you had to overcome a significant challenge in your previous role.",
          },
        ];
      case "systemDesign":
        return [
          {
            role: "assistant",
            content:
              "Welcome to this system design interview. Today I'd like you to design a URL shortening service like bit.ly. Please walk me through your approach.",
          },
        ];
      default:
        return [
          {
            role: "assistant",
            content:
              "Hello, thank you for joining this interview. Could you start by telling me about your background and experience that's relevant to this position?",
          },
        ];
    }
  };

  const [messages, setMessages] = useState<Message[]>(
    initialMessages || getDefaultInitialMessages()
  );
  const [isTyping, setIsTyping] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    // Add user message
    setMessages([...messages, { role: "user", content: inputMessage }]);

    // Call the callback if provided
    if (onSendMessage) {
      onSendMessage(inputMessage);
    } else {
      // Default behavior if no callback provided
      setInputMessage("");

      // Simulate AI typing
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);

        // Generate a relevant follow-up question based on interview type
        let followUpQuestion = "";
        switch (interviewType) {
          case "technical":
            followUpQuestion =
              "That's interesting. Now, could you explain how you would handle collisions in your hash table implementation?";
            break;
          case "behavioral":
            followUpQuestion =
              "Thank you for sharing that. How did that experience change your approach to similar situations in the future?";
            break;
          case "systemDesign":
            followUpQuestion =
              "Good points. How would your system handle a sudden spike in traffic, say 10x the normal load?";
            break;
          default:
            followUpQuestion =
              "Thank you for sharing that. Could you tell me about a specific project where you demonstrated those skills?";
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: followUpQuestion,
          },
        ]);
      }, 2000);
    }

    setInputMessage("");
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 h-[500px] flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-white"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-white max-w-[80%] rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type your interview response..."
          className="flex-1 bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
        >
          Send
        </button>
      </div>
    </div>
  );
}
