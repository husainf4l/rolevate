"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";

export default function TryItNowPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isApplyingForJob, setIsApplyingForJob] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const startJobApplication = () => {
    setIsApplyingForJob(true);
    // Scroll to top of the form
    window.scrollTo({
      top: document.querySelector('.application-form')?.getBoundingClientRect().top! + window.pageYOffset - 100,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Try{" "}
            <span className="text-[#00C6AD]">
              ROLEVATE AI
            </span>{" "}
            Now
          </h1>
          <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto">
            See how{" "}
            <span className="text-[#00C6AD] font-medium">
              ROLEVATE AI
            </span>{" "}
            can transform your banking recruitment process
          </p>
        </div>

        <div className="mb-16 application-form">
          <div className="bg-[#1E293B] p-8 rounded-xl border border-[#334155] max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">
              {isApplyingForJob ? (
                <>Apply for <span className="text-[#00C6AD]">Senior Relationship Manager</span> at Widd Bank</>
              ) : (
                <>Try{" "}<span className="text-[#00C6AD]">ROLEVATE AI</span>{" "}Demo</>
              )}
            </h3>

            {isApplyingForJob && (
              <div className="bg-[#0F172A] p-4 rounded-lg border border-[#334155] mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#1E293B] rounded-full flex items-center justify-center mr-3 text-[#00C6AD] text-xs font-bold flex-shrink-0">
                    <span>i</span>
                  </div>
                  <p className="text-[#94A3B8] text-sm">
                    <span className="text-[#00C6AD] font-medium">Application Note: </span>
                    You are applying for the Senior Relationship Manager position at Widd Bank. After submission, you'll experience ROLEVATE AI's interview process.
                  </p>
                </div>
              </div>
            )}

            {!isApplyingForJob && (
              <div className="bg-[#0F172A] p-4 rounded-lg border border-[#334155] mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#1E293B] rounded-full flex items-center justify-center mr-3 text-[#00C6AD] text-xs font-bold flex-shrink-0">
                    <span>i</span>
                  </div>
                  <p className="text-[#94A3B8] text-sm">
                    <span className="text-[#00C6AD] font-medium">Demo Note: </span>
                    For this demo, please provide both your phone number and CV. In
                    production, ROLEVATE AI will automatically extract contact
                    information from the uploaded CV, eliminating the need for
                    manual phone number entry.
                  </p>
                </div>
              </div>
            )}

            {!isSuccess ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-2"
                  >
                    Phone Number for WhatsApp Interview
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="e.g. 971501234567"
                      className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent text-[#F8FAFC]"
                      required
                    />
                  </div>
                  <p className="mt-2 text-xs text-[#94A3B8]">
                    Include country code (e.g., +971 for UAE, +966 for KSA)
                  </p>
                </div>

                <div>
                  <label htmlFor="cv" className="block text-sm font-medium mb-2">
                    Upload Your CV
                  </label>
                  <div className="relative">
                    <div className="w-full bg-[#0F172A] border border-[#334155] rounded-lg overflow-hidden">
                      <label className="flex items-center">
                        <div
                          className={`px-4 py-3 w-full flex items-center justify-between ${
                            fileName ? "text-[#F8FAFC]" : "text-[#94A3B8]"
                          }`}
                        >
                          <span className="truncate">
                            {fileName || "Select PDF, DOC, or DOCX file"}
                          </span>
                          <span className="bg-[#1E293B] text-[#00C6AD] text-sm font-medium py-1 px-3 rounded ml-2 whitespace-nowrap">
                            Browse
                          </span>
                        </div>
                        <input
                          type="file"
                          id="cv"
                          name="cv"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx"
                          className="sr-only"
                          required
                        />
                      </label>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-[#94A3B8]">
                    Accepted formats: PDF, DOC, DOCX
                  </p>
                </div>

                <div className="pt-4">
                  {isSubmitting ? (
                    <Button
                      variant="secondary"
                      disabled={true}
                      className="w-full"
                    >
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#00C6AD]"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                    >
                      {isApplyingForJob ? "Start Demo" : "Start Demo Interview"}
                    </Button>
                  )}
                </div>
              </form>
            ) : (
              <div className="bg-[#0F172A] p-6 rounded-lg border border-[#334155] text-center">
                <div className="w-16 h-16 bg-[#1E293B] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12L10 17L20 7"
                      stroke="#00C6AD"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-3 text-[#F8FAFC]">
                  {isApplyingForJob ? "Application Submitted!" : "Demo Request Submitted!"}
                </h4>
                <p className="text-[#94A3B8] mb-6">
                  You'll receive a WhatsApp message in the next{" "}
                  <span className="text-[#00C6AD] font-medium">5 minutes</span> to
                  begin your {isApplyingForJob ? "job interview" : "AI interview experience"}.
                </p>
                <p className="text-sm text-[#94A3B8]">
                  Please keep your phone nearby and be ready for the interview.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
