import React from "react";
import { motion } from "framer-motion";
import { SparklesIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";

const Message = ({ text, sender }: { text: string; sender: "user" | "ai" }) => {
  const isAI = sender === "ai";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 my-4 ${isAI ? "" : "flex-row-reverse"}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 ${
          isAI
            ? "bg-gradient-to-br from-[#13ead9] to-[#0891b2]"
            : "bg-slate-300"
        }`}
      >
        {isAI && <SparklesIcon className="w-5 h-5 text-white m-auto" />}
      </div>
      <div
        className={`p-4 rounded-2xl max-w-sm ${
          isAI
            ? "bg-slate-100 text-slate-800 rounded-tl-none"
            : "bg-blue-600 text-white rounded-br-none"
        }`}
      >
        <p className="text-sm leading-relaxed">{text}</p>
      </div>
    </motion.div>
  );
};

export function AIAssistantPanel() {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-[#13ead9]" />
          AI Assistant
        </h3>
        <p className="text-sm text-slate-500">
          Your intelligent partner for this interview.
        </p>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Chat messages will go here */}
        <Message
          sender="ai"
          text="Hello! I'm here to assist you. I'll provide feedback and ask follow-up questions. Let's start with: Can you tell me about a challenging project you've worked on?"
        />
        <Message sender="user" text="Sure, I'd be happy to." />
      </div>
      <div className="p-4 border-t border-slate-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Type your response..."
            className="w-full bg-slate-100 border-2 border-transparent focus:border-[#13ead9] focus:ring-0 rounded-full py-3 pl-4 pr-12 text-sm"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-full text-white hover:scale-110 transition-transform">
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
