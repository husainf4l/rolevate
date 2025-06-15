import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rolevate v0.72.0 - Demo Release Summary | AI Recruitment Platform",
  description: "Discover what's new in Rolevate v0.72.0 - Multi-company onboarding, subscription platform, multilingual support, and AI-powered recruitment tools for the Middle East.",
  keywords: "Rolevate release, AI recruitment, HR platform, multilingual hiring, Middle East recruitment, demo release",
  openGraph: {
    title: "Rolevate v0.72.0 - Demo Release Summary",
    description: "Discover what's new in Rolevate v0.72.0 - AI-powered recruitment platform with multilingual support for the Middle East.",
    type: "website",
  },
};

export default function ReleaseSummary() {
  return (
    <main className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
            Rolevate v0.72.0
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-100 mb-4">
            Demo Release Summary
          </h2>
          <p className="text-lg text-gray-300 mb-2">
            Release Date: June 14, 2025
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mx-auto"></div>
        </div>

        {/* Vision Section */}
        <section className="mb-12">
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h3 className="text-2xl font-bold mb-4 text-gray-100">
              Vision
            </h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              We're redefining recruitment for the Middle East. Rolevate empowers HR teams with intelligent, 
              AI-driven tools to create job posts, analyze candidates, and conduct interviews—faster, smarter, 
              and in Arabic, English, or any language needed.
            </p>
          </div>
        </section>

        {/* What We've Delivered Section */}
        <section className="mb-12">
          <h3 className="text-3xl font-bold mb-8 text-gray-100">
            What We've Delivered
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Multi-Company Onboarding",
                description: "Full data isolation for enterprise security"
              },
              {
                title: "Subscription Platform",
                description: "Free, Premium, and Enterprise tiers"
              },
              {
                title: "Multilingual Support",
                description: "Fluent operation in Arabic and English"
              },
              {
                title: "Real-Time Voice Interviews",
                description: "AI-powered interview assistants"
              },
              {
                title: "AI Job Post Creation",
                description: "Conversational AI or traditional forms"
              },
              {
                title: "Candidate Scoring",
                description: "Resume analysis and tracking system"
              },
              {
                title: "Modern HR Dashboard",
                description: "Manage jobs, candidates, and interviews"
              },
              {
                title: "Analytics Dashboard",
                description: "Powerful insights for hiring performance optimization"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors duration-300">
                <h4 className="text-lg font-semibold text-gray-100 mb-2">{feature.title}</h4>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What's Coming Next Section */}
        <section className="mb-12">
          <h3 className="text-3xl font-bold mb-8 text-gray-100">
            What's Coming Next
          </h3>
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <div className="space-y-6">
              {[
                {
                  title: "AI-Driven Candidate Ranking",
                  description: "Automated interview evaluation with intelligent scoring"
                },
                {
                  title: "Smart Onboarding Workflows",
                  description: "Streamlined processes for HR teams and recruiters"
                },
                {
                  title: "AI-Powered Organizational Planning",
                  description: "Team optimization and role reallocation based on KPIs and performance data"
                }
              ].map((feature, index) => (
                <div key={index} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <h4 className="text-lg font-semibold text-gray-100 mb-1">{feature.title}</h4>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Ready Section */}
        <section className="text-center mb-12">
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h3 className="text-2xl font-bold mb-4 text-gray-100">Demo Ready</h3>
            <p className="text-lg mb-6 text-gray-300">
              Rolevate is now demo-ready for investors, partners, and early clients.
            </p>
            <p className="text-xl font-semibold text-gray-100">
              We're shaping the future of hiring—efficient, intelligent, and truly multilingual.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <div className="bg-gray-800 rounded-lg p-10 border border-gray-700">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold mb-4 text-gray-100">Experience Rolevate</h3>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Schedule a personalized demonstration of our AI-powered recruitment platform with our executive team.
              </p>
            </div>
            
            {/* Executive Contact Information */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-750 rounded-xl p-10 border border-gray-600 shadow-xl">
                <div className="text-center mb-8">
                  <h4 className="text-2xl font-semibold text-gray-100 mb-3">Executive Contact</h4>
                  <div className="w-20 h-0.5 bg-teal-500 mx-auto"></div>
                </div>
                
                {/* Executive Profile Card */}
                <div className="bg-gray-700 rounded-2xl p-8 border border-gray-600 mb-8">
                  <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                    {/* Professional Photo */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden border-3 border-teal-500 shadow-2xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 p-1">
                          <img 
                            src="/images/diab.jpeg" 
                            alt="Ibrahim Diab - Co-Founder & CEO"
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                        {/* Professional badge */}
                        <div className="absolute -bottom-2 -right-2 bg-teal-500 rounded-full p-2 shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Executive Information */}
                    <div className="flex-1 text-center lg:text-left">
                      <div className="mb-6">
                        <h5 className="text-2xl font-bold text-gray-100 mb-2">Ibrahim Diab</h5>
                        <p className="text-teal-400 font-semibold text-lg mb-3">Co-Founder & Chief Executive Officer</p>
                        <p className="text-gray-300 leading-relaxed">
                          Leading Rolevate's mission to revolutionize recruitment across the Middle East with cutting-edge AI technology and multilingual capabilities.
                        </p>
                      </div>
                      
                      {/* Contact Methods Grid */}
                      <div className="grid sm:grid-cols-3 gap-4">
                        <a 
                          href="mailto:Idiab@rolevate.com" 
                          className="flex items-center justify-center lg:justify-start gap-3 p-3 bg-gray-600 rounded-lg hover:bg-gray-500 transition-all duration-200 group"
                        >
                          <div className="w-5 h-5 text-gray-400 group-hover:text-teal-400">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                            </svg>
                          </div>
                          <span className="text-gray-300 group-hover:text-white text-sm font-medium">Email</span>
                        </a>
                        
                        <a 
                          href="tel:+962798888394" 
                          className="flex items-center justify-center lg:justify-start gap-3 p-3 bg-gray-600 rounded-lg hover:bg-gray-500 transition-all duration-200 group"
                        >
                          <div className="w-5 h-5 text-gray-400 group-hover:text-teal-400">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                            </svg>
                          </div>
                          <span className="text-gray-300 group-hover:text-white text-sm font-medium">Call</span>
                        </a>
                        
                        <a 
                          href="https://www.linkedin.com/in/ibraheem-diab-904415aa/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center lg:justify-start gap-3 p-3 bg-gray-600 rounded-lg hover:bg-gray-500 transition-all duration-200 group"
                        >
                          <div className="w-5 h-5 text-gray-400 group-hover:text-teal-400">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"/>
                            </svg>
                          </div>
                          <span className="text-gray-300 group-hover:text-white text-sm font-medium">LinkedIn</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
             
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-10 py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                Request Demo
              </button>
              <button className="border-2 border-teal-500 text-teal-400 hover:bg-teal-600 hover:text-white hover:border-teal-600 font-semibold px-10 py-4 rounded-lg transition-all duration-200">
                Schedule Meeting
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
