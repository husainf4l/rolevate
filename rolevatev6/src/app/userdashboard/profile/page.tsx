"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getProfile } from "@/services/profile";
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
        console.log('🔄 Fetching user profile...');
        // getProfile() returns CandidateProfile directly
        const profileData = await getProfile();
        console.log('✅ Profile data received:', profileData);
        setUser(profileData);
      } catch (err) {
        console.error('❌ Error fetching profile:', err);
        setUserError(err instanceof Error ? err.message : 'Failed to load user profile');
      } finally {
        setLoadingUser(false);
        console.log('🏁 Loading complete');
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
      const transformedCV = transformCVData(response as any);
      setCvs((prev) => [transformedCV, ...prev]);

      // Show activation modal for the newly uploaded CV
      setPendingActivationCV({ id: (response as any).id, name: file.name });
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
    window.open((cv as any).downloadUrl, "_blank");
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

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Loading your profile...
            </h3>
            <p className="text-lg text-gray-600">
              Please wait while we fetch your information
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Failed to load profile
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              {userError || 'Unable to load your profile data'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
            >
              Retry
            </button>
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
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Professional Profile
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Manage your professional identity and career documents in one centralized location
            </p>
          </div>
        </div>

        {/* Profile Content */}
        <div className="space-y-12">
          {/* Profile Information */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="w-20 h-20 bg-primary-600 rounded-xl flex items-center justify-center mx-auto lg:mx-0">
                    <span className="text-white text-2xl font-bold">{initials}</span>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {fullName}
                  </h3>
                  <p className="text-base text-gray-600 mb-6">
                    {profile.currentJobTitle || "Job Title Not Specified"}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</p>
                      <p className="text-sm font-medium text-gray-900">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                      <p className="text-sm font-medium text-gray-900">
                        {profile.phone && profile.phone !== "a"
                          ? profile.phone
                          : "Phone not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Location</p>
                      <p className="text-sm font-medium text-gray-900">
                        {profile.currentLocation || "Location not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Member Since</p>
                      <p className="text-sm font-medium text-gray-900">{joinDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Summary */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Professional Summary
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed text-sm">
                  {profile.profileSummary && !profile.profileSummary.includes("CV parsing failed")
                    ? profile.profileSummary
                    : `Welcome to ${fullName}'s profile. Professional summary not yet provided.`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Preferences */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Skills</h2>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No skills added yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Preferences</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Work Type</span>
                    <span className="text-sm font-medium text-gray-900">
                      {profile.preferredWorkType || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Job Types</span>
                    <span className="text-sm font-medium text-gray-900">
                      {profile.preferredJobTypes && profile.preferredJobTypes.length > 0
                        ? profile.preferredJobTypes.join(", ")
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Industries</span>
                    <span className="text-sm font-medium text-gray-900">
                      {profile.preferredIndustries && profile.preferredIndustries.length > 0
                        ? profile.preferredIndustries.join(", ")
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Expected Salary</span>
                    <span className="text-sm font-medium text-gray-900">
                      {profile.expectedSalary || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Experience Level</span>
                    <span className="text-sm font-medium text-gray-900">
                      {profile.experienceLevel || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Total Experience</span>
                    <span className="text-sm font-medium text-gray-900">
                      {profile.totalExperience ? `${profile.totalExperience} years` : "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Notice Period</span>
                    <span className="text-sm font-medium text-gray-900">
                      {profile.noticePeriod || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Highest Education</span>
                    <span className="text-sm font-medium text-gray-900">
                      {profile.highestEducation || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">University</span>
                    <span className="text-sm font-medium text-gray-900">
                      {profile.university || "Not specified"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Experience */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Experience</h2>
              <div className="space-y-4">
                {profile.workExperiences && profile.workExperiences.length > 0 ? (
                  profile.workExperiences.map((job: any, index: number) => (
                    <div key={index} className="border-l-2 border-primary-600 pl-4">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {job.jobTitle}
                      </h3>
                      <p className="text-primary-600 font-medium text-sm mb-2">{job.company}</p>
                      <p className="text-gray-500 mb-2 text-xs">
                        {job.startDate} - {job.endDate || "Present"}
                      </p>
                      <p className="text-gray-700 leading-relaxed text-sm">{job.description}</p>
                    </div>
                  ))
                ) : profile.currentJobTitle && profile.currentCompany ? (
                  // Show current position if workExperiences is empty but current job exists
                  <div className="border-l-2 border-primary-600 pl-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {profile.currentJobTitle}
                    </h3>
                    <p className="text-primary-600 font-medium text-sm mb-2">{profile.currentCompany}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        Current Position
                      </span>
                      {profile.totalExperience && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {profile.totalExperience} {profile.totalExperience === 1 ? 'year' : 'years'} experience
                        </span>
                      )}
                      {profile.experienceLevel && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          {profile.experienceLevel}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Currently working as {profile.currentJobTitle} at {profile.currentCompany}
                      {profile.currentLocation ? ` in ${profile.currentLocation}` : ''}.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      No work experience added yet
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                      Add your professional experience to showcase your career journey and expertise.
                    </p>
                    <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                      Add Work Experience
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Education</h2>
              <div className="space-y-4">
                {profile.educationHistory && profile.educationHistory.length > 0 ? (
                  profile.educationHistory.map((education: any, index: number) => (
                    <div key={index} className="border-l-2 border-orange-600 pl-4">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {education.degree}{" "}
                        {education.fieldOfStudy && `in ${education.fieldOfStudy}`}
                      </h3>
                      <p className="text-orange-600 font-medium text-sm mb-2">{education.university}</p>
                      <p className="text-gray-500 mb-2 text-xs">
                        {education.startDate || education.startYear} - {education.endDate || education.endYear || "Present"}
                      </p>
                      {education.description && (
                        <p className="text-gray-700 leading-relaxed text-sm">{education.description}</p>
                      )}
                      {education.grade && (
                        <p className="text-gray-600 mt-1 text-xs">Grade: {education.grade}</p>
                      )}
                    </div>
                  ))
                ) : profile.highestEducation || profile.university ? (
                  // Show education summary if educationHistory is empty but education data exists
                  <div className="border-l-2 border-orange-600 pl-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {profile.highestEducation || "Education"}
                      {profile.fieldOfStudy && ` in ${profile.fieldOfStudy}`}
                    </h3>
                    {profile.university && (
                      <p className="text-orange-600 font-medium text-sm mb-2">{profile.university}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profile.graduationYear && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          Graduated {profile.graduationYear}
                        </span>
                      )}
                      {profile.highestEducation && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {profile.highestEducation}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      No education history added yet
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                      Add your educational background to complete your professional profile.
                    </p>
                    <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                      Add Education
                    </button>
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
            <CardContent className="p-6">
              <div
                className="text-center cursor-pointer"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  dragActive
                    ? 'bg-primary-100 scale-110'
                    : 'bg-gray-100'
                }`}>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {dragActive ? 'Drop your CV here' : 'Upload a new CV'}
                </h3>

                <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                  {dragActive
                    ? 'Release to upload your CV file'
                    : 'Drag and drop your PDF CV file here, or click to browse your files'
                  }
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                      dragActive
                        ? 'bg-primary-600 text-white shadow-lg scale-105'
                        : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg'
                    } disabled:opacity-50`}
                    disabled={uploading}
                  >
                    <span>{uploading ? "Uploading..." : "Choose File"}</span>
                  </button>

                  {!dragActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="inline-flex items-center space-x-2 px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors text-sm"
                      disabled={uploading}
                    >
                      <span>Quick Upload</span>
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                    <span>PDF format</span>
                    <span>Max 10MB</span>
                    <span>Secure upload</span>
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
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-bold text-gray-900">
                    Your CV Library
                  </h2>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {cvs.length} CV{cvs.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium text-sm"
                  disabled={uploading}
                >
                  <span>Add New CV</span>
                </button>
              </div>
            </div>

            {loadingCVs ? (
              <div className="px-6 py-12 text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Loading your CVs...
                </h3>
                <p className="text-sm text-gray-600">
                  Please wait while we fetch your documents
                </p>
              </div>
            ) : cvs.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  No CVs uploaded yet
                </h3>
                <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                  Start building your professional profile by uploading your first CV.
                  We'll help you optimize it for better job matches.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
                >
                  <span>Upload Your First CV</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cvs.map((cv) => (
                  <div
                    key={cv.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <span className="text-primary-600 font-bold text-sm">
                            {(cv as any).originalFileName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {(cv as any).originalFileName}
                            </h3>
                            {(cv as any).isActive && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">
                                <span>Active CV</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <span>Updated {new Date((cv as any).lastUpdated).toLocaleDateString()}</span>
                            <span>{(cv as any).fileSize}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Status Badge */}
                        <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold text-white ${getStatusColor(cv.status)}`}>
                          <span className="capitalize">{cv.status.replace('_', ' ')}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDownload(cv)}
                            className="inline-flex items-center px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                            title="Download CV"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => handleDeleteCV(cv.id)}
                            className="inline-flex items-center px-3 py-1.5 text-red-600 bg-white border border-red-300 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
                            title="Delete CV"
                          >
                            Delete
                          </button>
                          {!(cv as any).isActive && (
                            <button
                              onClick={() => handleActivateCV(cv.id)}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm text-xs font-medium"
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
          <div className="mt-8">
            <Card className="bg-gradient-to-br from-primary-50 to-blue-50 border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    CV Optimization Tips
                  </h3>
                  <p className="text-sm text-gray-600">
                    Maximize your chances of landing interviews with these expert recommendations
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-white">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Keep it Concise
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Limit your CV to 2 pages maximum for most positions. Focus on quality over quantity and highlight your most relevant achievements.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-white">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Tailor for Each Job
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Customize your CV for each application to match job requirements. Use keywords from the job description to pass ATS filters.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-white">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Use Keywords Strategically
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Include relevant keywords from the job description naturally throughout your CV. This helps with both ATS and human reviewers.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-white">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Update Regularly
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Keep your CV current with your latest skills, experiences, and achievements. Regular updates show attention to detail.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Completeness */}
          <Card className="bg-gradient-to-br from-primary-50 to-blue-50 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Profile Completeness
                </h2>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-600">
                    {completeness}%
                  </div>
                  <div className="text-xs text-gray-600">Complete</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${completeness}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  <div key={index} className="flex items-center space-x-2">
                    {item.completed ? (
                      <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                    )}
                    <span className={`text-xs ${item.completed ? 'text-gray-900' : 'text-gray-600'}`}>
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

