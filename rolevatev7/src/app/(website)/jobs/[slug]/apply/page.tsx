"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";
import { jobsService, Job } from "@/services";
import { applicationService } from "@/services/application";
import { useAuth } from "@/hooks/useAuth";
import { apolloClient } from "@/lib/apollo";
import { gql } from "@apollo/client";

interface CandidateCredentials {
  email: string;
  password: string;
  token: string;
}

interface ApplicationResponse {
  application: {
    id: string;
    status: string;
    appliedAt: string;
    createdAt: string;
    resumeUrl: string;
    job: {
      id: string;
      title: string;
    };
    candidate: {
      id: string;
      name: string;
      email: string;
    };
  };
  candidateCredentials: CandidateCredentials | null;
  message: string;
}

export default function JobApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user, isLoading: authLoading } = useAuth();
  const isAuthenticated = !!user && !authLoading;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState<CandidateCredentials | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Handle redirect when countdown reaches 0
  useEffect(() => {
    if (redirectCountdown === 0 && success) {
      router.push("/userdashboard/applications");
    }
  }, [redirectCountdown, success, router]);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedIn: "",
    portfolio: "",
    coverLetter: "",
    noticePeriod: "",
    resume: null as File | null,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const jobDetail = await jobsService.getJobBySlug(slug);
        setJob(jobDetail);

        // Pre-fill form if user is authenticated
        if (isAuthenticated && user) {
          setFormData((prev) => ({
            ...prev,
            fullName: user.name || "",
            email: user.email || "",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch job details:", err);
        setError("Job not found. Please check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchJobDetail();
    }
  }, [slug, isAuthenticated, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        setFormErrors((prev) => ({
          ...prev,
          resume: "Please upload a PDF or Word document",
        }));
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors((prev) => ({
          ...prev,
          resume: "File size must be less than 5MB",
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        resume: file,
      }));
      // Clear error
      if (formErrors.resume) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.resume;
          return newErrors;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email address";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    if (!formData.resume) {
      errors.resume = "Resume is required";
    }

    // Cover letter is now optional - no validation needed

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:mime;base64, prefix to get just the base64 content
        const base64Content = base64.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = reject;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!job) {
      setError("Job information not available");
      return;
    }

    if (!formData.resume) {
      setError("Resume is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Step 1: Upload resume to S3 using base64 encoding
      console.log('Starting resume upload...');
      const base64File = await fileToBase64(formData.resume);
      console.log('File converted to base64, size:', base64File.length);
      
      // Upload file using GraphQL mutation
      const UPLOAD_FILE_MUTATION = gql`
        mutation UploadFileToS3($base64File: String!, $filename: String!, $mimetype: String!, $folder: String) {
          uploadFileToS3(
            base64File: $base64File
            filename: $filename
            mimetype: $mimetype
            folder: $folder
          ) {
            url
            key
          }
        }
      `;

      const { data: uploadData } = await apolloClient.mutate<{
        uploadFileToS3: { url: string; key: string }
      }>({
        mutation: UPLOAD_FILE_MUTATION,
        variables: {
          base64File: base64File,
          filename: formData.resume.name,
          mimetype: formData.resume.type,
          folder: 'resumes',
        },
      });

      console.log('Upload response:', uploadData);

      const resumeUrl = uploadData?.uploadFileToS3?.url;

      if (!resumeUrl) {
        throw new Error('Failed to get resume URL from upload');
      }

      // Validate that we have a proper URL
      if (!resumeUrl.startsWith('http://') && !resumeUrl.startsWith('https://')) {
        throw new Error('Invalid resume URL received from upload');
      }

      console.log('Resume uploaded successfully:', resumeUrl);

      // Step 2: Create application with resume URL and personal info
      const CREATE_APPLICATION_MUTATION = gql`
        mutation CreateApplication($input: CreateApplicationInput!) {
          createApplication(input: $input) {
            application {
              id
              status
              appliedAt
              createdAt
              resumeUrl
              job {
                id
                title
              }
              candidate {
                id
                name
                email
              }
            }
            candidateCredentials {
              email
              password
              token
            }
            message
          }
        }
      `;

      // Prepare application input
      const applicationInput = {
        jobId: String(job.id),
        resumeUrl: resumeUrl,
        email: formData.email.trim(),
        name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        ...(formData.coverLetter && { coverLetter: formData.coverLetter.trim() }),
        ...(formData.linkedIn && { linkedin: formData.linkedIn.trim() }),
        ...(formData.portfolio && { portfolio: formData.portfolio.trim() }),
        ...(formData.noticePeriod && { noticePeriod: formData.noticePeriod.trim() }),
      };

      console.log('Creating application with input:', applicationInput);

      const { data: applicationData } = await apolloClient.mutate<{
        createApplication: ApplicationResponse
      }>({
        mutation: CREATE_APPLICATION_MUTATION,
        variables: {
          input: applicationInput,
        },
      });

      const applicationResponse = applicationData?.createApplication;

      if (!applicationResponse) {
        throw new Error('Failed to create application');
      }

      // If credentials are returned, store them and auto-login
      if (applicationResponse.candidateCredentials) {
        setCredentials(applicationResponse.candidateCredentials);
        // Store token for auto-login
        localStorage.setItem('access_token', applicationResponse.candidateCredentials.token);
        console.log('✅ New account created and logged in automatically');
      }

      setSuccess(true);

      // Start countdown for redirect
      if (applicationResponse.candidateCredentials || isAuthenticated) {
        const interval = setInterval(() => {
          setRedirectCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      console.error("Failed to submit application:", err);
      
      // Extract detailed error message from GraphQL errors
      let errorMessage = "Failed to submit application. Please try again.";
      
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        const graphQLError = err.graphQLErrors[0];
        if (graphQLError.extensions?.originalError?.message) {
          const messages = graphQLError.extensions.originalError.message;
          errorMessage = Array.isArray(messages) ? messages.join(', ') : messages;
        } else {
          errorMessage = graphQLError.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format job type
  const formatJobType = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "Full-time";
      case "PART_TIME":
        return "Part-time";
      case "CONTRACT":
        return "Contract";
      case "FREELANCE":
        return "Freelance";
      default:
        return type;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="bg-white rounded-lg shadow-sm p-8">
            <Skeleton className="h-10 w-3/4 mb-6" />
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Job Not Found
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
            <Link href="/jobs">
              <Button className="bg-primary-600 hover:bg-primary-700">
                Back to Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header Section */}
            <div className="p-12 pb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-3 tracking-tight">
                Application Submitted
              </h2>
              <p className="text-gray-600 leading-relaxed text-base">
                Your application for <span className="font-semibold text-gray-900">{job?.title}</span> has been
                successfully submitted. The hiring team will review your
                application and get back to you soon.
              </p>
            </div>

            {/* Show credentials if account was created */}
            {credentials && (
              <div className="px-12 pb-8">
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8 text-left border border-primary-100">
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-primary-200">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        Account Created
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Save these credentials to access your account
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                        Email Address
                      </label>
                      <div className="bg-white rounded-xl px-5 py-4 border border-gray-200 shadow-sm">
                        <p className="text-base font-medium text-gray-900 break-all">{credentials.email}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                        Temporary Password
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white rounded-xl px-5 py-4 border border-gray-200 shadow-sm">
                          <code className="text-2xl font-mono font-semibold text-gray-900 tracking-wider">
                            {credentials.password}
                          </code>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(credentials.password);
                            alert('Password copied to clipboard!');
                          }}
                          className="p-4 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-200 shadow-sm transition-all duration-200 hover:border-primary-300 hover:shadow"
                          title="Copy password"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-semibold text-gray-900">Important:</span> Save this password securely. You can change it after logging in.
                    </p>
                  </div>
                  
                  <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      A copy of your credentials has been sent to your phone via SMS.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-12 pb-12">
              <div className="space-y-3">
                {credentials || isAuthenticated ? (
                  <>
                    <Link href="/userdashboard/applications" className="block">
                      <Button className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-6 text-base font-semibold rounded-xl shadow-lg shadow-primary-200 transition-all duration-200 hover:shadow-xl">
                        {credentials && redirectCountdown > 0
                          ? `Redirecting to Dashboard in ${redirectCountdown}s...`
                          : credentials
                          ? "Go to Dashboard"
                          : "View My Applications"}
                      </Button>
                    </Link>
                    <Link href="/jobs" className="block">
                      <Button variant="outline" className="w-full py-6 text-base font-medium rounded-xl border-gray-300 hover:border-primary-400 hover:bg-primary-50 transition-all duration-200">
                        Browse More Jobs
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/signup" className="block">
                      <Button className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-6 text-base font-semibold rounded-xl shadow-lg shadow-primary-200 transition-all duration-200 hover:shadow-xl">
                        Create Account to Track Application
                      </Button>
                    </Link>
                    <Link href="/jobs" className="block">
                      <Button variant="outline" className="w-full py-6 text-base font-medium rounded-xl border-gray-300 hover:border-primary-400 hover:bg-primary-50 transition-all duration-200">
                        Browse More Jobs
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              
              {!credentials && !isAuthenticated && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-600 text-center">
                    <span className="font-medium text-gray-900">Tip:</span> Create an account to track applications and get updates
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/jobs" className="hover:text-gray-700">
            Jobs
          </Link>
          <span className="mx-2 text-gray-300">/</span>
          <Link href={`/jobs/${slug}`} className="hover:text-gray-700">
            {job?.title}
          </Link>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-gray-900">Apply</span>
        </nav>

        {/* Job Info Card */}
        {job && (
          <Card className="mb-8 border-primary-100 bg-primary-50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Applying for: {job.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span>{job.companyData?.name || job.company}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8"
                    />
                  </svg>
                  <span>{formatJobType(job.type)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Submit Your Application
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Fill in the form below to apply for this position. All fields
              marked with * are required.
            </p>
            {!isAuthenticated && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      Applying as a guest
                    </p>
                    <p className="text-sm text-blue-700">
                      You can apply without an account. However,{" "}
                      <Link href="/signup" className="underline font-medium">
                        creating an account
                      </Link>{" "}
                      lets you track your applications, save jobs, and get notified about updates.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Personal Information
                </h3>

                <div>
                  <Label htmlFor="fullName">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={formErrors.fullName ? "border-red-500" : ""}
                  />
                  {formErrors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.fullName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john.doe@example.com"
                      className={formErrors.email ? "border-red-500" : ""}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      className={formErrors.phone ? "border-red-500" : ""}
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                    <Input
                      id="linkedIn"
                      name="linkedIn"
                      type="url"
                      value={formData.linkedIn}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/johndoe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="portfolio">Portfolio / Website</Label>
                    <Input
                      id="portfolio"
                      name="portfolio"
                      type="url"
                      value={formData.portfolio}
                      onChange={handleInputChange}
                      placeholder="https://johndoe.com"
                    />
                  </div>
                </div>
              </div>

              {/* Resume Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Resume / CV
                </h3>

                <div>
                  <Label htmlFor="resume">
                    Upload Resume <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-2">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="resume"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                          formErrors.resume
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-8 h-8 mb-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          {formData.resume ? (
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">
                                {formData.resume.name}
                              </span>
                            </p>
                          ) : (
                            <>
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">
                                  Click to upload
                                </span>{" "}
                                or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">
                                PDF or Word (Max 5MB)
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          id="resume"
                          name="resume"
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>
                  {formErrors.resume && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.resume}
                    </p>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Cover Letter (Optional)
                </h3>

                <div>
                  <Label htmlFor="coverLetter">
                    Why are you interested in this role?
                  </Label>
                  <Textarea
                    id="coverLetter"
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    placeholder="Tell us why you're a great fit for this position..."
                    rows={6}
                    className={formErrors.coverLetter ? "border-red-500" : ""}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Optional: Share your motivation and why you'd be a great fit
                  </p>
                  {formErrors.coverLetter && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.coverLetter}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Additional Information
                </h3>

                <div>
                  <Label htmlFor="noticePeriod">Notice Period</Label>
                  <Input
                    id="noticePeriod"
                    name="noticePeriod"
                    type="text"
                    value={formData.noticePeriod}
                    onChange={handleInputChange}
                    placeholder="e.g., 2 weeks, Immediate"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Optional: Let us know your availability
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      Submitting Application...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
                <Link href={`/jobs/${slug}`}>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
