import React from "react";
import Image from "next/image";

export default function CorporateHero() {
  return (
    <section className="w-full min-h-[70vh] container mx-auto flex flex-col lg:flex-row items-center justify-between  py-6 md:py-12 px-4 md:px-6 mt-8 md:mt-12">
      {/* Image Section - First on Mobile */}
      <div className="flex-1 flex items-center justify-center order-1 lg:order-2 mb-8 lg:mb-0 lg:ml-12">
        <div className="relative w-80 h-64 sm:w-96 sm:h-72 lg:w-[32rem] lg:h-96">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#13ead9]/8 via-white/15 to-[#0891b2]/8 rounded-[2rem] shadow-lg backdrop-blur-sm border border-white/20"></div>
          <div className="absolute inset-3 rounded-[1.5rem] overflow-hidden shadow-inner">
            <Image
              src="/images/hero.png"
              alt="Enterprise AI Recruitment Platform"
              fill
              className="object-cover rounded-[1.5rem]"
              priority
            />
          </div>
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#13ead9] rounded-full shadow-md animate-pulse"></div>
          <div className="absolute -bottom-4 -left-4 w-5 h-5 bg-[#0891b2] rounded-full shadow-md animate-pulse delay-1000"></div>
        </div>
      </div>
      
      {/* Text Section - Second on Mobile */}
      <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl order-2 lg:order-1">
        <div className="mb-4 md:mb-6">
          <span className="inline-block px-4 py-2 bg-[#13ead9]/10 text-[#0891b2] text-sm font-semibold rounded-full border border-[#13ead9]/20">
            Enterprise Solution
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 tracking-tight leading-tight px-2 sm:px-0" 
            style={{ fontFamily: "'SF Pro Display', Inter, 'Segoe UI', Roboto, Arial, sans-serif" }}>
          Interview Candidates{" "}
          <span 
            className="bg-gradient-to-r from-[#13ead9] to-[#0891b2] bg-clip-text text-transparent font-bold"
            style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            100x Faster
          </span>
        </h1>
        
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 md:mb-8 max-w-xl leading-relaxed font-normal px-2 sm:px-0">
          Transform your recruitment process with AI-powered interviews, comprehensive candidate analysis, and complete A-to-Z recruitment management.
        </p>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 md:mb-10 w-full max-w-xl px-2 sm:px-0">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <div className="w-2 h-2 bg-[#13ead9] rounded-full"></div>
            <span className="font-medium">Proper Analysis</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <div className="w-2 h-2 bg-[#0891b2] rounded-full"></div>
            <span className="font-medium">End-to-End Process</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <div className="w-2 h-2 bg-[#13ead9] rounded-full"></div>
            <span className="font-medium">Enterprise Scale</span>
          </div>
        </div>
        
   
      </div>
    </section>
  );
}