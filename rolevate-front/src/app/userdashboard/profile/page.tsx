import React from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  PencilIcon,
  CheckCircleIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">
            Manage your personal information and professional details.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Personal Information
            </h2>
            <button className="inline-flex items-center space-x-2 px-4 py-2 text-[#0fc4b5] border border-[#0fc4b5] rounded-md hover:bg-[#0fc4b5] hover:text-white transition-colors">
              <PencilIcon className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-[#0fc4b5] rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">JD</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                John Doe
              </h3>
              <p className="text-lg text-gray-600 mb-4">
                Senior Frontend Developer
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <EnvelopeIcon className="w-5 h-5" />
                  <span>john.doe@example.com</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <PhoneIcon className="w-5 h-5" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPinIcon className="w-5 h-5" />
                  <span>San Francisco, CA</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <CalendarIcon className="w-5 h-5" />
                  <span>Joined January 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Professional Summary
            </h2>
            <button className="inline-flex items-center space-x-2 px-3 py-1 text-[#0fc4b5] hover:bg-[#0fc4b5] hover:bg-opacity-10 rounded-md transition-colors">
              <PencilIcon className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Experienced Frontend Developer with 5+ years of expertise in React,
            TypeScript, and modern web technologies. Passionate about creating
            intuitive user experiences and building scalable applications.
            Proven track record of delivering high-quality solutions in
            fast-paced environments.
          </p>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
            <button className="inline-flex items-center space-x-2 px-3 py-1 text-[#0fc4b5] hover:bg-[#0fc4b5] hover:bg-opacity-10 rounded-md transition-colors">
              <PencilIcon className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Technical Skills
              </h3>
              <div className="space-y-3">
                {[
                  { name: "React", level: 90 },
                  { name: "TypeScript", level: 85 },
                  { name: "JavaScript", level: 95 },
                  { name: "Next.js", level: 80 },
                  { name: "Tailwind CSS", level: 85 },
                ].map((skill) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {skill.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#0fc4b5] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Soft Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Problem Solving",
                  "Team Collaboration",
                  "Communication",
                  "Leadership",
                  "Adaptability",
                  "Time Management",
                  "Critical Thinking",
                  "Mentoring",
                ].map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
            <button className="inline-flex items-center space-x-2 px-3 py-1 text-[#0fc4b5] hover:bg-[#0fc4b5] hover:bg-opacity-10 rounded-md transition-colors">
              <PencilIcon className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>
          <div className="space-y-6">
            {[
              {
                title: "Senior Frontend Developer",
                company: "TechCorp Inc.",
                period: "2022 - Present",
                description:
                  "Lead frontend development for multiple web applications using React and TypeScript. Mentored junior developers and improved team productivity by 30%.",
              },
              {
                title: "Frontend Developer",
                company: "WebSolutions",
                period: "2020 - 2022",
                description:
                  "Developed and maintained responsive web applications. Collaborated with design team to implement pixel-perfect UI components.",
              },
              {
                title: "Junior Web Developer",
                company: "StartupXYZ",
                period: "2019 - 2020",
                description:
                  "Built interactive web features and contributed to the company's main product. Gained experience in modern web technologies.",
              },
            ].map((job, index) => (
              <div key={index} className="border-l-4 border-[#0fc4b5] pl-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {job.title}
                </h3>
                <p className="text-[#0fc4b5] font-medium">{job.company}</p>
                <p className="text-sm text-gray-500 mb-2">{job.period}</p>
                <p className="text-gray-700">{job.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Profile Completeness
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-[#0fc4b5]">85%</span>
              <StarIcon className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-[#0fc4b5] h-3 rounded-full transition-all duration-300"
              style={{ width: "85%" }}
            ></div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">
                Personal information completed
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">Professional summary added</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">Skills section completed</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-4 h-4 border-2 border-yellow-400 rounded-full"></div>
              <span className="text-gray-600">Add education details</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-4 h-4 border-2 border-yellow-400 rounded-full"></div>
              <span className="text-gray-600">Upload profile photo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
