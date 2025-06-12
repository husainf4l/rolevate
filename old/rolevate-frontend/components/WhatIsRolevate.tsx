"use client";

import React from 'react';

// Placeholder for icons - replace with actual icons (e.g., from react-icons or SVGs)
const IconPlaceholder = ({ name }: { name: string }) => (
  <div className="w-12 h-12 bg-slate-700/50 border border-slate-600/70 rounded-lg flex items-center justify-center mb-3 text-[#00C6AD] text-2xl shadow-md">
    {/* Placeholder - e.g., name.substring(0, 1) or a generic icon */}
    {name.substring(0, 1)}
  </div>
);

interface FeatureItem {
  icon: string; // Icon name or placeholder
  label: string;
  description?: string; // Optional short description for each feature
}

const features: FeatureItem[] = [
  { icon: "CV", label: "AI CV Screening" },
  { icon: "WA", label: "WhatsApp Auto Outreach" },
  { icon: "AI", label: "Smart Virtual Interviews" },
  { icon: "FS", label: "Final Fit Score Report" },
  { icon: "Lang", label: "Arabic & English Support" },
  { icon: "Sec", label: "Secure & Bank-Compliant" },
];

export default function WhatIsRolevate() {
  return (
    <section className="bg-[#0F172A] text-[#F8FAFC] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-shadow-lg">
            Built for <span className="text-[#00C6AD]">Banks</span>. Powered by <span className="text-[#00C6AD]">AI</span>.
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Rolevate solves the hiring bottleneck in banks by automating the early stages of recruitment. From screening CVs to conducting AI-led interviews, Rolevate ensures your HR team focuses only on top, qualified talent.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800/40 p-6 rounded-xl shadow-2xl border border-slate-700/50 hover:border-[#00C6AD]/70 transition-all duration-300 ease-in-out transform hover:-translate-y-1 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <IconPlaceholder name={feature.icon} />
                  {/* Neon line effect - can be enhanced with pseudo-elements or more complex SVG */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#00C6AD] to-[#14B8A6] rounded-lg blur opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2 group-hover:text-[#00C6AD] transition-colors duration-300">
                  {feature.label}
                </h3>
                {/* Optional: Add feature.description here if needed */}
              </div>
            </div>
          ))}
        </div>

        {/* Visual Suggestion for Micro-animation - conceptual representation */}
        <div className="mt-16 md:mt-24 text-center">
          <h4 className="text-xl font-semibold text-slate-300 mb-4">See It In Action (Conceptual Flow)</h4>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-6 text-slate-400">
            <div className="p-3 bg-slate-700/50 rounded-lg shadow-md border border-slate-600/70">CV Screening</div>
            <span className="text-[#00C6AD] text-2xl font-bold">&rarr;</span>
            <div className="p-3 bg-slate-700/50 rounded-lg shadow-md border border-slate-600/70">WhatsApp Outreach</div>
            <span className="text-[#00C6AD] text-2xl font-bold">&rarr;</span>
            <div className="p-3 bg-slate-700/50 rounded-lg shadow-md border border-slate-600/70">AI Interview</div>
            <span className="text-[#00C6AD] text-2xl font-bold">&rarr;</span>
            <div className="p-3 bg-slate-700/50 rounded-lg shadow-md border border-slate-600/70">Score Report</div>
          </div>
          <p className="mt-4 text-sm text-slate-200">
            (This represents the automated flow. A micro-animation could visually demonstrate this sequence.)
          </p>
        </div>
      </div>
    </section>
  );
}
