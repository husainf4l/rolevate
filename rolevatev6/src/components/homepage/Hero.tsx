import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section 
      id="main-content" 
      className="w-full min-h-[70vh] bg-white flex items-center"
      aria-label="Hero section"
    >
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between py-6 px-6 lg:px-12">
        {/* Image Section - First on Mobile */}
        <div className="flex-1 flex items-center justify-center order-1 lg:order-2 mb-8 lg:mb-0 lg:ml-12">
          <div className="relative w-96 h-80 lg:w-[36rem] lg:h-[28rem]">
            <div className="absolute inset-0 bg-white/10 rounded-sm shadow-lg backdrop-blur-sm border border-white/20"></div>
            <div className="absolute inset-4 rounded-sm overflow-hidden shadow-inner">
              <Image
                src="/images/hero.png"
                alt="Professional Interview Platform"
                fill
                className="object-cover rounded-sm"
                priority
                sizes="(max-width: 768px) 384px, (max-width: 1024px) 576px, 576px"
                quality={85}
              />
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-400 rounded-full shadow-lg"></div>
            <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-cyan-600 rounded-full shadow-lg"></div>
          </div>
        </div>

        {/* Text Section - Second on Mobile */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl order-2 lg:order-1">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1] px-2 sm:px-0">
            Land Your Dream Job{" "}
            <span className="text-cyan-600 font-bold">
              10x Faster
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-xl leading-relaxed px-2 sm:px-0">
            Transform your job search with AI-powered interviews and intelligent
            career matching. Connect with top employers across the Middle East
            faster than ever before.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-2 sm:px-0">
            <Link href="/jobs" className="px-6 py-3 rounded-sm shadow-lg text-base font-semibold bg-cyan-600 hover:bg-cyan-700 text-white transition-all duration-300 hover:shadow-xl hover:scale-105 text-center">
              Explore Opportunities
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}