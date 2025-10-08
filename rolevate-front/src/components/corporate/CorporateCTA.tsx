import React from "react";

export default function CorporateCTA() {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Elegant Gradient Overlays - Responsive */}
      <div className="absolute top-10 left-5 sm:top-20 sm:left-20 w-48 h-48 sm:w-96 sm:h-96 bg-primary-600/3 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-5 sm:bottom-20 sm:right-20 w-56 h-56 sm:w-96 sm:h-96 bg-brand-teal-light/3 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative">
        <div className="max-w-7xl mx-auto">
          
          {/* Executive Header */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
         
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 sm:mb-8 leading-[1.1] tracking-tight px-2 sm:px-0">
              Ready to Transform Your
              <br className="hidden sm:block" />
              <span 
                className="bg-gradient-to-r from-[#13ead9] to-[#0891b2] bg-clip-text text-transparent"
                style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}> Recruitment Strategy?</span>
            </h2>
            
            <p className="font-text text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto px-4 sm:px-2 lg:px-0">
              Join 500+ enterprise organizations that have revolutionized their hiring process. 
              Experience measurable results within the first 24 hours of implementation.
            </p>
          </div>

          {/* Executive Action Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16 lg:mb-20">
            
            {/* Primary Executive Action */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-transparent to-brand-teal-light/10 rounded-sm blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-sm sm:rounded-sm p-6 sm:p-8 lg:p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-600 to-brand-teal-light rounded-xl sm:rounded-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Executive Consultation</h3>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                      Schedule a strategic session with our enterprise team for a personalized assessment and implementation roadmap.
                    </p>
                  </div>
                </div>

                {/* Executive Benefits */}
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium text-sm sm:text-base">30-minute strategic assessment</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium text-sm sm:text-base">Custom ROI projection & business case</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium text-sm sm:text-base">Implementation timeline & resource planning</span>
                  </div>
                </div>

             
              </div>
            </div>

            {/* Secondary Enterprise Action */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-600/5 via-transparent to-gray-600/5 rounded-sm blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-sm p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-gray-600 rounded-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Enterprise Resource Kit</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Access comprehensive implementation guides, ROI calculators, and enterprise case studies.
                    </p>
                  </div>
                </div>

                {/* Resource Benefits */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">Enterprise implementation playbook</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">ROI calculator & business case templates</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">Banking & finance success stories</span>
                  </div>
                </div>

      
              </div>
            </div>
          </div>

          {/* Enterprise Metrics Dashboard */}
          <div className="bg-white/70 backdrop-blur-sm rounded-sm sm:rounded-sm p-6 sm:p-8 lg:p-12 shadow-xl border border-gray-100/50 mb-12 sm:mb-16">
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Trusted by Enterprise Leaders</h3>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
                Join organizations that have transformed their recruitment with measurable, enterprise-scale results
              </p>
            </div>
            
     
          </div>       
        </div>
      </div>
    </section>
  );
}

