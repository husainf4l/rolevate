"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Button from "./ui/Button";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      className="relative text-[#F8FAFC] overflow-hidden bg-[#0F172A] lg:h-[calc(100vh-4rem)] lg:flex lg:items-center py-16 md:py-20 lg:py-0"
      itemScope
      itemType="http://schema.org/Service"
    >
      {/* Full background image - DESKTOP ONLY */}
      <div className="hidden lg:block absolute inset-0 w-full h-full z-0">
        <Image
          src="/images/lailafullhero.png"
          alt="Rolevate AI background: HR manager screening candidates"
          fill
          priority
          className="object-cover object-center"
          quality={90}
        />
      </div>

      {/* Content container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full lg:h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center w-full lg:h-full">
          {/* Text content block (glassmorphism card) */}
          <div
            className={`lg:col-span-1 backdrop-blur-lg bg-slate-800/30 rounded-2xl shadow-2xl border border-slate-700/50 p-6 sm:p-8 md:p-10 transition-all duration-700 ease-in-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`} // Reduced padding for a more standard size
          >
            <div className="inline-flex items-center bg-slate-700/50 rounded-full px-4 py-2 border border-slate-600/70 mb-5 shadow-md">
              <span className="w-2.5 h-2.5 bg-[#00C6AD] rounded-full mr-2.5"></span>
              <span className="text-[#00C6AD] font-medium text-sm tracking-wide">
                Bilingual Support: Arabic & English
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-shadow-lg">
              <span className="block">Revolutionize Hiring with AI.</span>
              <span className="block text-[#00C6AD] mt-1">
                Save Time. Find the Right Fit.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-xl leading-relaxed">
              Rolevate is a secure, AI-driven interview system engineered for
              banks — automating CV screening, top-talent outreach via WhatsApp,
              and bilingual interviews that score and shortlist candidates
              instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                href="/jobs"
                variant="primary"
                aria-label="Try ROLEVATE AI now - Browse Jobs"
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
        </div>
      </div>

      {/* Animated decorative blobs - slightly more subtle */}
      <div className="absolute top-1/4 left-4 lg:left-12 w-48 h-48 lg:w-56 lg:h-56 bg-[#00C6AD]/80 rounded-full opacity-5 blur-3xl z-10 animate-blob-slow"></div>
      <div className="absolute bottom-1/4 right-4 lg:right-12 w-56 h-56 lg:w-64 lg:h-64 bg-[#14B8A6]/80 rounded-full opacity-5 blur-3xl z-10 animate-blob-fast"></div>
    </section>
  );
}
