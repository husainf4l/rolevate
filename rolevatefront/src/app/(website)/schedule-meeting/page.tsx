"use client";

import Button from "../../../components/ui/Button";


export default function ScheduleMeetingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Schedule a <span className="text-[#00C6AD]">Consultation</span>
          </h1>
          <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto">
            Ready to implement{" "}
            <span className="text-[#00C6AD] font-medium">ROLEVATE AI</span> in your
            organization? Connect with our financial solutions specialist
          </p>
        </div>

        <div className="bg-[#1E293B] p-8 rounded-xl border border-[#334155] max-w-2xl mx-auto mb-12">
          <h3 className="text-2xl font-bold mb-6 text-center">
            The <span className="text-[#00C6AD]">ROLEVATE AI</span> Advantage
          </h3>

          <div className="space-y-4 mb-8">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-[#0F172A] rounded-full flex items-center justify-center mr-4 text-[#00C6AD] font-bold flex-shrink-0 mt-1">
                ✓
              </div>
              <div>
                <h4 className="font-semibold mb-1">Streamlined Implementation</h4>
                <p className="text-[#94A3B8] text-sm">
                  Quick deployment with minimal disruption to your existing hiring
                  workflow
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-[#0F172A] rounded-full flex items-center justify-center mr-4 text-[#00C6AD] font-bold flex-shrink-0 mt-1">
                ✓
              </div>
              <div>
                <h4 className="font-semibold mb-1">Customized Pricing</h4>
                <p className="text-[#94A3B8] text-sm">
                  Flexible plans designed specifically for financial institutions of
                  all sizes
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-[#0F172A] rounded-full flex items-center justify-center mr-4 text-[#00C6AD] font-bold flex-shrink-0 mt-1">
                ✓
              </div>
              <div>
                <h4 className="font-semibold mb-1">Dedicated Support</h4>
                <p className="text-[#94A3B8] text-sm">
                  Ongoing assistance and training for your HR team throughout
                  implementation
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#0F172A] rounded-lg border border-[#334155] text-center">
            <h4 className="font-bold mb-4">Ready to Transform Your Hiring Process?</h4>
            <Button 
              variant="primary" 
              className="w-full mb-3"
            >
              Request Consultation
            </Button>
            <p className="text-xs text-[#94A3B8]">
              Our specialists will prepare a tailored solution based on your
              organization's requirements
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
