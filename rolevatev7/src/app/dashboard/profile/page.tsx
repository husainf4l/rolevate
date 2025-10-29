"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";

import { API_CONFIG } from "@/lib/config";
import {
  UserIcon,
  KeyIcon,
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  userType?: string;
}

interface UserNotificationSettings {
  emailDigest: boolean;
  browserNotifications: boolean;
  emailOnMention: boolean;
  emailOnAssignment: boolean;
  emailWeeklyReport: boolean;
  smsReminders: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  lastPasswordChange?: string | undefined;
}

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatar: "",
    bio: "",
    userType: "",
  });

  const [notificationSettings, setNotificationSettings] =
    useState<UserNotificationSettings>({
      emailDigest: true,
      browserNotifications: true,
      emailOnMention: true,
      emailOnAssignment: true,
      emailWeeklyReport: false,
      smsReminders: false,
    });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Fetch user profile data
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      // First get user data
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query GetCurrentUser {
              me {
                id
                name
                email
                phone
                avatar
                userType
                company {
                  id
                  name
                }
                createdAt
                updatedAt
              }
            }
          `
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Check for GraphQL errors (like authentication errors)
        if (result.errors) {
          const isForbidden = result.errors.some((err: any) => 
            err.extensions?.code === 'FORBIDDEN' || err.extensions?.originalError?.statusCode === 403
          );
          
          if (isForbidden) {
            // Token expired or invalid - redirect to login
            localStorage.removeItem("access_token");
            window.location.href = "/login";
            return;
          }
          
          throw new Error(result.errors[0].message);
        }
        
        const userData = result.data?.me;

        if (userData) {
          // If user is a candidate, fetch their profile separately
          let candidateProfile = null;
          if (userData.userType === "CANDIDATE") {
            const profileResponse = await fetch(`${API_CONFIG.API_BASE_URL}/graphql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                query: `
                  query GetCandidateProfile($userId: ID!) {
                    candidateProfileByUser(userId: $userId) {
                      id
                      firstName
                      lastName
                      phone
                      location
                      bio
                      skills
                      experience
                      education
                      linkedinUrl
                      githubUrl
                      portfolioUrl
                      resumeUrl
                      availability
                      salaryExpectation
                      preferredWorkType
                    }
                  }
                `,
                variables: {
                  userId: userData.id
                }
              }),
            });

            if (profileResponse.ok) {
              const profileResult = await profileResponse.json();
              candidateProfile = profileResult.data?.candidateProfileByUser;
            }
          }

          // Map GraphQL response to the interface expected by the component
          setUserProfile({
            id: userData.id || "",
            firstName: candidateProfile?.firstName || userData.name?.split(' ')[0] || "",
            lastName: candidateProfile?.lastName || userData.name?.split(' ').slice(1).join(' ') || "",
            email: userData.email || "",
            phone: candidateProfile?.phone || userData.phone || "",
            avatar: userData.avatar || "",
            bio: candidateProfile?.bio || "",
            userType: userData.userType || "",
          });
        }
      } else {
        throw new Error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setSaveStatus({ 
        type: "error", 
        message: "Failed to load profile. Please try refreshing the page." 
      });
    } finally {
      setLoading(false);
    }
  };

  const saveUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      // First get current user data to check user type
      const userResponse = await fetch(`${API_CONFIG.API_BASE_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query GetCurrentUser {
              me {
                id
                userType
              }
            }
          `
        }),
      });

      if (!userResponse.ok) {
        throw new Error("Failed to get user data");
      }

      const userResult = await userResponse.json();
      const userId = userResult.data?.me?.id;
      const userType = userResult.data?.me?.userType;

      if (userType === "CANDIDATE") {
        // Get candidate profile ID
        const profileResponse = await fetch(`${API_CONFIG.API_BASE_URL}/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: `
              query GetCandidateProfile($userId: ID!) {
                candidateProfileByUser(userId: $userId) {
                  id
                }
              }
            `,
            variables: {
              userId: userId
            }
          }),
        });

        if (profileResponse.ok) {
          const profileResult = await profileResponse.json();
          const candidateProfileId = profileResult.data?.candidateProfileByUser?.id;

          if (candidateProfileId) {
            // Update candidate profile using GraphQL
            const updateResponse = await fetch(`${API_CONFIG.API_BASE_URL}/graphql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                query: `
                  mutation UpdateCandidateProfile($id: ID!, $input: UpdateCandidateProfileInput!) {
                    updateCandidateProfile(id: $id, input: $input) {
                      id
                      firstName
                      lastName
                      phone
                      bio
                    }
                  }
                `,
                variables: {
                  id: candidateProfileId,
                  input: {
                    firstName: userProfile.firstName,
                    lastName: userProfile.lastName,
                    phone: userProfile.phone,
                    bio: userProfile.bio,
                  }
                }
              }),
            });

            if (updateResponse.ok) {
              const updateResult = await updateResponse.json();
              if (updateResult.errors) {
                throw new Error(updateResult.errors[0].message);
              }
              setSaveStatus({
                type: "success",
                message: "Profile updated successfully!",
              });
              setTimeout(() => setSaveStatus(null), 3000);
            } else {
              throw new Error("Failed to update profile");
            }
          } else {
            throw new Error("Candidate profile not found");
          }
        }
      } else {
        // Business user - would need updateUser mutation
        console.warn("No candidate profile found for user. updateUser mutation needed.");
        setSaveStatus({
          type: "error",
          message: "Profile update not available - missing backend mutation",
        });
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setSaveStatus({ type: "error", message: error.message || "Failed to update profile" });
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    // TODO: Implement when notification settings mutations are added to GraphQL
    setSaveStatus({
      type: "error",
      message: "Notification settings not available via GraphQL yet",
    });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const changePassword = async () => {
    // TODO: Implement when changePassword mutation is added to GraphQL
    setSaveStatus({
      type: "error",
      message: "Password change not available via GraphQL yet",
    });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type - only allow images
    if (!file.type.startsWith('image/')) {
      setSaveStatus({ type: "error", message: "Please select a valid image file" });
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    // Validate file size (max 5MB for avatars)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setSaveStatus({ type: "error", message: "Please upload an image smaller than 5MB" });
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      // Convert file to base64
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = error => reject(error);
        });
      };

      const base64File = await fileToBase64(file);

      // Upload file to S3 using GraphQL mutation with base64
      const uploadResponse = await fetch(`${API_CONFIG.API_BASE_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation UploadCVToS3($base64File: String!, $filename: String!, $mimetype: String!) {
              uploadCVToS3(base64File: $base64File, filename: $filename, mimetype: $mimetype) {
                url
                key
              }
            }
          `,
          variables: {
            base64File,
            filename: file.name,
            mimetype: file.type
          }
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload avatar");
      }

      const uploadResult = await uploadResponse.json();
      const avatarUrl = uploadResult.data?.uploadCVToS3?.url;

      if (avatarUrl) {
        // Update user profile with new avatar URL in database
        const updateUserResponse = await fetch(`${API_CONFIG.API_BASE_URL}/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: `
              mutation UpdateUser($id: String!, $input: UpdateUserInput!) {
                updateUser(id: $id, input: $input) {
                  id
                  avatar
                }
              }
            `,
            variables: {
              id: userProfile.id,
              input: {
                avatar: avatarUrl
              }
            }
          }),
        });

        if (!updateUserResponse.ok) {
          throw new Error("Failed to update user profile");
        }

        const updateUserResult = await updateUserResponse.json();
        
        if (updateUserResult.errors) {
          throw new Error(updateUserResult.errors[0].message);
        }

        // Update local state
        setUserProfile({ ...userProfile, avatar: avatarUrl });
        setSaveStatus({
          type: "success",
          message: "Avatar uploaded successfully!",
        });
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        throw new Error("Failed to get avatar URL");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setSaveStatus({ type: "error", message: "Failed to upload avatar" });
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setLoading(false);
    }
  };  const tabs = [
    { id: "profile", label: "Personal Info", icon: UserIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "security", label: "Security", icon: KeyIcon },
  ];

  return (
    <div className="min-h-screen">
      <Header
        title="My Profile"
        subtitle="Manage your personal account settings and preferences"
      />

      <main className="pt-20 px-4 lg:px-8 max-w-4xl mx-auto">
        {/* Save Status */}
        {saveStatus && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              saveStatus.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {saveStatus.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5" />
            )}
            {saveStatus.message}
          </div>
        )}

        {/* Profile Header */}
        <div className="rounded-sm shadow-2xl p-8 mb-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-600 flex items-center justify-center">
                {userProfile.avatar ? (
                  <img
                    src={
                      userProfile.avatar.startsWith('http') 
                        ? userProfile.avatar 
                        : `/api/proxy-image?url=${encodeURIComponent(
                            `${API_CONFIG.UPLOADS_URL}/${userProfile.avatar}`
                          )}`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {userProfile.firstName?.charAt(0)}
                    {userProfile.lastName?.charAt(0)}
                  </span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg cursor-pointer flex items-center justify-center hover:bg-gray-50 transition-colors">
                <CameraIcon className="w-4 h-4 text-gray-600" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900">
                {userProfile.firstName} {userProfile.lastName}
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                {userProfile.userType === "CANDIDATE" ? "Job Seeker" : "Employer"}
              </p>
              <p className="text-sm text-gray-500">{userProfile.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="rounded-sm shadow-xl border border-gray-200 mb-8">
          <div className="flex gap-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-primary-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-sm shadow-xl p-8 border border-gray-200">
          {/* Personal Info Tab */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Personal Information
                </h2>
                <p className="text-gray-600">
                  Update your personal details.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={userProfile.firstName}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="Enter your first name"
                      disabled={userProfile.userType === "BUSINESS"}
                    />
                    {userProfile.userType === "BUSINESS" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Business users: Please update your name in the full name field
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={userProfile.lastName}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          lastName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="Enter your last name"
                      disabled={userProfile.userType === "BUSINESS"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="your.email@company.com"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {userProfile.userType === "CANDIDATE" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={userProfile.bio}
                    onChange={(e) =>
                      setUserProfile({ ...userProfile, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  variant="default"
                  size="default"
                  onClick={saveUserProfile}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="secondary"
                  size="default"
                  onClick={fetchUserProfile}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Personal Notification Preferences
                </h2>
                <p className="text-gray-600">
                  Customize how you want to receive notifications.
                </p>
              </div>

              <div className="space-y-6">
                <div className="rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Email Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Daily Digest
                        </h4>
                        <p className="text-sm text-gray-500">
                          Receive a daily summary of activities
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailDigest}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailDigest: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          When I'm Mentioned
                        </h4>
                        <p className="text-sm text-gray-500">
                          Get notified when someone mentions you
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailOnMention}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailOnMention: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Task Assignments
                        </h4>
                        <p className="text-sm text-gray-500">
                          Get notified when tasks are assigned to you
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailOnAssignment}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailOnAssignment: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Weekly Reports
                        </h4>
                        <p className="text-sm text-gray-500">
                          Receive weekly performance reports
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailWeeklyReport}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailWeeklyReport: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Other Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Browser Notifications
                        </h4>
                        <p className="text-sm text-gray-500">
                          Show notifications in your browser
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.browserNotifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              browserNotifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          SMS Reminders
                        </h4>
                        <p className="text-sm text-gray-500">
                          Receive important reminders via SMS
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.smsReminders}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              smsReminders: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="default"
                  size="default"
                  onClick={saveNotificationSettings}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Account Security
                </h2>
                <p className="text-gray-600">
                  Manage your account security settings.
                </p>
              </div>

              <div className="rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Change Password
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current,
                          })
                        }
                      >
                        {showPasswords.current ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        placeholder="Enter new password"
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            new: !showPasswords.new,
                          })
                        }
                      >
                        {showPasswords.new ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm,
                          })
                        }
                      >
                        {showPasswords.confirm ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {passwordData.confirmPassword &&
                      passwordData.newPassword !==
                        passwordData.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">
                          Passwords do not match
                        </p>
                      )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="default"
                      size="default"
                      onClick={changePassword}
                      disabled={
                        loading ||
                        !passwordData.currentPassword ||
                        !passwordData.newPassword ||
                        passwordData.newPassword !==
                          passwordData.confirmPassword
                      }
                    >
                      {loading ? "Changing..." : "Change Password"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="default"
                      onClick={() =>
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        })
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Security Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Two-Factor Authentication
                      </h4>
                      <p className="text-sm text-gray-500">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.twoFactorEnabled}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            twoFactorEnabled: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <select
                      value={securitySettings.sessionTimeout}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          sessionTimeout: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={480}>8 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

