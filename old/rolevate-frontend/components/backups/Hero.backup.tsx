"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Button from "../ui/Button";

/**
 * BACKUP FILE: Original Hero component version
 * Created on: [Current Date]
 * This file is maintained for backup purposes in case rollback is needed.
 */

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative bg-[#0F172A] text-[#F8FAFC] py-16 md:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div
            className={`transition-all duration-700 ease-in-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="inline-block bg-[#1E293B] rounded-full px-4 py-1 border border-[#334155] mb-4">
              <span className="text-[#00C6AD] font-medium text-sm flex items-center">
                <span className="w-2 h-2 bg-[#00C6AD] rounded-full mr-2"></span>
                Bilingual Support: Arabic & English
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="block">AI-Powered</span>
              <span className="block text-[#00C6AD]">Banking Recruitment</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#94A3B8] mb-6 max-w-xl">
              <span className="text-[#00C6AD] font-semibold">ROLEVATE AI</span> transforms hiring
              with automated interviews for financial institutions. From CV processing to comprehensive
              reporting—efficient, accurate, and designed for the Middle East.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                href="/try-it-now"
                variant="primary"
                aria-label="Try ROLEVATE AI now"
              >
                Try Demo
                <svg
                  className="ml-2 w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>

              <Button
                href="/schedule-meeting"
                variant="secondary"
                aria-label="Schedule a meeting with ROLEVATE AI team"
              >
                Schedule a Meeting
                <svg
                  className="ml-2 w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>
          </div>

          <div
            className={`relative transition-all duration-1000 ease-in-out order-first lg:order-last mb-8 lg:mb-0 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00C6AD] to-[#14B8A6] rounded-2xl opacity-10 blur-2xl"></div>
            <div className="relative bg-[#1E293B] p-2 rounded-xl shadow-lg border border-[#334155] max-w-sm mx-auto lg:max-w-none">
              <div className="absolute top-0 right-0 bg-[#1E293B] px-3 py-1 rounded-bl-lg rounded-tr-xl border-l border-b border-[#334155] text-[#00C6AD] text-xs font-medium z-10">
                AI-POWERED
              </div>
              <Image
                src="/images/lailahero.png"
                alt="ROLEVATE AI virtual recruiter for Middle East banks"
                width={600}
                height={600}
                className="w-full h-auto rounded-lg"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-4 w-64 h-64 bg-[#00C6AD] rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-8 w-72 h-72 bg-[#14B8A6] rounded-full opacity-10 blur-3xl"></div>
    </section>
  );
}
