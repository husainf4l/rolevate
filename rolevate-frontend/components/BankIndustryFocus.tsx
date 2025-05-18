'use client';

import React, { useState, useEffect } from 'react';

// Job title cards with simulated scores
const jobTitles = [
  { title: "Branch Manager", score: 87 },
  { title: "Teller", score: 92 },
  { title: "Risk Analyst", score: 84 },
  { title: "Relationship Manager", score: 91 },
  { title: "Compliance Officer", score: 89 },
  { title: "Loan Officer", score: 86 },
];

const BankIndustryFocus = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('bank-industry-focus');
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  return (
    <section id="bank-industry-focus" className="bg-[#0F172A] text-[#F8FAFC] py-16 md:py-24 relative overflow-hidden">
      {/* Abstract background - vault door outlines */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] border-4 border-[#00C6AD]/30 rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] border-4 border-[#00C6AD]/20 rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-[200px] h-[200px] border-4 border-[#00C6AD]/10 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-shadow-lg">
            Tailored for the <span className="text-[#00C6AD]">Banking Industry</span>
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Rolevate was built with banking HR in mind — high-volume hiring, strict compliance, and bilingual candidate pools. 
            Whether you're hiring branch-level staff or corporate managers, Rolevate brings speed, accuracy, and professionalism.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Key Benefits Column */}
          <div 
            className={`transition-all duration-700 ease-out transform ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            }`}
          >
            <h3 className="text-2xl font-semibold mb-8 text-[#00C6AD]">Key Benefits for Banks</h3>
            <ul className="space-y-6">
              {[
                { icon: "🏦", text: "Supports roles from teller to Senior Relationship Manager" },
                { icon: "🗂", text: "Integrates with internal job posting systems" },
                { icon: "📈", text: "Enables faster branch staffing during expansion" },
                { icon: "📜", text: "Delivers structured reports for audit & compliance" },
                { icon: "🕌", text: "Arabic support for regional hiring" },
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 text-2xl mr-4">{item.icon}</span>
                  <span className="text-slate-200 text-lg">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Job Title Cards */}
          <div 
            className={`grid grid-cols-2 gap-4 transition-all duration-700 ease-out delay-300 transform ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}
          >
            {jobTitles.map((job, index) => (
              <div 
                key={index}
                className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/60 hover:border-[#00C6AD]/50 shadow-lg transition-all duration-300 group"
              >
                <div className="mb-3 text-lg font-medium text-slate-100 group-hover:text-[#00C6AD] transition-colors">
                  {job.title}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-slate-400 text-sm">Fit Score:</div>
                  <div className="text-[#00C6AD] font-bold">{job.score}%</div>
                </div>
                <div className="mt-2 w-full bg-slate-700/60 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#00C6AD] to-[#14B8A6] h-2 rounded-full" 
                    style={{ width: `${job.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BankIndustryFocus;
