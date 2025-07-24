import React from "react";
import { Button } from "@/components/common/Button";

export default function About() {
  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="w-full min-h-[60vh] bg-white flex items-center">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between py-12 px-6 lg:px-12">
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-[#13ead9]/10 text-[#0891b2] text-sm font-semibold rounded-full border border-[#13ead9]/20">
                <span className="w-2 h-2 bg-[#13ead9] rounded-full mr-2 animate-pulse"></span>
                About Rolevate
              </span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1] px-2 sm:px-0">
              Revolutionizing{" "}
              <span 
                className="bg-gradient-to-r from-[#13ead9] to-[#0891b2] bg-clip-text text-transparent font-bold"
                style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Career Connections
              </span>
            </h1>
            
            <p className="font-text text-lg lg:text-xl text-gray-600 mb-8 max-w-xl leading-relaxed px-2 sm:px-0">
              At Rolevate, we&apos;re transforming how talent meets opportunity in the Middle East. 
              Our AI-powered platform connects exceptional candidates with leading companies through 
              intelligent matching and seamless interview experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-2 sm:px-0">
              <Button 
                variant="hero-primary" 
                size="md"
                href="/jobs"
              >
                Start Your Journey
              </Button>
              <Button 
                variant="hero-secondary" 
                size="md"
                href="/contact"
              >
                Get in Touch
              </Button>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center order-1 lg:order-2 mb-8 lg:mb-0 lg:ml-12">
            <div className="relative w-96 h-80 lg:w-[36rem] lg:h-[28rem]">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#13ead9]/8 via-white/15 to-[#0891b2]/8 rounded-[2.5rem] shadow-corporate backdrop-blur-sm border border-white/20"></div>
              <div className="absolute inset-4 rounded-[2rem] overflow-hidden shadow-inner bg-gradient-to-br from-[#13ead9]/10 to-[#0891b2]/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered</h3>
                  <p className="text-gray-600">Innovation at the core</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#13ead9] rounded-full shadow-corporate animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-[#0891b2] rounded-full shadow-corporate animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-50/50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="font-text text-xl text-gray-600 leading-relaxed mb-12">
              To bridge the gap between exceptional talent and innovative companies across the Middle East, 
              creating meaningful career opportunities through cutting-edge technology and human insight.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-semibold text-gray-900 mb-3">For Talent</h3>
                <p className="font-text text-gray-600">
                  Empowering job seekers with AI-driven matching, personalized career guidance, and seamless application experiences.
                </p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-semibold text-gray-900 mb-3">For Companies</h3>
                <p className="font-text text-gray-600">
                  Helping businesses find the right talent faster with intelligent screening, automated interviews, and data-driven insights.
                </p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
                <p className="font-text text-gray-600">
                  Leveraging cutting-edge AI and machine learning to create the most efficient and fair hiring process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Our Values
              </h2>
              <p className="font-text text-xl text-gray-600 max-w-3xl mx-auto">
                These core principles guide everything we do and shape how we build the future of recruitment.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#13ead9]/20 to-[#0891b2]/20 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-[#0891b2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">Integrity</h3>
                <p className="font-text text-gray-600 text-sm">
                  Transparency and honesty in all interactions
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#13ead9]/20 to-[#0891b2]/20 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-[#0891b2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="font-text text-gray-600 text-sm">
                  Pushing boundaries with cutting-edge technology
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#13ead9]/20 to-[#0891b2]/20 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-[#0891b2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">Empathy</h3>
                <p className="font-text text-gray-600 text-sm">
                  Understanding and supporting every user's journey
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#13ead9]/20 to-[#0891b2]/20 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-[#0891b2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">Excellence</h3>
                <p className="font-text text-gray-600 text-sm">
                  Delivering exceptional results in everything we do
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#13ead9]/5 to-[#0891b2]/5">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="font-text text-xl text-gray-600 mb-8">
              Join thousands of professionals who have found their dream jobs through Rolevate&apos;s AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero-primary" 
                size="md"
                href="/jobs"
              >
                Browse Opportunities
              </Button>
              <Button 
                variant="hero-secondary" 
                size="md"
                href="/contact"
              >
                Partner with Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}