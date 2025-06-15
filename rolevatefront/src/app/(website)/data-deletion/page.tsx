"use client";

import { Mail, Shield, UserX, CheckCircle } from "lucide-react";

export default function DataDeletion() {
  const handleEmailClick = () => {
    const subject = encodeURIComponent("Data Deletion Request");
    const body = encodeURIComponent(`Dear Rolevate Team,

I would like to request the deletion of my personal data from your platform.

Account Details:
- Full Name: [Your Full Name]
- Email Address: [Your Email Address]
- Account Username (if applicable): [Your Username]

Please confirm the deletion of all my personal data including:
- Profile information
- Interview recordings
- Application data
- Any other personal information stored on your platform

Thank you for your assistance.

Best regards,
[Your Name]`);
    
    window.location.href = `mailto:info@roxate.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Hero Section */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-500/20 backdrop-blur-sm p-3 rounded-full border border-red-500/30">
                <UserX className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-[#F8FAFC] mb-4">
              Data Deletion Request
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Request the deletion of your personal data from our platform in compliance with privacy regulations
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* How to Request */}
          <div className="bg-slate-800/30 backdrop-blur-lg rounded-lg shadow-2xl border border-slate-700/50 p-8">
            <div className="flex items-center mb-6">
              <Mail className="h-6 w-6 text-[#00C6AD] mr-3" />
              <h2 className="text-2xl font-bold text-[#F8FAFC]">
                How to Request Data Deletion
              </h2>
            </div>
            
            <div className="space-y-4 mb-6">
              <p className="text-slate-300">
                To delete your data from our platform, please send an email to our data protection team:
              </p>
              
              <div className="bg-slate-700/50 border border-slate-600/70 rounded-lg p-6 text-center backdrop-blur-sm">
                <button
                  onClick={handleEmailClick}
                  className="inline-flex items-center text-2xl font-bold text-[#00C6AD] hover:text-teal-300 transition-colors group"
                >
                  <Mail className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform" />
                  info@roxate.com
                </button>
                <p className="text-sm text-[#00C6AD] mt-2">
                  Click to open email with pre-filled template
                </p>
              </div>
            </div>

            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-yellow-300 text-sm">
                <strong>Note:</strong> Please use the email address associated with your Rolevate account to ensure proper verification.
              </p>
            </div>
          </div>

          {/* What to Include */}
          <div className="bg-slate-800/30 backdrop-blur-lg rounded-lg shadow-2xl border border-slate-700/50 p-8">
            <div className="flex items-center mb-6">
              <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-[#F8FAFC]">
                Information to Include
              </h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-slate-300 mb-4">
                Please include the following information in your email:
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-green-400/20 rounded-full p-1 mr-3 mt-0.5 border border-green-400/30">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <strong className="text-[#F8FAFC]">Subject Line:</strong>
                    <span className="text-slate-300 ml-1">"Data Deletion Request"</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-400/20 rounded-full p-1 mr-3 mt-0.5 border border-green-400/30">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <strong className="text-[#F8FAFC]">Full Name:</strong>
                    <span className="text-slate-300 ml-1">As registered on your account</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-400/20 rounded-full p-1 mr-3 mt-0.5 border border-green-400/30">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <strong className="text-[#F8FAFC]">Email Address:</strong>
                    <span className="text-slate-300 ml-1">Associated with your account</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-400/20 rounded-full p-1 mr-3 mt-0.5 border border-green-400/30">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <strong className="text-[#F8FAFC]">Account Username:</strong>
                    <span className="text-slate-300 ml-1">If applicable</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Types Section */}
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-lg shadow-2xl border border-slate-700/50 p-8 mt-8">
          <div className="flex items-center mb-6">
            <Shield className="h-6 w-6 text-purple-400 mr-3" />
            <h2 className="text-2xl font-bold text-[#F8FAFC]">
              What Data Will Be Deleted
            </h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-[#F8FAFC] mb-3">Personal Information</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                  Profile information and contact details
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                  Account credentials and preferences
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                  Professional information and CV data
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                  Payment information
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-[#F8FAFC] mb-3">Interview Data</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                  Audio and video recordings
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                  Interview transcriptions
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                  Assessment data and feedback
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                  Application history
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Process Information */}
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-lg shadow-2xl border border-slate-700/50 p-8 mt-8">
          <h2 className="text-2xl font-bold text-[#F8FAFC] mb-6">
            Deletion Process & Timeline
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-[#00C6AD]/20 backdrop-blur-sm rounded-full p-2 mr-4 mt-1 border border-[#00C6AD]/30">
                <span className="text-[#00C6AD] font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#F8FAFC]">Email Verification</h3>
                <p className="text-slate-300">
                  We will verify your identity and account ownership within 2 business days.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-[#00C6AD]/20 backdrop-blur-sm rounded-full p-2 mr-4 mt-1 border border-[#00C6AD]/30">
                <span className="text-[#00C6AD] font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#F8FAFC]">Data Processing</h3>
                <p className="text-slate-300">
                  Your data will be permanently deleted from our systems within 30 days of verification.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-[#00C6AD]/20 backdrop-blur-sm rounded-full p-2 mr-4 mt-1 border border-[#00C6AD]/30">
                <span className="text-[#00C6AD] font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#F8FAFC]">Confirmation</h3>
                <p className="text-slate-300">
                  You will receive a confirmation email once the deletion process is complete.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 mt-8 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-red-300 mb-3">Important Notes</h3>
          <ul className="space-y-2 text-red-200">
            <li className="flex items-start">
              <span className="text-red-400 mr-2 mt-1">•</span>
              Data deletion is permanent and cannot be undone
            </li>
            <li className="flex items-start">
              <span className="text-red-400 mr-2 mt-1">•</span>
              You will lose access to your account and all associated data
            </li>
            <li className="flex items-start">
              <span className="text-red-400 mr-2 mt-1">•</span>
              Some data may be retained for legal compliance purposes as outlined in our Privacy Policy
            </li>
            <li className="flex items-start">
              <span className="text-red-400 mr-2 mt-1">•</span>
              Backups may take up to 90 days to be completely purged from our systems
            </li>
          </ul>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-12">
          <p className="text-slate-300 mb-4">
            Have questions about data deletion? Need help with your request?
          </p>
          <button
            onClick={handleEmailClick}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#00C6AD] to-teal-600 hover:from-[#00B5A0] hover:to-teal-500 text-white font-semibold rounded-lg transition-all duration-200 ease-out transform hover:scale-105 active:scale-95 shadow-lg shadow-[#00C6AD]/25"
          >
            <Mail className="h-5 w-5 mr-2" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
