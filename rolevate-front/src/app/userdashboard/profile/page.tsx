"use client";

import React from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user || !user.candidateProfile) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0fc4b5] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const profile = user.candidateProfile;
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(
    0
  )}`.toUpperCase();

  // Calculate profile completeness
  const completedFields = [
    profile.firstName && profile.lastName,
    profile.email,
    profile.phone && profile.phone !== "a", // Exclude placeholder phone
    profile.profileSummary,
    profile.skills && profile.skills.length > 0,
    profile.currentJobTitle,
    profile.currentLocation,
    profile.resumeUrl,
  ].filter(Boolean).length;

  const totalFields = 8;
  const completeness = Math.round((completedFields / totalFields) * 100);

  // Format join date
  const joinDate = new Date(user.createdAt || "").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

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
        <Card className="mb-8">
          <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Personal Information
            </h2>
          </div>

          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-[#0fc4b5] rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{initials}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {fullName}
              </h3>
              <p className="text-lg text-gray-600 mb-4">
                {profile.currentJobTitle || "Job Title Not Specified"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <EnvelopeIcon className="w-5 h-5" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <PhoneIcon className="w-5 h-5" />
                  <span>
                    {profile.phone && profile.phone !== "a"
                      ? profile.phone
                      : "Phone not provided"}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPinIcon className="w-5 h-5" />
                  <span>
                    {profile.currentLocation || "Location not specified"}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <CalendarIcon className="w-5 h-5" />
                  <span>Joined {joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        </Card>

        {/* Professional Summary */}
        <Card className="mb-8">
          <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Professional Summary
            </h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            {profile.profileSummary ||
              `Welcome to ${fullName}'s profile. Professional summary not yet provided.`}
          </p>
        </CardContent>
        </Card>

        {/* Skills */}
        <Card className="mb-8">
          <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Skills</h3>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#0fc4b5] bg-opacity-10 text-[#0fc4b5] border border-[#0fc4b5] border-opacity-20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No skills added yet.
                </p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Preferences
              </h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Work Type: </span>
                  <span className="text-gray-600">
                    {profile.preferredWorkType || "Not specified"}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Job Types: </span>
                  <span className="text-gray-600">
                    {profile.preferredJobTypes &&
                    profile.preferredJobTypes.length > 0
                      ? profile.preferredJobTypes.join(", ")
                      : "Not specified"}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-700">
                    Industries:{" "}
                  </span>
                  <span className="text-gray-600">
                    {profile.preferredIndustries &&
                    profile.preferredIndustries.length > 0
                      ? profile.preferredIndustries.join(", ")
                      : "Not specified"}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-700">
                    Expected Salary:{" "}
                  </span>
                  <span className="text-gray-600">
                    {profile.expectedSalary || "Not specified"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        </Card>

        {/* Experience */}
        <Card className="mb-8">
          <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
          </div>
          <div className="space-y-6">
            {profile.workExperiences && profile.workExperiences.length > 0 ? (
              profile.workExperiences.map((job: any, index: number) => (
                <div key={index} className="border-l-4 border-[#0fc4b5] pl-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {job.title}
                  </h3>
                  <p className="text-[#0fc4b5] font-medium">{job.company}</p>
                  <p className="text-sm text-gray-500 mb-2">
                    {job.startDate} - {job.endDate || "Present"}
                  </p>
                  <p className="text-gray-700">{job.description}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  No work experience added yet.
                </p>
                {profile.currentJobTitle && profile.currentCompany && (
                  <div className="border-l-4 border-[#0fc4b5] pl-4 text-left">
                    <h3 className="text-lg font-medium text-gray-900">
                      {profile.currentJobTitle}
                    </h3>
                    <p className="text-[#0fc4b5] font-medium">
                      {profile.currentCompany}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Current Position
                    </p>
                    <p className="text-gray-700">
                      Experience Level:{" "}
                      {profile.experienceLevel || "Not specified"}
                      {profile.totalExperience &&
                        ` • Total Experience: ${profile.totalExperience}`}
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-400 mt-4">
                  Work experience will appear here when available.
                </p>
              </div>
            )}
          </div>
        </CardContent>
        </Card>

        {/* Documents & Resume */}
        <Card className="mb-8">
          <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Documents & Resume
            </h2>
          </div>

          <div className="space-y-4">
            {/* Resume URL */}
            {profile.resumeUrl && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Current Resume
                </h3>
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0fc4b5] hover:underline"
                >
                  View Resume →
                </a>
              </div>
            )}

            {/* Uploaded CVs */}
            {profile.cvs && profile.cvs.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Uploaded CVs ({profile.cvs.length})
                </h3>
                <div className="space-y-2">
                  {profile.cvs.map((cv: any) => (
                    <div
                      key={cv.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {cv.originalFileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Uploaded{" "}
                          {new Date(cv.uploadedAt).toLocaleDateString()} •
                          {Math.round(cv.fileSize / 1024)} KB • Status:{" "}
                          {cv.status}
                          {cv.isActive && " • Active"}
                        </p>
                      </div>
                      <a
                        href={cv.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0fc4b5] hover:underline text-sm"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio and Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Portfolio
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  {profile.portfolioUrl ? (
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0fc4b5] hover:underline"
                    >
                      View Portfolio →
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  LinkedIn
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  {profile.linkedInUrl ? (
                    <a
                      href={profile.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0fc4b5] hover:underline"
                    >
                      View LinkedIn →
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  GitHub
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  {profile.githubUrl ? (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0fc4b5] hover:underline"
                    >
                      View GitHub →
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        </Card>

        {/* Education */}
        <Card className="mb-8">
          <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Education</h2>
          </div>
          <div className="space-y-6">
            {profile.educationHistory && profile.educationHistory.length > 0 ? (
              profile.educationHistory.map((education: any, index: number) => (
                <div key={index} className="border-l-4 border-[#0fc4b5] pl-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {education.degree}{" "}
                    {education.fieldOfStudy && `in ${education.fieldOfStudy}`}
                  </h3>
                  <p className="text-[#0fc4b5] font-medium">
                    {education.institution}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    {education.startYear} - {education.endYear || "Present"}
                  </p>
                  {education.description && (
                    <p className="text-gray-700">{education.description}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  No education history added yet.
                </p>
                {(profile.highestEducation ||
                  profile.fieldOfStudy ||
                  profile.university ||
                  profile.graduationYear) && (
                  <div className="border-l-4 border-[#0fc4b5] pl-4 text-left">
                    <h3 className="text-lg font-medium text-gray-900">
                      {profile.highestEducation || "Education"}
                      {profile.fieldOfStudy && ` in ${profile.fieldOfStudy}`}
                    </h3>
                    {profile.university && (
                      <p className="text-[#0fc4b5] font-medium">
                        {profile.university}
                      </p>
                    )}
                    {profile.graduationYear && (
                      <p className="text-sm text-gray-500">
                        Graduated: {profile.graduationYear}
                      </p>
                    )}
                  </div>
                )}
                <p className="text-sm text-gray-400 mt-4">
                  Education details will appear here when available.
                </p>
              </div>
            )}
          </div>
        </CardContent>
        </Card>

        {/* Profile Completeness */}
        <Card>
          <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Profile Completeness
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-[#0fc4b5]">
                {completeness}%
              </span>
              <StarIcon className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-[#0fc4b5] h-3 rounded-full transition-all duration-300"
              style={{ width: `${completeness}%` }}
            ></div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              {profile.firstName && profile.lastName ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 border-2 border-yellow-400 rounded-full"></div>
              )}
              <span className="text-gray-600">
                Personal information completed
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              {profile.profileSummary ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 border-2 border-yellow-400 rounded-full"></div>
              )}
              <span className="text-gray-600">Professional summary added</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              {profile.skills && profile.skills.length > 0 ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 border-2 border-yellow-400 rounded-full"></div>
              )}
              <span className="text-gray-600">Skills section completed</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              {profile.currentJobTitle ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 border-2 border-yellow-400 rounded-full"></div>
              )}
              <span className="text-gray-600">Job title added</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              {profile.currentLocation ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 border-2 border-yellow-400 rounded-full"></div>
              )}
              <span className="text-gray-600">Location specified</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              {profile.resumeUrl ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 border-2 border-yellow-400 rounded-full"></div>
              )}
              <span className="text-gray-600">Resume uploaded</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              {profile.educationHistory &&
              profile.educationHistory.length > 0 ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 border-2 border-yellow-400 rounded-full"></div>
              )}
              <span className="text-gray-600">Add education details</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-4 h-4 border-2 border-yellow-400 rounded-full"></div>
              <span className="text-gray-600">Upload profile photo</span>
            </div>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}

