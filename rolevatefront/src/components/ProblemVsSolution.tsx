'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

const ProblemVsSolution = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="bg-gray-900 text-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-shadow-lg">
            <span className="text-teal-400">Problem</span> vs <span className="text-teal-400">Solution</span>
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-gray-300">
            Why banks need a better approach to hiring
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Problem Side */}
          <div 
            className={`bg-gradient-to-br from-gray-800/30 to-gray-700/10 p-6 sm:p-8 rounded-2xl border border-gray-700/50 shadow-2xl 
            transition-all duration-700 ease-in-out transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 bg-gray-700/30 rounded-full flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-10 w-10 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-300 mb-6 text-center">The Problem</h3>
            <ul className="space-y-5">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-700/50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-gray-400">📉</span>
                </span>
                <span className="text-gray-200"><span className="font-semibold text-gray-300">Too many CVs</span>, not enough time to review them all properly</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-700/50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-gray-400">🧭</span>
                </span>
                <span className="text-gray-200"><span className="font-semibold text-gray-300">Inconsistent interview quality</span> depending on interviewer availability and bias</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-700/50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-gray-400">📋</span>
                </span>
                <span className="text-gray-200"><span className="font-semibold text-gray-300">Manual shortlisting</span> leads to inefficiency and wasted resources</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-700/50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-gray-400">📱</span>
                </span>
                <span className="text-gray-200"><span className="font-semibold text-gray-300">No integration</span> with WhatsApp or modern communication channels</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-700/50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-gray-400">⏳</span>
                </span>
                <span className="text-gray-200"><span className="font-semibold text-gray-300">Long time-to-hire</span> leads to losing top talent to competitors</span>
              </li>
            </ul>
        
          </div>

          {/* Solution Side */}
          <div 
            className={`bg-gradient-to-br from-teal-600/30 to-teal-500/10 p-6 sm:p-8 rounded-2xl border border-teal-600/50 shadow-2xl
            transition-all duration-700 ease-in-out transform delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 bg-teal-600/30 rounded-full flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-10 w-10 text-teal-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-teal-400 mb-6 text-center">The Solution</h3>
            <ul className="space-y-5">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-teal-600/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-teal-400">⚡</span>
                </span>
                <span className="text-gray-200"><span className="font-semibold text-teal-400">Instant AI CV scoring</span> identifies qualified candidates immediately</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-teal-600/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-teal-400">🤖</span>
                </span>
                <span className="text-gray-200"><span className="font-semibold text-teal-400">Consistent, unbiased interviews</span> with standardized questions and evaluation</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-teal-600/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-teal-400">📲</span>
                </span>
                <span className="text-gray-200"><span className="font-semibold text-teal-400">Smart WhatsApp communication</span> engages candidates on their preferred platform</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-teal-600/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-teal-400">📊</span>
                </span>
                <span className="text-gray-200"><span className="font-semibold text-teal-400">Transparent fit scores</span> with data-driven insights on each candidate</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-teal-600/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-teal-400">🔄</span>
                </span>
                <span className="text-gray-200"><span className="font-semibold text-teal-400">Full automation</span> of early-stage hiring processes saves weeks of time</span>
              </li>
            </ul>
        
          </div>
        </div>

        <div className="text-center mt-12 md:mt-16 max-w-3xl mx-auto">
          <p className="text-lg md:text-xl text-[#00C6AD]">
            Modernize your recruitment process with Rolevate
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemVsSolution;
