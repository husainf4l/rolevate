"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/common/Button";

// Job data
const jobsData = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "Aramco Digital",
    location: "Riyadh, Saudi Arabia",
    type: "Full-time",
    salary: "25,000 - 35,000 SAR",
    skills: ["React", "Node.js", "TypeScript", "AWS", "GraphQL"],
    posted: "2 days ago",
    logo: "🏢",
    description: "Join Saudi Arabia's leading tech transformation initiative building next-generation digital solutions.",
    urgent: true,
  },
  {
    id: 2,
    title: "Product Manager",
    company: "Qatar Airways Group",
    location: "Doha, Qatar",
    type: "Full-time",
    salary: "18,000 - 25,000 QAR",
    skills: ["Product Strategy", "Analytics", "Leadership", "Agile", "Aviation Tech"],
    posted: "1 day ago",
    logo: "✈️",
    description: "Drive digital product innovation for Qatar's world-class airline and travel ecosystem.",
  },
  {
    id: 3,
    title: "UX Designer",
    company: "Zain Jordan",
    location: "Amman, Jordan",
    type: "Full-time",
    salary: "1,200 - 1,800 JOD",
    skills: ["Figma", "User Research", "Arabic UX", "Mobile Design"],
    posted: "3 days ago",
    logo: "📱",
    description: "Design innovative digital experiences for Jordan's leading telecommunications company.",
  },
  {
    id: 4,
    title: "Data Scientist",
    company: "NEOM Tech",
    location: "NEOM, Saudi Arabia",
    type: "Full-time",
    salary: "30,000 - 45,000 SAR",
    skills: ["Python", "Machine Learning", "Smart Cities", "IoT", "AI"],
    posted: "1 day ago",
    logo: "🌟",
    description: "Shape the future of smart cities with cutting-edge AI and data science at NEOM.",
    urgent: true,
  },
  {
    id: 5,
    title: "Digital Marketing Manager",
    company: "Careem",
    location: "Dubai, UAE / Remote",
    type: "Full-time",
    salary: "15,000 - 22,000 AED",
    skills: ["Digital Marketing", "Arabic Content", "Social Media", "Growth Hacking"],
    posted: "4 days ago",
    logo: "🚗",
    description: "Lead regional marketing campaigns for the Middle East's super app.",
  },
  {
    id: 6,
    title: "Cloud Solutions Architect",
    company: "Ooredoo Qatar",
    location: "Doha, Qatar",
    type: "Full-time",
    salary: "20,000 - 28,000 QAR",
    skills: ["AWS", "Azure", "5G Infrastructure", "Enterprise Solutions"],
    posted: "2 days ago",
    logo: "☁️",
    description: "Architect next-generation cloud and 5G solutions for Qatar's digital transformation.",
  },
  {
    id: 7,
    title: "Cybersecurity Specialist",
    company: "Dubai Police",
    location: "Dubai, UAE",
    type: "Full-time",
    salary: "18,000 - 28,000 AED",
    skills: ["Cybersecurity", "Threat Analysis", "Incident Response", "Arabic"],
    posted: "5 days ago",
    logo: "🛡️",
    description: "Protect Dubai's digital infrastructure with cutting-edge cybersecurity solutions.",
  },
  {
    id: 8,
    title: "AI Research Engineer",
    company: "KAUST",
    location: "Thuwal, Saudi Arabia",
    type: "Full-time",
    salary: "28,000 - 38,000 SAR",
    skills: ["Machine Learning", "Deep Learning", "Research", "Python", "TensorFlow"],
    posted: "3 days ago",
    logo: "🧠",
    description: "Advance AI research at one of the world's leading science and technology universities.",
  },
];

export default function JobApplyPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    cv: null as File | null,
    coverLetter: "",
    experience: "",
    portfolio: "",
  });

  // Get job details
  const jobId = parseInt(params.id as string);
  const job = jobsData.find(j => j.id === jobId);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, cv: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-3xl flex items-center justify-center">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Job Not Found</h1>
          <p className="text-gray-600 mb-8">The job you're looking for doesn't exist or has been removed.</p>
          <Button variant="primary" onClick={() => router.push('/jobs')}>
            Browse All Jobs
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
            Application Submitted!
          </h1>
          <p className="text-lg font-semibold text-gray-900 mb-2">{job.title}</p>
          <p className="text-gray-600 mb-8">{job.company}</p>
          <p className="text-gray-700 mb-8">Thank you for your application. Our team will review it and get back to you within 3-5 business days.</p>
          <div className="space-y-3">
            <Button variant="primary" onClick={() => router.push(`/jobs/${job.id}`)} className="w-full">
              View Job Details
            </Button>
            <Button variant="secondary" onClick={() => router.push('/jobs')} className="w-full">
              Browse More Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-[#0891b2] transition-colors group"
              >
                <div className="p-2 rounded-xl group-hover:bg-[#13ead9]/10 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <span className="font-medium">Back</span>
              </button>
              <div className="h-5 w-px bg-gray-300"></div>
              <h1 className="text-lg font-semibold text-gray-900">Job Application</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-[#0891b2] bg-[#13ead9]/10 px-3 py-2 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Secure Application</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Job Summary Card */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden sticky top-24">
              {/* Job Header */}
              <div className="bg-gradient-to-r from-[#0891b2] to-[#13ead9] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12"></div>
                <div className="relative">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                      {job.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold truncate">{job.title}</h2>
                      <p className="text-white/90 font-medium">{job.company}</p>
                    </div>
                    {job.urgent && (
                      <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-2 rounded-full text-xs font-bold animate-pulse shadow-lg">
                        URGENT
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-[#13ead9]/10 to-[#0891b2]/10 rounded-2xl">
                    <div className="w-10 h-10 bg-[#0891b2]/10 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#0891b2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{job.location}</p>
                      <p className="text-sm text-gray-600">{job.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-[#13ead9]/10 to-[#0891b2]/10 rounded-2xl">
                    <div className="w-10 h-10 bg-[#0891b2]/10 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#0891b2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-[#0891b2] text-lg">{job.salary}</p>
                      <p className="text-sm text-gray-600">Competitive package</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#0891b2] rounded-full"></div>
                    <span>Required Skills</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-gradient-to-r from-[#13ead9]/20 to-[#0891b2]/20 text-[#0891b2] px-3 py-2 rounded-xl text-sm font-semibold border border-[#0891b2]/20 hover:scale-105 transition-transform cursor-default"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-gray-50 to-[#13ead9]/5 rounded-2xl border border-[#0891b2]/10">
                  <p className="text-gray-700 leading-relaxed">{job.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-[#13ead9]/5 px-8 py-6 border-b border-gray-200/50">
                <h2 className="text-2xl font-bold text-gray-900">Submit Your Application</h2>
                <p className="text-gray-600 mt-1">Please fill out all required fields to complete your application</p>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <div className="w-6 h-6 bg-[#0891b2]/10 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-[#0891b2] rounded-full"></div>
                    </div>
                    <span>Personal Information</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#0891b2] focus:border-[#0891b2] transition-colors text-gray-900 placeholder-gray-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#0891b2] focus:border-[#0891b2] transition-colors text-gray-900 placeholder-gray-500"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#0891b2] focus:border-[#0891b2] transition-colors text-gray-900 placeholder-gray-500"
                      placeholder="+966 5XXXXXXXX"
                    />
                  </div>
                </div>

                {/* CV Upload */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <div className="w-6 h-6 bg-[#0891b2]/10 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-[#0891b2] rounded-full"></div>
                    </div>
                    <span>Documents</span>
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Resume/CV <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        required
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#0891b2] focus:border-[#0891b2] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#13ead9]/10 file:text-[#0891b2] hover:file:bg-[#13ead9]/20"
                      />
                    </div>
                    {formData.cv && (
                      <p className="text-sm text-[#0891b2] flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>File selected: {formData.cv.name}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Portfolio/Website <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.portfolio}
                      onChange={(e) => handleInputChange('portfolio', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#0891b2] focus:border-[#0891b2] transition-colors text-gray-900 placeholder-gray-500"
                      placeholder="https://your-portfolio.com"
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <div className="w-6 h-6 bg-[#0891b2]/10 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-[#0891b2] rounded-full"></div>
                    </div>
                    <span>Additional Information</span>
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Years of Experience
                    </label>
                    <select
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#0891b2] focus:border-[#0891b2] transition-colors text-gray-900"
                    >
                      <option value="">Select experience level</option>
                      <option value="0-1">0-1 years</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Cover Letter <span className="text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      rows={6}
                      value={formData.coverLetter}
                      onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#0891b2] focus:border-[#0891b2] transition-colors text-gray-900 placeholder-gray-500 resize-none"
                      placeholder="Tell us why you're perfect for this role..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="w-full py-4 text-lg font-semibold rounded-2xl"
                  >
                    {loading ? 'Submitting Application...' : 'Submit Application'}
                  </Button>
                  <p className="text-sm text-gray-500 text-center mt-3">
                    By submitting this application, you agree to our terms and privacy policy.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
