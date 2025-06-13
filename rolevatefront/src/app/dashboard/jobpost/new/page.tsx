"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { createJob, CreateJobData } from "@/services/jobs.service";
import {
  JobFormData,
  JobInformation,
  JobDetails,
  SkillsManagement,
  AIInterviewSettings,
  JobPreview,
  FormHeader,
  JobCreationTips,
} from "@/components/job-creation";

const NewJobPost = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "saved" | "saving" | "unsaved"
  >("saved");

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
    currency: "JOD",
    enableAiInterview: true,
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
  const generateAiPrompt = (
    jobTitle: string,
    department: string,
    requirements: string
  ) => {
    return `System: You are Laila AlNoor, a friendly and professional AI HR assistant for Capital Bank. You are conducting a structured interview for the ${jobTitle} position in ${department}.

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
    return `Start the interview with: "Hello and welcome to your official virtual interview for the ${jobTitle} position at Capital Bank. I'm Laila AlNoor, your virtual HR assistant. This is a formal evaluation, but please feel comfortable and answer naturally. Let's begin."

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
    if (
      formData.title &&
      formData.department &&
      formData.requirements &&
      formData.enableAiInterview
    ) {
      const newAiPrompt = generateAiPrompt(
        formData.title,
        formData.department,
        formData.requirements
      );
      const newAiInstructions = generateAiInstructions(formData.title);

      // Only update if they're empty or significantly different (to avoid overwriting manual edits)
      if (!formData.aiPrompt || formData.aiPrompt.length < 50) {
        setFormData((prev) => ({ ...prev, aiPrompt: newAiPrompt }));
      }
      if (!formData.aiInstructions || formData.aiInstructions.length < 50) {
        setFormData((prev) => ({ ...prev, aiInstructions: newAiInstructions }));
      }
    }
  }, [
    formData.title,
    formData.department,
    formData.requirements,
    formData.enableAiInterview,
  ]);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && autoSaveStatus !== "saving") {
      setAutoSaveStatus("saving");
      const timer = setTimeout(() => {
        localStorage.setItem("job_draft", JSON.stringify(formData));
        setAutoSaveStatus("saved");
        setIsDirty(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [formData, isDirty, autoSaveStatus]);

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("job_draft");
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        if (parsedDraft.title) {
          setFormData(parsedDraft);
        }
      } catch (err) {
        console.error("Error loading draft:", err);
      }
    }
  }, []);

  // Real-time validation
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const validateField = useCallback(
    (name: string, value: any) => {
      const errors: { [key: string]: string } = {};

      switch (name) {
        case "title":
          if (!value.trim()) {
            errors.title = "Job title is required";
          } else if (value.length < 3) {
            errors.title = "Job title must be at least 3 characters";
          } else if (value.length > 100) {
            errors.title = "Job title must be less than 100 characters";
          }
          break;
        case "department":
          if (!value.trim()) {
            errors.department = "Department is required";
          }
          break;
        case "location":
          if (!value.trim()) {
            errors.location = "Location is required";
          }
          break;
        case "description":
          if (!value.trim()) {
            errors.description = "Job description is required";
          } else if (value.length < 50) {
            errors.description = "Description should be at least 50 characters";
          }
          break;
        case "requirements":
          if (!value.trim()) {
            errors.requirements = "Requirements are required";
          }
          break;
        case "skills":
          if (!Array.isArray(value) || value.length === 0) {
            errors.skills = "At least one skill is required";
          }
          break;
        case "salaryMin":
          if (value && formData.salaryMax && value >= formData.salaryMax) {
            errors.salaryMin = "Minimum salary must be less than maximum";
          }
          break;
        case "salaryMax":
          if (value && formData.salaryMin && value <= formData.salaryMin) {
            errors.salaryMax = "Maximum salary must be greater than minimum";
          }
          break;
        case "aiPrompt":
          if (formData.enableAiInterview && (!value || !value.trim())) {
            errors.aiPrompt =
              "AI prompt is required when AI interview is enabled";
          } else if (value && value.length > 2000) {
            errors.aiPrompt = "AI prompt must be less than 2000 characters";
          }
          break;
        case "aiInstructions":
          if (formData.enableAiInterview && (!value || !value.trim())) {
            errors.aiInstructions =
              "AI instructions are required when AI interview is enabled";
          } else if (value && value.length > 1500) {
            errors.aiInstructions =
              "AI instructions must be less than 1500 characters";
          }
          break;
      }

      setFieldErrors((prev) => ({
        ...prev,
        [name]: errors[name] || "",
      }));

      return Object.keys(errors).length === 0;
    },
    [formData.salaryMin, formData.salaryMax, formData.enableAiInterview]
  );

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

    setIsDirty(true);
    setAutoSaveStatus("unsaved");
    validateField(
      name,
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
        ? value
          ? Number(value)
          : undefined
        : value
    );
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
      setAutoSaveStatus("unsaved");
      validateField("skills", newSkills);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const newSkills = formData.skills.filter(
      (skill) => skill !== skillToRemove
    );
    setFormData((prev) => ({
      ...prev,
      skills: newSkills,
    }));
    setIsDirty(true);
    setAutoSaveStatus("unsaved");
    validateField("skills", newSkills);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const errors: { [key: string]: string } = {};

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
      errors.description =
        "Job description should be at least 50 characters long";
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
      errors.interviewDuration =
        "Interview duration must be at least 10 minutes when AI interview is enabled";
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
        aiPrompt: formData.enableAiInterview ? formData.aiPrompt : undefined,
        aiInstructions: formData.enableAiInterview
          ? formData.aiInstructions
          : undefined,
      };

      const response = await createJob(jobData);
      console.log("Job created successfully:", response);
      setSuccess(true);
      localStorage.removeItem("job_draft");

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
    localStorage.removeItem("job_draft");
    router.push("/dashboard/jobpost");
  };

  const clearDraft = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all form data?"
    );
    if (confirmed) {
      localStorage.removeItem("job_draft");
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
        currency: "JOD",
        enableAiInterview: true,
        interviewDuration: 30,
        aiPrompt: "",
        aiInstructions: "",
      });
      setFieldErrors({});
      setIsDirty(false);
      setAutoSaveStatus("saved");
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
      setAutoSaveStatus("unsaved");
      validateField("skills", newSkills);
    }
  };

  const handleRegeneratePrompt = () => {
    const newPrompt = generateAiPrompt(
      formData.title || "Position",
      formData.department || "Department",
      formData.requirements || "Requirements"
    );
    setFormData((prev) => ({ ...prev, aiPrompt: newPrompt }));
    setIsDirty(true);
    setAutoSaveStatus("unsaved");
  };

  const handleRegenerateInstructions = () => {
    const newInstructions = generateAiInstructions(
      formData.title || "Position"
    );
    setFormData((prev) => ({ ...prev, aiInstructions: newInstructions }));
    setIsDirty(true);
    setAutoSaveStatus("unsaved");
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
        <FormHeader
          progress={progress}
          autoSaveStatus={autoSaveStatus}
          showPreview={showPreview}
          onCancel={handleCancel}
          onTogglePreview={() => setShowPreview(!showPreview)}
          onClearDraft={clearDraft}
        />

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
            <JobPreview formData={formData} />

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
          <form onSubmit={handleSubmit} className="max-w-4xl">
            <JobInformation
              formData={formData}
              fieldErrors={fieldErrors}
              onInputChange={handleInputChange}
            />

            <JobDetails
              formData={formData}
              fieldErrors={fieldErrors}
              onInputChange={handleInputChange}
            />

            <SkillsManagement
              skills={formData.skills}
              skillInput={skillInput}
              skillSuggestions={skillSuggestions}
              fieldErrors={fieldErrors}
              onSkillInputChange={setSkillInput}
              onAddSkill={handleAddSkill}
              onRemoveSkill={handleRemoveSkill}
              onSkillSuggestionClick={handleSkillSuggestionClick}
              onKeyPress={handleKeyPress}
            />

            <AIInterviewSettings
              formData={formData}
              fieldErrors={fieldErrors}
              onInputChange={handleInputChange}
              onRegeneratePrompt={handleRegeneratePrompt}
              onRegenerateInstructions={handleRegenerateInstructions}
            />

            <JobCreationTips />

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
        )}
      </div>
    </div>
  );
};

export default NewJobPost;
