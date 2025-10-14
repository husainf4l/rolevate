"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileService } from "@/services/profile";
import {
  CVData,
  uploadCV,
  getCVs,
  deleteCV,
  activateCV,
  transformCVData,
} from "@/services/cv";

const getStatusColor = (status: string) => {
  switch (status) {
    case "current":
      return "bg-primary-600";
    case "processing":
      return "bg-blue-500";
    case "uploaded":
      return "bg-yellow-500";
    case "error":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export default function ProfilePage() {
  // User state - now storing CandidateProfile directly
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  // CV Management State
  const [cvs, setCvs] = useState<CVData[]>([]);
  const [loadingCVs, setLoadingCVs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [pendingActivationCV, setPendingActivationCV] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingUser(true);
        setUserError(null);
        // ProfileService.getUserProfile() returns CandidateProfile directly
        const profileData = await ProfileService.getUserProfile();
        setUser(profileData);
      } catch (err) {
        setUserError(err instanceof Error ? err.message : 'Failed to load user profile');
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Load CVs on component mount
  useEffect(() => {
    loadCVs();
  }, []);

  const loadCVs = async () => {
    try {
      setLoadingCVs(true);
      setCvError(null);
      const response = await getCVs();
      const transformedCVs = response.map(transformCVData);
      setCvs(transformedCVs);
    } catch (err) {
      setCvError(err instanceof Error ? err.message : "Failed to load CVs");
    } finally {
      setLoadingCVs(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setCvError(null);
      const response = await uploadCV(file);
      const transformedCV = transformCVData(response);
      setCvs((prev) => [transformedCV, ...prev]);

      // Show activation modal for the newly uploaded CV
      setPendingActivationCV({ id: response.id, name: file.name });
      setShowActivationModal(true);
    } catch (err) {
      setCvError(err instanceof Error ? err.message : "Failed to upload CV");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmActivation = async () => {
    if (!pendingActivationCV) return;

    try {
      await handleActivateCV(pendingActivationCV.id);
      setSuccessMessage(
        `CV "${pendingActivationCV.name}" has been uploaded and activated successfully!`
      );
    } catch (activateErr) {
      setCvError(
        activateErr instanceof Error
          ? activateErr.message
          : "Failed to activate CV"
      );
    }

    setShowActivationModal(false);
    setPendingActivationCV(null);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleDeclineActivation = () => {
    if (pendingActivationCV) {
      setSuccessMessage(
        `CV "${pendingActivationCV.name}" uploaded successfully! You can activate it later from the CV list.`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    }

    setShowActivationModal(false);
    setPendingActivationCV(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type - only allow PDF
      if (file.type !== 'application/pdf') {
        setCvError('Please upload only PDF files for your CV.');
        event.target.value = ''; // Clear the input
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setCvError('Please upload a CV file smaller than 10MB.');
        event.target.value = ''; // Clear the input
        return;
      }

      handleFileUpload(file);
    }
  };

  const handleDeleteCV = async (cvId: string) => {
    if (!confirm("Are you sure you want to delete this CV?")) {
      return;
    }

    try {
      await deleteCV(cvId);
      setCvs((prev) => prev.filter((cv) => cv.id !== cvId));
    } catch (err) {
      setCvError(err instanceof Error ? err.message : "Failed to delete CV");
    }
  };

  const handleActivateCV = async (cvId: string) => {
    try {
      setCvError(null);
      setSuccessMessage(null);
      await activateCV(cvId);

      // Update the CVs list - deactivate all others and activate the selected one
      setCvs((prev) =>
        prev.map((cv) => ({
          ...cv,
          isActive: cv.id === cvId,
        }))
      );

      setSuccessMessage("CV activated successfully!");
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setCvError(err instanceof Error ? err.message : "Failed to activate CV");
    }
  };

  const handleDownload = (cv: CVData) => {
    window.open(cv.downloadUrl, "_blank");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  if (loadingUser || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
            <p className="text-gray-600">
              {userError ? `Error: ${userError}` : 'Loading profile...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // user is now the CandidateProfile directly
  const profile = user;
  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || profile.email;
  const initials = fullName.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase();

  // Calculate profile completeness
  const completedFields = [
    !!profile.firstName,
    profile.email,
    profile.phone && profile.phone !== "a", // Exclude placeholder phone
    profile.profileSummary && !profile.profileSummary.includes("CV parsing failed"),
    profile.skills && profile.skills.length > 0,
    profile.currentJobTitle,
    profile.currentLocation,
    profile.resumeUrl,
    cvs.length > 0, // Include CVs in completeness
    profile.totalExperience,
    profile.experienceLevel,
    profile.noticePeriod,
    profile.highestEducation,
    profile.university,
    profile.graduationYear,
  ].filter(Boolean).length;

  const totalFields = 15;
  const completeness = Math.round((completedFields / totalFields) * 100);

  // Format join date
  const joinDate = new Date(profile.createdAt || "").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Professional Profile
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Manage your professional identity and career documents in one centralized location
            </p>
          </div>
        </div>

        {/* Profile Content */}
        <div className="space-y-12">
          {/* Profile Information */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1">
                  <div className="w-32 h-32 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0">
                    <span className="text-white text-4xl font-bold">{initials}</span>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <h3 className="text-4xl font-bold text-gray-900 mb-3">
                    {fullName}
                  </h3>
                  <p className="text-2xl text-gray-600 mb-8">
                    {profile.currentJobTitle || "Job Title Not Specified"}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Email</p>
                      <p className="text-lg font-medium text-gray-900">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Phone</p>
                      <p className="text-lg font-medium text-gray-900">
                        {profile.phone && profile.phone !== "a"
                          ? profile.phone
                          : "Phone not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Location</p>
                      <p className="text-lg font-medium text-gray-900">
                        {profile.currentLocation || "Location not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Member Since</p>
                      <p className="text-lg font-medium text-gray-900">{joinDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Summary */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Professional Summary
              </h2>
              <div className="bg-gray-50 rounded-2xl p-8">
                <p className="text-gray-700 leading-relaxed text-xl">
                  {profile.profileSummary && !profile.profileSummary.includes("CV parsing failed")
                    ? profile.profileSummary
                    : `Welcome to ${fullName}'s profile. Professional summary not yet provided.`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Preferences */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Skills</h2>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {profile.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-6 py-3 rounded-2xl text-base font-medium bg-primary-100 text-primary-800 border border-primary-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-xl text-gray-500">No skills added yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Preferences</h2>
                <div className="space-y-6">
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <span className="text-lg text-gray-600">Work Type</span>
                    <span className="text-lg font-medium text-gray-900">
                      {profile.preferredWorkType || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <span className="text-lg text-gray-600">Job Types</span>
                    <span className="text-lg font-medium text-gray-900">
                      {profile.preferredJobTypes && profile.preferredJobTypes.length > 0
                        ? profile.preferredJobTypes.join(", ")
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <span className="text-lg text-gray-600">Industries</span>
                    <span className="text-lg font-medium text-gray-900">
                      {profile.preferredIndustries && profile.preferredIndustries.length > 0
                        ? profile.preferredIndustries.join(", ")
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <span className="text-lg text-gray-600">Expected Salary</span>
                    <span className="text-lg font-medium text-gray-900">
                      {profile.expectedSalary || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <span className="text-lg text-gray-600">Experience Level</span>
                    <span className="text-lg font-medium text-gray-900">
                      {profile.experienceLevel || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <span className="text-lg text-gray-600">Total Experience</span>
                    <span className="text-lg font-medium text-gray-900">
                      {profile.totalExperience ? `${profile.totalExperience} years` : "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <span className="text-lg text-gray-600">Notice Period</span>
                    <span className="text-lg font-medium text-gray-900">
                      {profile.noticePeriod || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <span className="text-lg text-gray-600">Highest Education</span>
                    <span className="text-lg font-medium text-gray-900">
                      {profile.highestEducation || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <span className="text-lg text-gray-600">University</span>
                    <span className="text-lg font-medium text-gray-900">
                      {profile.university || "Not specified"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Experience */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Experience</h2>
              <div className="space-y-8">
                {profile.workExperiences && profile.workExperiences.length > 0 ? (
                  profile.workExperiences.map((job: any, index: number) => (
                    <div key={index} className="border-l-4 border-primary-600 pl-8">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      <p className="text-primary-600 font-medium text-xl mb-3">{job.company}</p>
                      <p className="text-gray-500 mb-4 text-lg">
                        {job.startDate} - {job.endDate || "Present"}
                      </p>
                      <p className="text-gray-700 leading-relaxed text-lg">{job.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      No work experience added yet
                    </h3>
                    <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
                      Add your professional experience to showcase your career journey and expertise.
                    </p>
                    {profile.currentJobTitle && profile.currentCompany && (
                      <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                        <h4 className="text-xl font-semibold text-gray-900 mb-3">
                          {profile.currentJobTitle}
                        </h4>
                        <p className="text-primary-600 mb-3 text-lg">{profile.currentCompany}</p>
                        <p className="text-base text-gray-500">
                          Current Position • {profile.experienceLevel || "Experience Level Not Specified"}
                          {profile.totalExperience && ` • ${profile.totalExperience} Experience`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Education</h2>
              <div className="space-y-8">
                {profile.educationHistory && profile.educationHistory.length > 0 ? (
                  profile.educationHistory.map((education: any, index: number) => (
                    <div key={index} className="border-l-4 border-orange-600 pl-8">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        {education.degree}{" "}
                        {education.fieldOfStudy && `in ${education.fieldOfStudy}`}
                      </h3>
                      <p className="text-orange-600 font-medium text-xl mb-3">{education.institution}</p>
                      <p className="text-gray-500 mb-4 text-lg">
                        {education.startYear} - {education.endYear || "Present"}
                      </p>
                      {education.description && (
                        <p className="text-gray-700 leading-relaxed text-lg">{education.description}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      No education history added yet
                    </h3>
                    <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
                      Add your educational background to complete your professional profile.
                    </p>
                    {(profile.highestEducation || profile.fieldOfStudy || profile.university || profile.graduationYear) && (
                      <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                        <h4 className="text-xl font-semibold text-gray-900 mb-3">
                          {profile.highestEducation || "Education"}
                          {profile.fieldOfStudy && ` in ${profile.fieldOfStudy}`}
                        </h4>
                        {profile.university && (
                          <p className="text-orange-600 mb-3 text-lg">{profile.university}</p>
                        )}
                        {profile.graduationYear && (
                          <p className="text-base text-gray-500">
                            Graduated: {profile.graduationYear}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CV Management Section */}
          {/* Error Message */}
          {cvError && (
            <Card className="border-red-200 bg-red-50 border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">{cvError}</p>
                  </div>
                  <button
                    onClick={() => setCvError(null)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <span className="sr-only">Dismiss</span>
                    ×
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Message */}
          {successMessage && (
            <Card className="border-primary-200 bg-primary-50 border-l-4 border-l-primary-500">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <p className="text-primary-800 font-medium">{successMessage}</p>
                  </div>
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="text-primary-600 hover:text-primary-800 transition-colors"
                  >
                    <span className="sr-only">Dismiss</span>
                    ×
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CV Upload Area */}
          <Card className={`border-2 border-dashed transition-all duration-300 ${
            dragActive
              ? 'border-primary-400 bg-primary-50 shadow-lg'
              : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
          }`}>
            <CardContent className="p-12">
              <div
                className="text-center cursor-pointer"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={`w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  dragActive
                    ? 'bg-primary-100 scale-110'
                    : 'bg-gray-100'
                }`}>
                </div>

                <h3 className="text-3xl font-semibold text-gray-900 mb-4">
                  {dragActive ? 'Drop your CV here' : 'Upload a new CV'}
                </h3>

                <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
                  {dragActive
                    ? 'Release to upload your CV file'
                    : 'Drag and drop your PDF CV file here, or click to browse your files'
                  }
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <button
                    className={`inline-flex items-center space-x-3 px-8 py-4 rounded-2xl font-medium transition-all duration-200 ${
                      dragActive
                        ? 'bg-primary-600 text-white shadow-lg scale-105'
                        : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg'
                    } disabled:opacity-50`}
                    disabled={uploading}
                  >
                    <span className="text-lg">{uploading ? "Uploading..." : "Choose File"}</span>
                  </button>

                  {!dragActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="inline-flex items-center space-x-2 px-6 py-3 text-primary-600 hover:text-primary-700 font-medium transition-colors text-lg"
                      disabled={uploading}
                    >
                      <span>Quick Upload</span>
                    </button>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-8 text-base text-gray-500">
                    <div className="flex items-center space-x-2">
                      <span>PDF format</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>Max 10MB</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>Secure upload</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Modern CVs List */}
          <Card className="bg-white border-0 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Your CV Library
                  </h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {cvs.length} CV{cvs.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-3 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-md font-medium text-lg"
                  disabled={uploading}
                >
                  <span>Add New CV</span>
                </button>
              </div>
            </div>

            {loadingCVs ? (
              <div className="px-8 py-16 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Loading your CVs...
                </h3>
                <p className="text-xl text-gray-600">
                  Please wait while we fetch your documents
                </p>
              </div>
            ) : cvs.length === 0 ? (
              <div className="px-8 py-16 text-center">
                <h3 className="text-3xl font-semibold text-gray-900 mb-4">
                  No CVs uploaded yet
                </h3>
                <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
                  Start building your professional profile by uploading your first CV.
                  We'll help you optimize it for better job matches.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-lg"
                >
                  <span>Upload Your First CV</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cvs.map((cv) => (
                  <div
                    key={cv.id}
                    className="px-8 py-8 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                          <span className="text-primary-600 font-bold text-xl">
                            {cv.originalFileName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-4 mb-3">
                            <h3 className="text-2xl font-semibold text-gray-900 truncate">
                              {cv.originalFileName}
                            </h3>
                            {cv.isActive && (
                              <span className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold bg-primary-100 text-primary-800">
                                <span>Active CV</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-6 text-lg text-gray-600">
                            <div className="flex items-center space-x-2">
                              <span>Updated {new Date(cv.lastUpdated).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span>{cv.fileSize}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Status Badge */}
                        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-white ${getStatusColor(cv.status)}`}>
                          <span className="capitalize">{cv.status.replace('_', ' ')}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleDownload(cv)}
                            className="inline-flex items-center px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            title="Download CV"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => handleDeleteCV(cv.id)}
                            className="inline-flex items-center px-6 py-3 text-red-600 bg-white border border-red-300 rounded-xl font-medium hover:bg-red-50 transition-colors"
                            title="Delete CV"
                          >
                            Delete
                          </button>
                          {!cv.isActive && (
                            <button
                              onClick={() => handleActivateCV(cv.id)}
                              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-md font-medium"
                            >
                              <span>Set as Active</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Modern CV Tips Section */}
          <div className="mt-16">
            <Card className="bg-gradient-to-br from-primary-50 to-blue-50 border-0 shadow-sm">
              <CardContent className="p-12">
                <div className="flex items-center space-x-6 mb-10">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">
                      CV Optimization Tips
                    </h3>
                    <p className="text-xl text-gray-600 mt-2">
                      Maximize your chances of landing interviews with these expert recommendations
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-white">
                    <div className="flex items-start space-x-6">
                      <div>
                        <h4 className="text-2xl font-semibold text-gray-900 mb-4">
                          Keep it Concise
                        </h4>
                        <p className="text-lg text-gray-600 leading-relaxed">
                          Limit your CV to 2 pages maximum for most positions. Focus on quality over quantity and highlight your most relevant achievements.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-white">
                    <div className="flex items-start space-x-6">
                      <div>
                        <h4 className="text-2xl font-semibold text-gray-900 mb-4">
                          Tailor for Each Job
                        </h4>
                        <p className="text-lg text-gray-600 leading-relaxed">
                          Customize your CV for each application to match job requirements. Use keywords from the job description to pass ATS filters.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-white">
                    <div className="flex items-start space-x-6">
                      <div>
                        <h4 className="text-2xl font-semibold text-gray-900 mb-4">
                          Use Keywords Strategically
                        </h4>
                        <p className="text-lg text-gray-600 leading-relaxed">
                          Include relevant keywords from the job description naturally throughout your CV. This helps with both ATS and human reviewers.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-white">
                    <div className="flex items-start space-x-6">
                      <div>
                        <h4 className="text-2xl font-semibold text-gray-900 mb-4">
                          Update Regularly
                        </h4>
                        <p className="text-lg text-gray-600 leading-relaxed">
                          Keep your CV current with your latest skills, experiences, and achievements. Regular updates show attention to detail.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Completeness */}
          <Card className="bg-gradient-to-br from-primary-50 to-blue-50 border-0 shadow-sm">
            <CardContent className="p-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Profile Completeness
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-primary-600 mb-2">
                    {completeness}%
                  </div>
                  <div className="text-lg text-gray-600">Complete</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 mb-10">
                <div
                  className="bg-primary-600 h-6 rounded-full transition-all duration-1000"
                  style={{ width: `${completeness}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "First name provided", completed: !!profile.firstName },
                  { label: "Email provided", completed: !!profile.email },
                  { label: "Phone number added", completed: profile.phone && profile.phone !== "a" },
                  { label: "Professional summary added", completed: profile.profileSummary && !profile.profileSummary.includes("CV parsing failed") },
                  { label: "Skills section completed", completed: profile.skills && profile.skills.length > 0 },
                  { label: "Current job title added", completed: !!profile.currentJobTitle },
                  { label: "Current location specified", completed: !!profile.currentLocation },
                  { label: "Resume uploaded", completed: !!profile.resumeUrl },
                  { label: "CV documents uploaded", completed: cvs.length > 0 },
                  { label: "Total experience specified", completed: !!profile.totalExperience },
                  { label: "Experience level set", completed: !!profile.experienceLevel },
                  { label: "Notice period specified", completed: !!profile.noticePeriod },
                  { label: "Highest education added", completed: !!profile.highestEducation },
                  { label: "University specified", completed: !!profile.university },
                  { label: "Graduation year provided", completed: !!profile.graduationYear },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    {item.completed ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0"></div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                    )}
                    <span className={`text-lg ${item.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Activation Modal */}
        {showActivationModal && pendingActivationCV && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity"
                onClick={handleDeclineActivation}
                aria-hidden="true"
              ></div>

              {/* Modal panel */}
              <div className="relative inline-block align-bottom bg-white rounded-2xl shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="px-6 py-8 sm:px-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Set as Active CV
                    </h3>

                    <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                      Would you like to set <span className="font-semibold text-gray-900">"{pendingActivationCV.name}"</span> as your active CV? This will make it visible to employers when you apply for jobs.
                    </p>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
                      <div className="flex items-start space-x-3">
                        <div>
                          <p className="text-yellow-800 text-sm font-medium mb-1">
                            Important Note
                          </p>
                          <p className="text-yellow-700 text-sm">
                            Setting this as active will deactivate your current CV and make this one visible to employers.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <button
                        onClick={handleConfirmActivation}
                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                      >
                        <span>Set as Active</span>
                      </button>

                      <button
                        onClick={handleDeclineActivation}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                      >
                        Keep Inactive
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

