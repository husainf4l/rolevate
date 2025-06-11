"use client";
import { useState } from "react";
import Button from "../../../components/ui/Button";

interface Interview {
  id: string;
  position: string;
  company: string;
  description: string;
  requirements: string[];
}

export default function TryItNowPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isApplyingForJob, setIsApplyingForJob] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null
  );

  const availableInterviews: Interview[] = [
    {
      id: "senior-rm-capital",
      position: "Senior Relationship Manager",
      company: "Capital Bank",
      description:
        "Lead relationship management for high-value corporate clients in the banking sector",
      requirements: [
        "5+ years banking experience",
        "Corporate relationship management",
        "Arabic & English fluency",
      ],
    },
    {
      id: "dotnet-developer-menaitech",
      position: ".NET Senior Developer",
      company: "Menaitech",
      description:
        "Develop and maintain enterprise-level .NET applications and systems",
      requirements: [
        ".NET Core/Framework",
        "C# programming",
        "SQL Server",
        "Azure cloud experience",
      ],
    },
    {
      id: "talent-manager-menaitech",
      position: "Talent Manager",
      company: "Menaitech",
      description:
        "Manage talent acquisition and development strategies for technology roles",
      requirements: [
        "HR/Talent management",
        "Technology recruitment",
        "Team leadership",
        "Performance management",
      ],
    },
    {
      id: "sales-abu-khader",
      position: "Indoor Sales Man",
      company: "Abu Khader Automotive",
      description:
        "Handle indoor sales operations and customer service for automotive products",
      requirements: [
        "Sales experience",
        "Customer service skills",
        "Automotive knowledge",
        "Communication skills",
      ],
    },
  ];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get the form and file input
      const form = e.currentTarget;
      const fileInput = form.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert("Please select a CV file");
        setIsSubmitting(false);
        return;
      }

      // Create FormData to send the file and phone number
      const formData = new FormData();
      formData.append("phone", phoneNumber);
      formData.append("file", fileInput.files[0]);

      // Send the data to the API
      const response = await fetch("https://widd.ai/webhook/rovate-cv-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form. Please try again.");
      setIsSubmitting(false);
    }
  };

  const startJobApplication = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsApplyingForJob(true);
    // Scroll to top of page for clean transition
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Try <span className="text-[#00C6AD]">ROLEVATE AI</span> Now
          </h1>
          <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto">
            See how{" "}
            <span className="text-[#00C6AD] font-medium">ROLEVATE AI</span> can
            transform your recruitment process
          </p>
        </div>

        {/* Available Interviews Section - Only show when no interview is selected */}
        {!isApplyingForJob && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Choose from Available{" "}
              <span className="text-[#00C6AD]">Demo Interviews</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {availableInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="bg-[#1E293B] p-6 rounded-xl border border-[#334155] hover:border-[#00C6AD] transition-colors"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">
                      {interview.position}
                    </h3>
                    <p className="text-[#00C6AD] font-medium mb-3">
                      {interview.company}
                    </p>
                    <p className="text-[#94A3B8] text-sm mb-4">
                      {interview.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-[#F8FAFC] mb-2">
                      Key Requirements:
                    </h4>
                    <ul className="space-y-1">
                      {interview.requirements.map((req, index) => (
                        <li
                          key={index}
                          className="text-xs text-[#94A3B8] flex items-center"
                        >
                          <span className="w-1 h-1 bg-[#00C6AD] rounded-full mr-2"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => startJobApplication(interview)}
                  >
                    Apply for This Position
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Application Form - Only show when applying for a job */}
        {isApplyingForJob && selectedInterview && (
          <div className="mb-16 application-form">
            {/* Back Button */}
            <div className="mb-6 text-center">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsApplyingForJob(false);
                  setSelectedInterview(null);
                  setPhoneNumber("");
                  setFileName("");
                  setIsSuccess(false);
                }}
                className="inline-flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Interview Selection
              </Button>
            </div>

            <div className="bg-[#1E293B] p-8 rounded-xl border border-[#334155] max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Apply for{" "}
                <span className="text-[#00C6AD]">
                  {selectedInterview.position}
                </span>{" "}
                at {selectedInterview.company}
              </h3>

              <div className="bg-[#0F172A] p-4 rounded-lg border border-[#334155] mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#1E293B] rounded-full flex items-center justify-center mr-3 text-[#00C6AD] text-xs font-bold flex-shrink-0">
                    <span>i</span>
                  </div>
                  <p className="text-[#94A3B8] text-sm">
                    <span className="text-[#00C6AD] font-medium">
                      Application Note:{" "}
                    </span>
                    You are applying for the {selectedInterview.position}{" "}
                    position at {selectedInterview.company}. After submission,
                    you'll experience ROLEVATE AI's interview process.
                  </p>
                </div>
              </div>

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
                    <label
                      htmlFor="cv"
                      className="block text-sm font-medium mb-2"
                    >
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
                        Start Demo Interview
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
                    Application Submitted!
                  </h4>
                  <p className="text-[#94A3B8] mb-6">
                    You'll receive a WhatsApp message in the next{" "}
                    <span className="text-[#00C6AD] font-medium">
                      5 minutes
                    </span>{" "}
                    to begin your job interview.
                  </p>
                  <p className="text-sm text-[#94A3B8]">
                    Please keep your phone nearby and be ready for the
                    interview.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
