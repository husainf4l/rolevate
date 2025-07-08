import React from "react";

export default function CorporateFeatures() {
  return (
    <div className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 max-w-4xl mx-auto">
        
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2 sm:px-0">
            Transform Your Recruitment with 
            <span 
              className="bg-gradient-to-r from-[#13ead9] to-[#0891b2] bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}> AI-Powered Intelligence</span>
          </h2>
          <p className="font-text text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto px-4 sm:px-2 lg:px-0">
            From CV screening to final interviews, Rolevate ensures your HR team focuses only on top, qualified talent through intelligent automation designed for enterprise-scale recruitment.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-24">
          <div className="text-center group">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl font-bold text-primary-600 mb-2">100x</div>
              <div className="text-sm font-semibold text-gray-700">Faster Screening</div>
            </div>
          </div>
          <div className="text-center group">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl font-bold text-primary-600 mb-2">90%</div>
              <div className="text-sm font-semibold text-gray-700">Time Reduction</div>
            </div>
          </div>
          <div className="text-center group">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
              <div className="text-sm font-semibold text-gray-700">Availability</div>
            </div>
          </div>
          <div className="text-center group">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
              <div className="text-sm font-semibold text-gray-700">Consistency</div>
            </div>
          </div>
        </div>

        {/* Process Flow */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h3 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              See It In Action
            </h3>
            <p className="font-text text-lg text-gray-600 max-w-2xl mx-auto">
              Our streamlined process transforms recruitment from days to hours
            </p>
          </div>
          
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-primary-600/30 to-transparent hidden lg:block"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <ProcessStep 
                number="01" 
                icon={<CVIcon />}
                title="AI CV Screening" 
                description="Intelligent analysis of resumes with instant scoring and ranking"
              />
              <ProcessStep 
                number="02" 
                icon={<WhatsAppIcon />}
                title="WhatsApp Outreach" 
                description="Automated candidate engagement through preferred communication channels"
              />
              <ProcessStep 
                number="03" 
                icon={<InterviewIcon />}
                title="Smart Virtual Interview" 
                description="AI-powered interviews in English and Arabic with comprehensive evaluation"
              />
              <ProcessStep 
                number="04" 
                icon={<ReportIcon />}
                title="Final Fit Score Report" 
                description="Comprehensive candidate assessment with actionable insights"
              />
            </div>
          </div>
        </div>

        {/* Enterprise Features */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h3 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Features
            </h3>
            <p className="font-text text-lg text-gray-600 max-w-2xl mx-auto">
              Built for scale, security, and seamless integration with your existing systems
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<IntegrationIcon />}
              title="Seamless Integration"
              description="Connect with your existing ATS, HRIS, and job boards without disruption"
              gradient="from-blue-500 to-primary-600"
            />
            <FeatureCard 
              icon={<SecurityIcon />}
              title="Bank-Grade Security"
              description="SOC 2 compliant with end-to-end encryption and audit trails"
              gradient="from-primary-600 to-teal-500"
            />
            <FeatureCard 
              icon={<ScaleIcon />}
              title="Enterprise Scale"
              description="Handle thousands of applications simultaneously across multiple regions"
              gradient="from-teal-500 to-green-500"
            />
            <FeatureCard 
              icon={<AnalyticsIcon />}
              title="Advanced Analytics"
              description="Real-time insights and predictive analytics for better hiring decisions"
              gradient="from-purple-500 to-primary-600"
            />
            <FeatureCard 
              icon={<ComplianceIcon />}
              title="Compliance Ready"
              description="Built-in compliance features for regulated industries and audit requirements"
              gradient="from-primary-600 to-slate-600"
            />
            <FeatureCard 
              icon={<SupportIcon />}
              title="24/7 Support"
              description="Dedicated enterprise support with guaranteed response times"
              gradient="from-orange-500 to-red-500"
            />
          </div>
        </div>

        {/* Problem vs Solution */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-gray-200/50">
          <div className="text-center mb-16">
            <h3 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              The Enterprise Challenge
            </h3>
            <p className="font-text text-lg text-gray-600 max-w-2xl mx-auto">
              Traditional recruitment processes can't scale with modern business demands
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mt-1">
                  <span className="text-red-600 text-sm">✕</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Volume Overwhelm</h4>
                  <p className="text-gray-600">Thousands of CVs with no efficient way to identify top talent</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mt-1">
                  <span className="text-red-600 text-sm">✕</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Inconsistent Quality</h4>
                  <p className="text-gray-600">Variable interview standards leading to biased hiring decisions</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mt-1">
                  <span className="text-red-600 text-sm">✕</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Slow Time-to-Hire</h4>
                  <p className="text-gray-600">Lengthy processes that lose top candidates to competitors</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mt-1">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">AI-Powered Efficiency</h4>
                  <p className="text-gray-600">Instant CV analysis and ranking with 99% accuracy</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mt-1">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Standardized Excellence</h4>
                  <p className="text-gray-600">Consistent, bias-free interviews with comprehensive evaluation</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mt-1">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Rapid Deployment</h4>
                  <p className="text-gray-600">Reduce hiring time from weeks to hours with automated workflows</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessStep({ number, icon, title, description }: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative group">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
          {number}
        </div>
        <div className="w-16 h-16 bg-primary-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600/20 transition-colors duration-300">
          {icon}
        </div>
        <h4 className="font-semibold text-gray-900 mb-3 text-lg">{title}</h4>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className={`w-14 h-14 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <h4 className="font-semibold text-gray-900 mb-3 text-lg">{title}</h4>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// Enhanced SVG Icons
function CVIcon() {
  return (
    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function InterviewIcon() {
  return (
    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function IntegrationIcon() {
  return (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function SecurityIcon() {
  return (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function ComplianceIcon() {
  return (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zM12 6.75a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5z" />
    </svg>
  );
}