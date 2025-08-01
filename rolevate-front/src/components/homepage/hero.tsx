import React from "react";
import Image from "next/image";
import { Button } from "@/components/common/Button";

export default function Hero() {
  return (
    <section className="w-full min-h-[70vh] bg-white flex items-center">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between py-6 px-6 lg:px-12">
        {/* Image Section - First on Mobile */}
        <div className="flex-1 flex items-center justify-center order-1 lg:order-2 mb-8 lg:mb-0 lg:ml-12">
          <div className="relative w-96 h-80 lg:w-[36rem] lg:h-[28rem]">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#13ead9]/8 via-white/15 to-[#0891b2]/8 rounded-[2.5rem] shadow-corporate backdrop-blur-sm border border-white/20"></div>
            <div className="absolute inset-4 rounded-[2rem] overflow-hidden shadow-inner">
              <Image
                src="/images/hero.png"
                alt="Professional Interview Platform"
                fill
                className="object-cover rounded-[2rem]"
                priority
                fetchPriority="high"
                sizes="(max-width: 768px) 384px, (max-width: 1024px) 576px, 576px"
                quality={85}
              />
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#13ead9] rounded-full shadow-corporate animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-[#0891b2] rounded-full shadow-corporate animate-pulse delay-1000"></div>
          </div>
        </div>

        {/* Text Section - Second on Mobile */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl order-2 lg:order-1">
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 bg-[#13ead9]/10 text-[#0891b2] text-sm font-semibold rounded-full border border-[#13ead9]/20">
              <span className="w-2 h-2 bg-[#13ead9] rounded-full mr-2 animate-pulse"></span>
              AI-Powered Platform
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1] px-2 sm:px-0">
            Land Your Dream Job{" "}
            <span
              className="bg-gradient-to-r from-[#13ead9] to-[#0891b2] bg-clip-text text-transparent font-bold"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              10x Faster
            </span>
          </h1>

          <p className="font-text text-lg lg:text-xl text-gray-600 mb-8 max-w-xl leading-relaxed px-2 sm:px-0">
            Transform your job search with AI-powered interviews and intelligent
            career matching. Connect with top employers across the Middle East
            faster than ever before.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-2 sm:px-0">
            <Button variant="hero-primary" size="md" href="/jobs">
              Explore Opportunities
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
