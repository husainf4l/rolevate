'use client';

import { useState, useRef, useEffect } from 'react';
import { FullPageChatProps } from '@/types/hero';
import { ChatMessage } from '@/types/chat';

export default function FullPageChat({ isOpen, onClose /*, locale: _locale*/ }: FullPageChatProps) {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 800); // Focus after animation completes
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const userMessage = { text: currentMessage, isUser: true };
      setChatMessages(prev => [...prev, userMessage]);
      setCurrentMessage('');
      setIsTyping(true);

      // Simulate AI response with typing indicator
      setTimeout(() => {
        setIsTyping(false);
        const responses = [
          "I'd be happy to help you find the perfect job! Can you tell me about your experience and what type of role you're looking for?",
          "Great! I can see you're interested in job opportunities. What industry or field are you most passionate about?",
          "Thanks for sharing that with me. Based on what you've told me, I think there are some excellent opportunities that match your profile. Let me search our database...",
          "I found several positions that align with your skills and experience. Would you like me to show you the top matches?",
          "Perfect! Let me know if you'd like to apply to any of these positions or if you need help with your resume and interview preparation."
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setChatMessages(prev => [...prev, { text: randomResponse, isUser: false }]);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl animate-in fade-in duration-700">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">AI Job Assistant</h1>
                <p className="text-gray-300 text-sm">Online • Ready to help you find your dream job</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 flex items-center justify-center group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="pt-24 pb-24 h-full flex flex-col max-w-4xl mx-auto px-6">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-6 py-6">
          {chatMessages.length === 0 ? (
            <div className="text-center py-12 animate-in slide-in-from-bottom-4 duration-700">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-white text-2xl font-bold mb-2">Welcome to AI Job Assistant</h2>
              <p className="text-gray-400 text-lg max-w-md mx-auto">
                I&apos;m here to help you find your perfect job match. Tell me about your skills, experience, and what you&apos;re looking for!
              </p>
            </div>
          ) : (
            chatMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`flex space-x-3 max-w-2xl ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!message.isUser && (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`px-6 py-4 rounded-2xl shadow-lg ${
                      message.isUser
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md'
                        : 'bg-white/10 backdrop-blur-sm text-gray-100 rounded-bl-md border border-white/10'
                    }`}
                  >
                    <p className="text-base leading-relaxed">{message.text}</p>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex space-x-3 max-w-2xl">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl rounded-bl-md border border-white/10">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-xl -mx-6 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me about your job search..."
                  className="w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-2">
                  <button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || isTyping}
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <p className="text-gray-500 text-sm">Press Enter to send • AI-powered job matching</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}