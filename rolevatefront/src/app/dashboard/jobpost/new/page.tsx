"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  DocumentTextIcon,
  LightBulbIcon,
  ClockIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import {
  createJob,
  CreateJobData,
} from "@/services/jobs.service";

interface JobFormData {
  title: string;
  department: string;
  location: string;
  workType: "ONSITE" | "REMOTE" | "HYBRID";
  experienceLevel:
    | "ENTRY_LEVEL"
    | "JUNIOR"
    | "MID_LEVEL"
    | "SENIOR"
    | "LEAD"
    | "PRINCIPAL"
    | "EXECUTIVE";
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  skills: string[];
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  enableAiInterview: boolean;
  interviewDuration?: number;
  aiPrompt?: string;
  aiInstructions?: string;
}

const NewJobPost = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    department: "",
    location: "",
    workType: "ONSITE",
    experienceLevel: "MID_LEVEL",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    skills: [],
    currency: "AED", // Default to AED for UAE market
    enableAiInterview: true, // Default to enabled
    interviewDuration: 30,
    aiPrompt: "",
    aiInstructions: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [skillSuggestions] = useState([
    "JavaScript",
    "React.js",
    "Node.js",
    "Python",
    "TypeScript",
    "Next.js",
    "Express.js",
    "MongoDB",
    "PostgreSQL",
    "AWS",
    "Docker",
    "Kubernetes",
    "Project Management",
    "Agile/Scrum",
    "Leadership",
    "Communication",
    "Problem Solving",
    "Arabic",
    "English",
    "Banking",
    "Finance",
    "Risk Management",
    "Compliance",
    "Customer Service",
    "Sales",
    "Marketing",
    "Data Analysis",
    "SQL",
    "Excel",
    "PowerBI",
    "Tableau",
  ]);

  // AI Prompt Templates
  const generateAiPrompt = (jobTitle: string, department: string, requirements: string) => {
    return `System: You are Al-hussein Abdullah, a friendly and professional AI HR assistant for Capital Bank. You are conducting a structured interview for the ${jobTitle} position in ${department}.

Your behavior:
- Ask one focused question at a time
- Listen respectfully and keep a professional but warm tone
- Never explain answers or offer feedback
- Use brief, polite transitions like "Thanks for sharing that" or "Got it, let's move on"
- Wait for complete answers before asking the next question

Interview sequence:
1. Welcome and introduction
2. Relevant experience for this role
3. Technical skills and expertise
4. Previous achievements and accomplishments
5. Problem-solving approach
6. Team collaboration experience
7. Goals and career aspirations
8. Availability and work preferences
9. Salary expectations
10. Questions about the role or company

Close the interview with a polite thank-you message.

Key requirements to assess: ${requirements.slice(0, 200)}...`;
  };

  const generateAiInstructions = (jobTitle: string) => {
    return `Start the interview with: "Hello and welcome to your official virtual interview for the ${jobTitle} position at Capital Bank. I'm Al-hussein Abdullah, your virtual HR assistant. This is a formal evaluation, but please feel comfortable and answer naturally. Let's begin."

Interview Guidelines:
- Maintain a professional yet welcoming tone throughout
- Ask follow-up questions when answers are too brief
- Take note of specific examples and achievements
- Assess both technical skills and cultural fit
- Allow natural conversation flow while covering all key areas
- End with clear next steps information`;
  };

  // Auto-generate AI prompt and instructions when job details change
  useEffect(() => {
    if (formData.title && formData.department && formData.requirements && formData.enableAiInterview) {
      const newAiPrompt = generateAiPrompt(formData.title, formData.department, formData.requirements);
      const newAiInstructions = generateAiInstructions(formData.title);
      
      // Only update if they're empty or significantly different (to avoid overwriting manual edits)
      if (!formData.aiPrompt || formData.aiPrompt.length < 50) {
        setFormData(prev => ({ ...prev, aiPrompt: newAiPrompt }));
      }
      if (!formData.aiInstructions || formData.aiInstructions.length < 50) {
        setFormData(prev => ({ ...prev, aiInstructions: newAiInstructions }));
      }
    }
  }, [formData.title, formData.department, formData.requirements, formData.enableAiInterview]);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && autoSaveStatus !== 'saving') {
      setAutoSaveStatus('saving');
      const timer = setTimeout(() => {
        // Save to localStorage
        localStorage.setItem('job_draft', JSON.stringify(formData));
        setAutoSaveStatus('saved');
        setIsDirty(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [formData, isDirty, autoSaveStatus]);

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('job_draft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        if (parsedDraft.title) { // Only load if it has content
          setFormData(parsedDraft);
        }
      } catch (err) {
        console.error('Error loading draft:', err);
      }
    }
  }, []);

  // Real-time validation
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const validateField = useCallback((name: string, value: any) => {
    const errors: {[key: string]: string} = {};
    
    switch (name) {
      case 'title':
        if (!value.trim()) {
          errors.title = 'Job title is required';
        } else if (value.length < 3) {
          errors.title = 'Job title must be at least 3 characters';
        } else if (value.length > 100) {
          errors.title = 'Job title must be less than 100 characters';
        }
        break;
      case 'department':
        if (!value.trim()) {
          errors.department = 'Department is required';
        }
        break;
      case 'location':
        if (!value.trim()) {
          errors.location = 'Location is required';
        }
        break;
      case 'description':
        if (!value.trim()) {
          errors.description = 'Job description is required';
        } else if (value.length < 50) {
          errors.description = 'Description should be at least 50 characters';
        }
        break;
      case 'requirements':
        if (!value.trim()) {
          errors.requirements = 'Requirements are required';
        }
        break;
      case 'skills':
        if (!Array.isArray(value) || value.length === 0) {
          errors.skills = 'At least one skill is required';
        }
        break;
      case 'salaryMin':
        if (value && formData.salaryMax && value >= formData.salaryMax) {
          errors.salaryMin = 'Minimum salary must be less than maximum';
        }
        break;
      case 'salaryMax':
        if (value && formData.salaryMin && value <= formData.salaryMin) {
          errors.salaryMax = 'Maximum salary must be greater than minimum';
        }
        break;
      case 'aiPrompt':
        if (formData.enableAiInterview && (!value || !value.trim())) {
          errors.aiPrompt = 'AI prompt is required when AI interview is enabled';
        } else if (value && value.length > 2000) {
          errors.aiPrompt = 'AI prompt must be less than 2000 characters';
        }
        break;
      case 'aiInstructions':
        if (formData.enableAiInterview && (!value || !value.trim())) {
          errors.aiInstructions = 'AI instructions are required when AI interview is enabled';
        } else if (value && value.length > 1500) {
          errors.aiInstructions = 'AI instructions must be less than 1500 characters';
        }
        break;
    }

    setFieldErrors(prev => ({
      ...prev,
      [name]: errors[name] || ''
    }));

    return Object.keys(errors).length === 0;
  }, [formData.salaryMin, formData.salaryMax, formData.enableAiInterview]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number(value) : undefined,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Mark as dirty and validate field
    setIsDirty(true);
    setAutoSaveStatus('unsaved');
    validateField(name, type === "checkbox" ? (e.target as HTMLInputElement).checked : 
                        type === "number" ? (value ? Number(value) : undefined) : value);
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      const newSkills = [...formData.skills, skillInput.trim()];
      setFormData((prev) => ({
        ...prev,
        skills: newSkills,
      }));
      setSkillInput("");
      setIsDirty(true);
      setAutoSaveStatus('unsaved');
      validateField('skills', newSkills);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const newSkills = formData.skills.filter((skill) => skill !== skillToRemove);
    setFormData((prev) => ({
      ...prev,
      skills: newSkills,
    }));
    setIsDirty(true);
    setAutoSaveStatus('unsaved');
    validateField('skills', newSkills);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const errors: {[key: string]: string} = {};

    // Validate all required fields
    if (!formData.title.trim()) {
      errors.title = "Job title is required";
      isValid = false;
    }
    if (formData.title.length < 3) {
      errors.title = "Job title must be at least 3 characters long";
      isValid = false;
    }
    if (!formData.department.trim()) {
      errors.department = "Department is required";
      isValid = false;
    }
    if (!formData.location.trim()) {
      errors.location = "Location is required";
      isValid = false;
    }
    if (!formData.description.trim()) {
      errors.description = "Job description is required";
      isValid = false;
    }
    if (formData.description.length < 50) {
      errors.description = "Job description should be at least 50 characters long";
      isValid = false;
    }
    if (!formData.requirements.trim()) {
      errors.requirements = "Job requirements are required";
      isValid = false;
    }
    if (formData.skills.length === 0) {
      errors.skills = "At least one skill is required";
      isValid = false;
    }
    if (
      formData.salaryMin &&
      formData.salaryMax &&
      formData.salaryMin >= formData.salaryMax
    ) {
      errors.salaryMax = "Maximum salary must be greater than minimum salary";
      isValid = false;
    }
    if (
      formData.enableAiInterview &&
      (!formData.interviewDuration || formData.interviewDuration < 10)
    ) {
      errors.interviewDuration = "Interview duration must be at least 10 minutes when AI interview is enabled";
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) {
      setError("Please fix the errors above before submitting");
    }
    return isValid;
  };

  const handleApiError = (err: unknown): string => {
    if (err instanceof Error) {
      return err.message;
    }
    return "An unexpected error occurred";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare job data for API
      const jobData: CreateJobData = {
        title: formData.title,
        department: formData.department,
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities || undefined,
        benefits: formData.benefits || undefined,
        skills: formData.skills,
        experienceLevel: formData.experienceLevel as any,
        location: formData.location,
        workType: formData.workType as any,
        salaryMin: formData.salaryMin,
        salaryMax: formData.salaryMax,
        currency: formData.currency,
        enableAiInterview: formData.enableAiInterview,
        interviewDuration: formData.interviewDuration,
        // Use the form data AI fields (which are auto-generated but can be customized)
        aiPrompt: formData.enableAiInterview ? formData.aiPrompt : undefined,
        aiInstructions: formData.enableAiInterview ? formData.aiInstructions : undefined,
      };

      // Call the real API
      const response = await createJob(jobData);

      console.log("Job created successfully:", response);
      setSuccess(true);

      // Clear draft
      localStorage.removeItem('job_draft');

      // Redirect to job posts after a delay
      setTimeout(() => {
        router.push("/dashboard/jobpost");
      }, 2000);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    const requiredFields = [
      formData.title.trim(),
      formData.department.trim(),
      formData.location.trim(),
      formData.description.trim(),
      formData.requirements.trim(),
      formData.skills.length > 0,
    ];
    
    // Add AI fields if AI interview is enabled
    if (formData.enableAiInterview) {
      requiredFields.push(
        formData.aiPrompt?.trim() || false,
        formData.aiInstructions?.trim() || false
      );
    }
    
    const completedFields = requiredFields.filter(Boolean).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) return;
    }
    localStorage.removeItem('job_draft');
    router.push("/dashboard/jobpost");
  };

  const clearDraft = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all form data?"
    );
    if (confirmed) {
      localStorage.removeItem('job_draft');
      setFormData({
        title: "",
        department: "",
        location: "",
        workType: "ONSITE",
        experienceLevel: "MID_LEVEL",
        description: "",
        requirements: "",
        responsibilities: "",
        benefits: "",
        skills: [],
        currency: "AED",
        enableAiInterview: true,
        interviewDuration: 30,
        aiPrompt: "",
        aiInstructions: "",
      });
      setFieldErrors({});
      setIsDirty(false);
      setAutoSaveStatus('saved');
    }
  };

  const handleSkillSuggestionClick = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      const newSkills = [...formData.skills, skill];
      setFormData((prev) => ({
        ...prev,
        skills: newSkills,
      }));
      setIsDirty(true);
      setAutoSaveStatus('unsaved');
      validateField('skills', newSkills);
    }
  };

  const progress = calculateProgress();

  if (success) {
    return (
      <div className="flex-1 min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-lg w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="h-10 w-10 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Job Post Created Successfully! 🎉
            </h2>
            <p className="text-gray-400 mb-6">
              Your job post "
              <span className="text-[#00C6AD] font-medium">
                {formData.title}
              </span>
              " has been created and is now live on the platform.
              {formData.enableAiInterview &&
                " AI interviews are ready to screen candidates automatically."}
            </p>

            <div className="bg-gray-750 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-white font-medium mb-2">
                What happens next?
              </h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>✅ Job is immediately visible to candidates</li>
                <li>
                  📧 You'll receive email notifications for new applications
                </li>
                {formData.enableAiInterview && (
                  <li>🤖 AI will conduct initial interviews automatically</li>
                )}
                <li>📊 Track performance in your dashboard</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/dashboard/jobpost")}
                className="px-6 py-3 bg-[#00C6AD] text-white rounded-lg hover:bg-[#14B8A6] transition-colors font-medium"
              >
                View All Job Posts
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Create Another Job
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center mt-6">
            Redirecting to dashboard in a few seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-900">
      <div className="px-6 md:px-20 py-6 md:py-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BriefcaseIcon className="h-8 w-8 text-[#00C6AD]" />
              Create New Job Post
            </h1>
            <p className="text-gray-400 mt-1">
              Fill in the details below to create a new job posting
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Auto-save status */}
            <div className="flex items-center gap-2 text-sm">
              {autoSaveStatus === 'saving' && (
                <>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-yellow-400">Saving...</span>
                </>
              )}
              {autoSaveStatus === 'saved' && (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400">Saved</span>
                </>
              )}
              {autoSaveStatus === 'unsaved' && (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-400">Unsaved changes</span>
                </>
              )}
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-[#00C6AD] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-400">{progress}%</span>
            </div>

            {/* Action buttons */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <EyeIcon className="h-4 w-4" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            
            <button
              onClick={clearDraft}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <DocumentTextIcon className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-600/30 rounded-lg p-4 flex items-start gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-300 font-medium">Error</h3>
              <p className="text-red-200 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Preview Mode */}
        {showPreview ? (
          <div className="max-w-4xl">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Job Preview</h2>
                <span className="px-3 py-1 bg-[#00C6AD]/20 text-[#00C6AD] rounded-full text-sm">
                  Preview Mode
                </span>
              </div>
              
              {/* Job Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">
                  {formData.title || "Job Title"}
                </h1>
                <div className="flex flex-wrap gap-4 text-gray-400">
                  <span>{formData.department || "Department"}</span>
                  <span>•</span>
                  <span>{formData.location || "Location"}</span>
                  <span>•</span>
                  <span className="capitalize">{formData.workType.toLowerCase()}</span>
                  <span>•</span>
                  <span>{formData.experienceLevel.replace('_', ' ')}</span>
                </div>
                {(formData.salaryMin || formData.salaryMax) && (
                  <div className="mt-2">
                    <span className="text-[#00C6AD] font-medium">
                      {formData.currency} {formData.salaryMin?.toLocaleString()} - {formData.salaryMax?.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Job Content */}
              <div className="space-y-6">
                {formData.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Job Description</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{formData.description}</p>
                  </div>
                )}

                {formData.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Requirements</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{formData.requirements}</p>
                  </div>
                )}

                {formData.responsibilities && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Responsibilities</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{formData.responsibilities}</p>
                  </div>
                )}

                {formData.benefits && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Benefits</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{formData.benefits}</p>
                  </div>
                )}

                {formData.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#00C6AD]/20 text-[#00C6AD] rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {formData.enableAiInterview && (
                  <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                    <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                      <DocumentTextIcon className="h-5 w-5" />
                      AI Interview Configuration
                    </h3>
                    <div className="space-y-3 text-sm">
                      <p className="text-blue-200">
                        <strong>Duration:</strong> {formData.interviewDuration} minutes
                      </p>
                      <p className="text-blue-200">
                        <strong>Language Support:</strong> Arabic & English
                      </p>
                      {formData.aiPrompt && (
                        <div>
                          <p className="text-blue-200 font-medium mb-1">AI Interviewer Prompt:</p>
                          <div className="bg-blue-900/30 rounded p-2 text-blue-100 text-xs max-h-20 overflow-y-auto">
                            {formData.aiPrompt.substring(0, 150)}...
                          </div>
                        </div>
                      )}
                      {formData.aiInstructions && (
                        <div>
                          <p className="text-blue-200 font-medium mb-1">Interview Instructions:</p>
                          <div className="bg-blue-900/30 rounded p-2 text-blue-100 text-xs max-h-20 overflow-y-auto">
                            {formData.aiInstructions.substring(0, 150)}...
                          </div>
                        </div>
                      )}
                      <p className="text-blue-200 text-xs italic">
                        Qualified candidates will be automatically invited to complete an AI-powered interview.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || progress < 100}
                className="px-6 py-3 bg-[#00C6AD] text-white rounded-lg hover:bg-[#14B8A6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-5 w-5" />
                    Create Job Post
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Form Mode */
        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Job Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
                    fieldErrors.title ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="e.g. Senior Full Stack Developer, Banking Operations Manager, Data Analyst"
                  required
                />
                {fieldErrors.title && (
                  <p className="text-red-400 text-sm mt-1">{fieldErrors.title}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
                    fieldErrors.department ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="e.g. Engineering, Finance, Marketing, Operations, HR"
                  required
                />
                {fieldErrors.department && (
                  <p className="text-red-400 text-sm mt-1">{fieldErrors.department}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
                    fieldErrors.location ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="e.g. Dubai, UAE / Abu Dhabi, UAE / Riyadh, Saudi Arabia"
                  required
                />
                {fieldErrors.location && (
                  <p className="text-red-400 text-sm mt-1">{fieldErrors.location}</p>
                )}
              </div>

              {/* Work Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Work Type *
                </label>
                <select
                  name="workType"
                  value={formData.workType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                >
                  <option value="ONSITE">On-site</option>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Experience Level *
                </label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                >
                  <option value="ENTRY_LEVEL">Entry Level</option>
                  <option value="JUNIOR">Junior</option>
                  <option value="MID_LEVEL">Mid Level</option>
                  <option value="SENIOR">Senior</option>
                  <option value="LEAD">Lead</option>
                  <option value="PRINCIPAL">Principal</option>
                  <option value="EXECUTIVE">Executive</option>
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                >
                  <option value="AED">AED (UAE Dirham)</option>
                  <option value="SAR">SAR (Saudi Riyal)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (British Pound)</option>
                  <option value="KWD">KWD (Kuwaiti Dinar)</option>
                  <option value="QAR">QAR (Qatari Riyal)</option>
                  <option value="BHD">BHD (Bahraini Dinar)</option>
                </select>
              </div>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Salary
                </label>
                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin || ""}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
                    fieldErrors.salaryMin ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="e.g. 15000 (monthly)"
                  min="0"
                  step="500"
                />
                {fieldErrors.salaryMin && (
                  <p className="text-red-400 text-sm mt-1">{fieldErrors.salaryMin}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Maximum Salary
                </label>
                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax || ""}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
                    fieldErrors.salaryMax ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="e.g. 25000 (monthly)"
                  min="0"
                  step="500"
                />
                {fieldErrors.salaryMax && (
                  <p className="text-red-400 text-sm mt-1">{fieldErrors.salaryMax}</p>
                )}
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Job Details
            </h2>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Description *
              </label>
              <div className="relative">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
                    fieldErrors.description ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Provide a comprehensive overview of the role. Include: what the candidate will do day-to-day, the team they'll work with, growth opportunities, company culture, and what makes this position unique and exciting. Be specific about the impact they'll have on the organization."
                  required
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {formData.description.length}/2000
                </div>
              </div>
              {fieldErrors.description && (
                <p className="text-red-400 text-sm mt-1">{fieldErrors.description}</p>
              )}
              {formData.description.length >= 50 && (
                <p className="text-green-400 text-sm mt-1">✓ Good description length</p>
              )}
            </div>

            {/* Requirements */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Requirements *
              </label>
              <div className="relative">
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
                    fieldErrors.requirements ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="List essential qualifications, experience, and skills. Include: years of experience, specific technologies, education requirements, certifications, language skills, and any industry-specific knowledge. Be clear about what's required vs. preferred."
                  required
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {formData.requirements.length}/1500
                </div>
              </div>
              {fieldErrors.requirements && (
                <p className="text-red-400 text-sm mt-1">{fieldErrors.requirements}</p>
              )}
            </div>

            {/* Responsibilities */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Responsibilities
              </label>
              <textarea
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                placeholder="Detail the key responsibilities and day-to-day activities. Include: main duties, project involvement, stakeholder interactions, deliverables, and success metrics. Help candidates understand what they'll be accountable for."
              />
            </div>

            {/* Benefits */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Benefits
              </label>
              <textarea
                name="benefits"
                value={formData.benefits}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                placeholder="Highlight the compensation package and perks. Include: health insurance, flexible working, training budget, performance bonuses, vacation days, career development opportunities, and any unique company benefits."
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Required Skills *
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Add relevant skills, technologies, or qualifications. Examples:
                React.js, Project Management, Arabic/English, Banking Experience
              </p>
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`flex-1 px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
                      fieldErrors.skills ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Type a skill and press Enter or click Add..."
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    disabled={!skillInput.trim()}
                    className="px-4 py-3 bg-[#00C6AD] text-white rounded-lg hover:bg-[#14B8A6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Add
                  </button>
                </div>
                {fieldErrors.skills && (
                  <p className="text-red-400 text-sm mt-1">{fieldErrors.skills}</p>
                )}
              </div>

              {/* Smart Skills Suggestions */}
              {skillInput.length > 2 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {skillSuggestions
                      .filter(skill => 
                        skill.toLowerCase().includes(skillInput.toLowerCase()) &&
                        !formData.skills.includes(skill)
                      )
                      .slice(0, 6)
                      .map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleSkillSuggestionClick(skill)}
                          className="px-3 py-1 text-xs bg-gray-600 text-gray-300 rounded-full hover:bg-[#00C6AD] hover:text-white transition-colors"
                        >
                          + {skill}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Popular Skills Suggestions */}
              {formData.skills.length === 0 && skillInput.length === 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">
                    Popular skills to get you started:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "JavaScript",
                      "React.js",
                      "Node.js",
                      "Python",
                      "Project Management",
                      "Arabic",
                      "English",
                      "Banking",
                      "Finance",
                      "Leadership",
                    ].map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleSkillSuggestionClick(skill)}
                        className="px-3 py-1 text-xs bg-gray-600 text-gray-300 rounded-full hover:bg-[#00C6AD] hover:text-white transition-colors"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Display */}
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-[#00C6AD]/10 border border-[#00C6AD]/30 text-[#00C6AD] rounded-lg text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-[#00C6AD] hover:text-red-400 transition-colors"
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {formData.skills.length > 0 && (
                <p className="text-green-400 text-sm mt-2">
                  ✓ {formData.skills.length} skill{formData.skills.length !== 1 ? "s" : ""} added
                </p>
              )}
            </div>
          </div>

          {/* AI Interview Settings */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              AI Interview Settings
            </h2>

            <div className="flex items-start gap-3 mb-4">
              <input
                type="checkbox"
                name="enableAiInterview"
                checked={formData.enableAiInterview}
                onChange={handleInputChange}
                className="w-5 h-5 text-[#00C6AD] bg-gray-700 border-gray-600 rounded focus:ring-[#00C6AD] focus:ring-2 mt-0.5"
              />
              <div>
                <label className="text-gray-300 font-medium">
                  Enable AI-powered interview for this position
                </label>
                <p className="text-sm text-gray-400 mt-1">
                  AI interviews help screen candidates efficiently with
                  bilingual support (Arabic/English) and consistent evaluation
                  criteria. Qualified candidates will be invited to an automated
                  interview session.
                </p>
              </div>
            </div>

            {formData.enableAiInterview && (
              <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Interview Duration (minutes)
                    </label>
                    <select
                      name="interviewDuration"
                      value={formData.interviewDuration || 30}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
                        fieldErrors.interviewDuration ? 'border-red-500' : 'border-gray-600'
                      }`}
                    >
                      <option value={15}>15 minutes (Quick screening)</option>
                      <option value={30}>30 minutes (Standard)</option>
                      <option value={45}>45 minutes (Comprehensive)</option>
                      <option value={60}>
                        60 minutes (Detailed assessment)
                      </option>
                    </select>
                    {fieldErrors.interviewDuration && (
                      <p className="text-red-400 text-sm mt-1">{fieldErrors.interviewDuration}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Interview Language
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent"
                      defaultValue="both"
                    >
                      <option value="both">Arabic & English</option>
                      <option value="english">English Only</option>
                      <option value="arabic">Arabic Only</option>
                    </select>
                  </div>
                </div>
                
                {/* AI Prompt Configuration */}
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      AI Interview Prompt
                      <span className="text-xs text-gray-400 ml-2">(Auto-generated, but you can customize)</span>
                    </label>
                    <textarea
                      name="aiPrompt"
                      value={formData.aiPrompt || ''}
                      onChange={handleInputChange}
                      rows={8}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
                        fieldErrors.aiPrompt ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="AI prompt will be auto-generated based on job details..."
                    />
                    <div className="flex justify-between items-center mt-1">
                      {fieldErrors.aiPrompt && (
                        <p className="text-red-400 text-sm">{fieldErrors.aiPrompt}</p>
                      )}
                      <p className="text-xs text-gray-400 ml-auto">
                        {formData.aiPrompt?.length || 0}/2000 characters
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newPrompt = generateAiPrompt(
                          formData.title || 'Position',
                          formData.department || 'Department',
                          formData.requirements || 'Requirements'
                        );
                        setFormData(prev => ({ ...prev, aiPrompt: newPrompt }));
                        setIsDirty(true);
                        setAutoSaveStatus('unsaved');
                      }}
                      className="mt-2 text-xs bg-[#00C6AD]/20 text-[#00C6AD] px-3 py-1 rounded-md hover:bg-[#00C6AD]/30 transition-colors"
                    >
                      🔄 Regenerate Prompt
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      AI Interview Instructions
                      <span className="text-xs text-gray-400 ml-2">(Guidelines for the AI interviewer)</span>
                    </label>
                    <textarea
                      name="aiInstructions"
                      value={formData.aiInstructions || ''}
                      onChange={handleInputChange}
                      rows={6}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent transition-colors ${
                        fieldErrors.aiInstructions ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="AI instructions will be auto-generated based on job details..."
                    />
                    <div className="flex justify-between items-center mt-1">
                      {fieldErrors.aiInstructions && (
                        <p className="text-red-400 text-sm">{fieldErrors.aiInstructions}</p>
                      )}
                      <p className="text-xs text-gray-400 ml-auto">
                        {formData.aiInstructions?.length || 0}/1500 characters
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newInstructions = generateAiInstructions(formData.title || 'Position');
                        setFormData(prev => ({ ...prev, aiInstructions: newInstructions }));
                        setIsDirty(true);
                        setAutoSaveStatus('unsaved');
                      }}
                      className="mt-2 text-xs bg-[#00C6AD]/20 text-[#00C6AD] px-3 py-1 rounded-md hover:bg-[#00C6AD]/30 transition-colors"
                    >
                      🔄 Regenerate Instructions
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-gray-400">
                    💡 AI interviews are automatically scheduled after
                    candidates pass initial screening. The prompt and instructions
                    are auto-generated but can be customized to match your specific requirements.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Helpful Tips */}
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-sm">💡</span>
              </div>
              <div>
                <h3 className="text-blue-300 font-semibold mb-2">
                  Tips for Creating Effective Job Posts
                </h3>
                <ul className="text-sm text-blue-200/80 space-y-1">
                  <li>
                    • Use clear, specific job titles that candidates would
                    search for
                  </li>
                  <li>
                    • Include salary ranges to attract the right candidates
                  </li>
                  <li>
                    • Be specific about required vs. preferred qualifications
                  </li>
                  <li>• Mention growth opportunities and company culture</li>
                  <li>
                    • Use AI interviews to efficiently screen large candidate
                    pools
                  </li>
                  <li>
                    • Include both Arabic and English if targeting bilingual
                    candidates
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#00C6AD] text-white rounded-lg hover:bg-[#14B8A6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5" />
                  Create Job Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewJobPost;
