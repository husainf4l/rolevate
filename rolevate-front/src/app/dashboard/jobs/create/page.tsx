"use client";

import React, { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  UserGroupIcon,
  DocumentTextIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import {
  JobFormData,
  FormErrors,
  FormStep,
  StepConfig,
  BasicInformationStep,
  JobDetailsStep,
  AIConfigurationStep,
  JobPreviewStep,
  ProgressIndicator,
  NavigationButtons,
} from "@/components/job";
import {
  JobService,
  JobAnalysisRequest,
  AIConfigRequest,
  CreateJobRequest,
} from "@/services/job";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

function CreateJobContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [regeneratingDescription, setRegeneratingDescription] = useState(false);
  const [regeneratingRequirements, setRegeneratingRequirements] =
    useState(false);
  const [regeneratingTitle, setRegeneratingTitle] = useState(false);
  const [regeneratingBenefits, setRegeneratingBenefits] = useState(false);
  const [regeneratingResponsibilities, setRegeneratingResponsibilities] =
    useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentStep, setCurrentStep] = useState<FormStep>("basic");
  const [jobData, setJobData] = useState<JobFormData>({
    title: "",
    department: "",
    location: "",
    salary: "",
    type: "FULL_TIME",
    deadline: "",
    description: "",
    shortDescription: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
    skills: [],
    experience: "",
    education: "",
    interviewQuestions: "",
    jobLevel: "ENTRY",
    workType: "ONSITE",
    industry: "",
    interviewLanguage: "english",
    aiCvAnalysisPrompt: "",
    aiFirstInterviewPrompt: "",
    aiSecondInterviewPrompt: "",
  });

  // Memoized form validation and computed values
  const isBasicStepValid = useMemo(() => {
    return jobData.title.trim() !== '' && 
           jobData.department.trim() !== '' && 
           jobData.location.trim() !== '';
  }, [jobData.title, jobData.department, jobData.location]);

  const isJobDetailsValid = useMemo(() => {
    return jobData.description.trim() !== '' && 
           jobData.requirements.trim() !== '' &&
           jobData.skills.length > 0;
  }, [jobData.description, jobData.requirements, jobData.skills]);

  const canProceedToNextStep = useMemo(() => {
    switch (currentStep) {
      case 'basic': return isBasicStepValid;
      case 'details': return isJobDetailsValid;
      case 'ai-config': return true; // AI step is optional
      case 'preview': return true;
      default: return false;
    }
  }, [currentStep, isBasicStepValid, isJobDetailsValid]);  // Memoized helper functions for better performance
  const mapIndustryToFormValue = useCallback((apiIndustry: string): string => {
    const industryMap: { [key: string]: string } = {
      HEALTHCARE: "healthcare",
      TECHNOLOGY: "technology",
      FINANCE: "finance",
      EDUCATION: "education",
      RETAIL: "retail",
      MANUFACTURING: "manufacturing",
      CONSULTING: "consulting",
    };
    return industryMap[apiIndustry] || "other";
  }, []);

  const mapLocationToFormValue = useCallback((address: any): string => {
    if (!address) return "";

    const { city, country } = address;

    // Map country codes to full names
    const countryMap: { [key: string]: string } = {
      JO: "Jordan",
      AE: "UAE",
      SA: "Saudi Arabia",
      QA: "Qatar",
      KW: "Kuwait",
      BH: "Bahrain",
      OM: "Oman",
    };

    // Create location string
    const countryName = countryMap[country] || country;

    // Map to specific dropdown options
    const locationMap: { [key: string]: string } = {
      "Amman, Jordan": "Amman, Jordan",
      "Dubai, UAE": "Dubai, UAE",
      "Abu Dhabi, UAE": "Abu Dhabi, UAE",
      "Sharjah, UAE": "Sharjah, UAE",
      "Riyadh, Saudi Arabia": "Riyadh, Saudi Arabia",
      "Jeddah, Saudi Arabia": "Jeddah, Saudi Arabia",
      "Doha, Qatar": "Doha, Qatar",
      "Kuwait City, Kuwait": "Kuwait City, Kuwait",
      "Manama, Bahrain": "Manama, Bahrain",
      "Muscat, Oman": "Muscat, Oman",
    };

    const fullLocation = `${city}, ${countryName}`;
    return locationMap[fullLocation] || fullLocation;
  }, []);

  // Helper function to update URL with current step
  const updateUrlStep = useCallback((step: FormStep) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("step", step);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  // Initialize step from URL on component mount
  useEffect(() => {
    const stepFromUrl = searchParams?.get("step") as FormStep;
    const validSteps: FormStep[] = ["basic", "details", "interview-questions", "ai-config", "preview"];

    if (stepFromUrl && validSteps.includes(stepFromUrl)) {
      setCurrentStep(stepFromUrl);
    } else if (!searchParams?.get("step")) {
      // Set default step in URL if not present
      updateUrlStep("basic");
    }
  }, [searchParams]);

  // Set default values from user data when available
  useEffect(() => {
    if (user?.company) {
      setJobData((prev) => ({
        ...prev,
        industry: user.company?.industry ? mapIndustryToFormValue(user.company.industry) : prev.industry,
        location: user.company?.address ? mapLocationToFormValue(user.company.address) : prev.location,
      }));
    }
  }, [user, mapIndustryToFormValue, mapLocationToFormValue]);

  const steps: StepConfig[] = [
    {
      key: "basic",
      title: "Basic Information",
      description: "Job title, department, and basic details",
      icon: BriefcaseIcon,
    },
    {
      key: "details",
      title: "Job Details",
      description: "Description, requirements, and skills",
      icon: DocumentTextIcon,
    },
    {
      key: "interview-questions",
      title: "Interview Questions",
      description: "Add screening and interview questions",
      icon: ChatBubbleLeftRightIcon,
    },
    {
      key: "ai-config",
      title: "AI Configuration",
      description: "Configure AI prompts for recruitment",
      icon: UserGroupIcon,
    },
    {
      key: "preview",
      title: "Preview & Publish",
      description: "Review and publish your job posting",
      icon: EyeIcon,
    },
  ];

  const getCurrentStepIndex = () =>
    steps.findIndex((step) => step.key === currentStep);
  const isLastStep = () => getCurrentStepIndex() === steps.length - 1;
  const isFirstStep = () => getCurrentStepIndex() === 0;

  const validateStep = (step: FormStep): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case "basic":
        if (!jobData.title.trim()) newErrors.title = "Job title is required";
        if (!jobData.department.trim())
          newErrors.department = "Department is required";
        if (!jobData.location.trim())
          newErrors.location = "Location is required";
        if (!jobData.deadline)
          newErrors.deadline = "Application deadline is required";
        if (!jobData.industry.trim())
          newErrors.industry = "Industry is required";
        if (!jobData.interviewLanguage.trim())
          newErrors.interviewLanguage = "Interview language is required";

        // Validate deadline is in the future
        if (jobData.deadline) {
          const deadlineDate = new Date(jobData.deadline);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (deadlineDate <= today) {
            newErrors.deadline = "Deadline must be in the future";
          }
        }
        break;

      case "details":
        if (!jobData.description.trim())
          newErrors.description = "Job description is required";
        if (!jobData.shortDescription.trim())
          newErrors.shortDescription = "Short description is required";
        if (!jobData.responsibilities.trim())
          newErrors.responsibilities = "Key responsibilities are required";
        if (!jobData.requirements.trim())
          newErrors.requirements = "Requirements are required";
        if (!jobData.experience.trim())
          newErrors.experience = "Experience level is required";
        if (!jobData.salary.trim())
          newErrors.salary = "Salary range is required";
        if (jobData.skills.length === 0)
          newErrors.skills = "At least one skill is required";
        break;

      case "interview-questions":
        // Interview questions are optional, but we could add validation if needed
        // For example, ensure at least one screening question if any are provided
        break;

      case "ai-config":
        // AI configuration is optional, so no required validation
        // Users can leave prompts empty to use defaults
        break;

      case "preview":
        // No validation needed for preview step
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (): boolean => {
    return (
      validateStep("basic") &&
      validateStep("details") &&
      validateStep("interview-questions") &&
      validateStep("ai-config")
    );
  };

  const handleNext = useCallback(async () => {
    const isValid = validateStep(currentStep);

    // Use memoized validation for better performance
    if (!canProceedToNextStep) {
      console.log("Validation failed for step:", currentStep);
      console.log("Current errors:", errors);
      console.log("Current form data:", {
        description: jobData.description.length,
        responsibilities: jobData.responsibilities.length,
        requirements: jobData.requirements.length,
        experience: jobData.experience,
        salary: jobData.salary,
        skills: jobData.skills,
      });
      return;
    }

    if (isValid) {
      const currentIndex = getCurrentStepIndex();
      if (currentIndex < steps.length - 1) {
        const nextStep = steps[currentIndex + 1];
        if (nextStep) {
          // If moving from basic to details, generate AI suggestions
          if (currentStep === "basic" && nextStep.key === "details") {
            await generateJobAnalysis();
          }
          // If moving from interview-questions to ai-config, generate AI configuration prompts
          else if (currentStep === "interview-questions" && nextStep.key === "ai-config") {
            await generateAIConfiguration();
          }
          setCurrentStep(nextStep.key);
          updateUrlStep(nextStep.key);
        }
      }
    }
  }, [currentStep, canProceedToNextStep, validateStep, errors, jobData]);

  const generateJobAnalysis = async () => {
    setAiGenerating(true);
    try {
      const analysisRequest: JobAnalysisRequest = {
        jobTitle: jobData.title,
        department: jobData.department,
        industry: jobData.industry,
        employeeType: jobData.type.toUpperCase().replace("-", "_"),
        jobLevel: jobData.jobLevel.toUpperCase(),
        workType: jobData.workType.toUpperCase(),
        location: jobData.location,
        country: extractCountryFromLocation(jobData.location),
      };

      const analysis = await JobService.generateJobAnalysis(analysisRequest);

      // Update job data with AI suggestions (only if fields are empty)
      setJobData((prev) => ({
        ...prev,
        description: prev.description || analysis.description,
        shortDescription: prev.shortDescription || analysis.shortDescription,
        responsibilities: prev.responsibilities || analysis.responsibilities,
        requirements: prev.requirements || analysis.requirements,
        benefits: prev.benefits || analysis.benefits,
        skills: prev.skills.length === 0 ? analysis.skills : prev.skills,
        salary: prev.salary || analysis.suggestedSalary || "",
        experience: prev.experience || analysis.experienceLevel || "",
        education: prev.education || analysis.educationLevel || "",
      }));
    } catch (error) {
      console.error("Failed to generate job analysis:", error);
      // Continue to next step even if AI fails
    } finally {
      setAiGenerating(false);
    }
  };

  const extractCountryFromLocation = (location: string): string => {
    // Simple extraction - in production you might want a more sophisticated approach
    const parts = location.split(",").map((part) => part.trim());
    return parts[parts.length - 1] || location;
  };

  const regenerateDescription = async () => {
    if (!jobData.description.trim()) return;

    setRegeneratingDescription(true);
    try {
      const result = await JobService.rewriteJobDescription(
        jobData.description
      );
      setJobData((prev) => ({
        ...prev,
        description: result.rewrittenDescription,
        // Update short description only if it's not already filled or if it seems related
        shortDescription:
          result.rewrittenShortDescription || prev.shortDescription,
      }));
    } catch (error) {
      console.error("Failed to regenerate job description:", error);
      // Could show a toast notification here
    } finally {
      setRegeneratingDescription(false);
    }
  };

  const regenerateRequirements = async () => {
    if (!jobData.requirements.trim()) return;

    setRegeneratingRequirements(true);
    try {
      const rewrittenRequirements = await JobService.rewriteJobRequirements(
        jobData.requirements
      );
      setJobData((prev) => ({ ...prev, requirements: rewrittenRequirements }));
    } catch (error) {
      console.error("Failed to regenerate job requirements:", error);
      // Could show a toast notification here
    } finally {
      setRegeneratingRequirements(false);
    }
  };

  const regenerateTitle = async () => {
    if (!jobData.title.trim()) return;

    setRegeneratingTitle(true);
    try {
      const result = await JobService.rewriteJobTitle(
        jobData.title,
        jobData.industry,
        undefined, // company - we don't have this in the form
        jobData.jobLevel
      );

      setJobData((prev) => ({
        ...prev,
        title: result.jobTitle,
        // Update department if provided by AI
        ...(result.department && { department: result.department }),
      }));
    } catch (error) {
      console.error("Failed to regenerate job title:", error);
      // Could show a toast notification here
    } finally {
      setRegeneratingTitle(false);
    }
  };

  const regenerateBenefits = async () => {
    if (!jobData.benefits.trim()) return;

    setRegeneratingBenefits(true);
    try {
      const rewrittenBenefits = await JobService.rewriteBenefits(
        jobData.benefits,
        jobData.industry,
        jobData.jobLevel,
        undefined // company - we don't have this in the form
      );
      setJobData((prev) => ({ ...prev, benefits: rewrittenBenefits }));
    } catch (error) {
      console.error("Failed to regenerate benefits:", error);
      // Could show a toast notification here
    } finally {
      setRegeneratingBenefits(false);
    }
  };

  const regenerateResponsibilities = async () => {
    if (!jobData.responsibilities.trim()) return;

    setRegeneratingResponsibilities(true);
    try {
      const rewrittenResponsibilities =
        await JobService.rewriteResponsibilities(
          jobData.responsibilities,
          jobData.industry,
          jobData.jobLevel,
          undefined // company - we don't have this in the form
        );
      setJobData((prev) => ({
        ...prev,
        responsibilities: rewrittenResponsibilities,
      }));
    } catch (error) {
      console.error("Failed to regenerate responsibilities:", error);
      // Could show a toast notification here
    } finally {
      setRegeneratingResponsibilities(false);
    }
  };

  const generateAIConfiguration = async () => {
    setAiGenerating(true);
    try {
      // Use interview questions directly as string
      const configRequest: AIConfigRequest = {
        jobTitle: jobData.title,
        department: jobData.department,
        industry: jobData.industry,
        jobLevel: jobData.jobLevel,
        description: jobData.description,
        responsibilities: jobData.responsibilities,
        requirements: jobData.requirements,
        skills: jobData.skills,
        ...(jobData.interviewQuestions.trim() && { interviewQuestions: jobData.interviewQuestions }),
      };

      const aiConfig = await JobService.generateAIConfiguration(configRequest);

      // Update job data with AI configuration prompts (only if fields are empty)
      setJobData((prev) => ({
        ...prev,
        aiCvAnalysisPrompt:
          prev.aiCvAnalysisPrompt || aiConfig.aiCvAnalysisPrompt,
        aiFirstInterviewPrompt:
          prev.aiFirstInterviewPrompt || aiConfig.aiFirstInterviewPrompt,
        aiSecondInterviewPrompt:
          prev.aiSecondInterviewPrompt || aiConfig.aiSecondInterviewPrompt,
      }));
    } catch (error) {
      console.error("Failed to generate AI configuration:", error);
      // Continue to next step even if AI fails
    } finally {
      setAiGenerating(false);
    }
  };

  const regenerateAIConfiguration = async () => {
    // Clear existing prompts first to ensure regeneration
    setJobData((prev) => ({
      ...prev,
      aiCvAnalysisPrompt: "",
      aiFirstInterviewPrompt: "",
      aiSecondInterviewPrompt: "",
    }));

    // Generate new prompts
    await generateAIConfiguration();
  };

  const handlePrevious = useCallback(() => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      const previousStep = steps[currentIndex - 1];
      if (previousStep) {
        setCurrentStep(previousStep.key);
        updateUrlStep(previousStep.key);
      }
    }
  }, [getCurrentStepIndex, steps, updateUrlStep]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      // Form validation failed
      return;
    }

    setLoading(true);

    try {
      // Transform job data for backend API
      const createJobRequest: CreateJobRequest = {
        title: jobData.title.trim(),
        shortDescription: jobData.shortDescription.trim(),
        department: jobData.department.trim(),
        location: jobData.location.trim(),
        salary: jobData.salary.trim(),
        type: jobData.type,
        deadline: jobData.deadline,
        description: jobData.description.trim(),
        responsibilities: jobData.responsibilities.trim(),
        requirements: jobData.requirements.trim(),
        benefits: jobData.benefits.trim(),
        skills: jobData.skills.filter((skill) => skill.trim() !== ""), // Remove empty skills
        experience: jobData.experience,
        education: jobData.education,
        jobLevel: jobData.jobLevel,
        workType: jobData.workType,
        industry: jobData.industry,
        interviewLanguage: jobData.interviewLanguage,
        aiCvAnalysisPrompt: jobData.aiCvAnalysisPrompt.trim(),
        aiFirstInterviewPrompt: jobData.aiFirstInterviewPrompt.trim(),
        aiSecondInterviewPrompt: jobData.aiSecondInterviewPrompt.trim(),
      };

      // Creating job with validated data

      // Call the backend API
      await JobService.createJob(createJobRequest);

      // Job creation completed successfully

      // Navigate back to jobs page with success message
      router.push("/dashboard/jobs?created=true");
    } catch (error) {
      console.error("Failed to create job:", error);

      // Better error message handling
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Show user-friendly error message
      toast.error(`Failed to create job: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [validateForm, jobData, router]);

  const handleInputChange = useCallback((
    field: keyof JobFormData,
    value: string | string[]
  ) => {
    setJobData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }, [errors]);

  const addSkill = (skill: string) => {
    if (skill.trim() && !jobData.skills.includes(skill.trim())) {
      setJobData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill.trim()],
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setJobData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  // Popular skills suggestions (would typically come from API)
  const skillSuggestions = [
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "Java",
    "AWS",
    "SQL",
    "Git",
    "Docker",
    "Kubernetes",
    "Project Management",
    "Agile",
    "Scrum",
    "Communication",
    "Leadership",
    "Problem Solving",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafbfc] to-[#f5f7fa] p-4 sm:p-6 lg:p-8 pt-20 sm:pt-24">
      <div className="container-corporate">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 px-4 py-2.5 text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white/60 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40"
          >
            <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex-1">
            <div className="mb-2">
              <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">
                Create New Job
              </h1>
              <p className="text-[#6e6e73] text-lg mt-2">
                Post a new job opening and start receiving applications
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator steps={steps} currentStep={currentStep} />

        {/* Job Creation Form */}
        <div className="glass-strong rounded-2xl shadow-[var(--shadow-strong)] overflow-hidden">
          <div className="divide-y divide-white/10">
            {/* Render Current Step */}
            {currentStep === "basic" && (
              <BasicInformationStep
                jobData={jobData}
                errors={errors}
                onInputChange={handleInputChange}
                onRegenerateTitle={regenerateTitle}
                regeneratingTitle={regeneratingTitle}
              />
            )}

            {currentStep === "details" && (
              <JobDetailsStep
                jobData={jobData}
                errors={errors}
                aiGenerating={regeneratingDescription}
                regeneratingRequirements={regeneratingRequirements}
                regeneratingBenefits={regeneratingBenefits}
                regeneratingResponsibilities={regeneratingResponsibilities}
                onInputChange={handleInputChange}
                onAddSkill={addSkill}
                onRemoveSkill={removeSkill}
                onRegenerateDescription={regenerateDescription}
                onRegenerateRequirements={regenerateRequirements}
                onRegenerateBenefits={regenerateBenefits}
                onRegenerateResponsibilities={regenerateResponsibilities}
                skillSuggestions={skillSuggestions}
              />
            )}

            {currentStep === "interview-questions" && (   
              <div className="p-6 lg:p-8 space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">Additional Interview Questions</h2>
                  <p className="text-[#6e6e73] text-lg">Add interview questions for the AI interviewer</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#1d1d1f] mb-3">
                      Otptional Interview Questions for AI System
                    </label>
                    <p className="text-sm text-[#6e6e73] mb-4">
                      These questions will be used by the AI interviewer during the interview process. 
                      Enter one question per line or separate multiple questions with semicolons.
                    </p>
                    <textarea
                      value={jobData.interviewQuestions}
                      onChange={(e) => handleInputChange("interviewQuestions", e.target.value)}
                      placeholder="Add your questions ..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0fc4b5] focus:border-transparent bg-white text-[#1d1d1f] placeholder-[#6e6e73] resize-vertical"
                      rows={8}
                    />
                  </div>

                  <div className="bg-[#f5f7fa] rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[#1d1d1f] mb-3">Tips for AI Interview Questions</h3>
                    <ul className="space-y-2 text-sm text-[#6e6e73]">
                      <li>• Focus on role-specific skills and experience</li>
                      <li>• Ask behavioral questions to understand problem-solving approach</li>
                      <li>• Include questions about motivation and career goals</li>
                      <li>• Keep questions open-ended to allow detailed responses</li>
                      <li>• Consider technical questions relevant to the position</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {currentStep === "ai-config" && (
              <AIConfigurationStep
                jobData={jobData}
                errors={errors}
                onInputChange={handleInputChange}
                isGenerating={aiGenerating}
                onRegeneratePrompts={regenerateAIConfiguration}
              />
            )}

            {currentStep === "preview" && <JobPreviewStep jobData={jobData} />}

            {/* Navigation Buttons */}
            <NavigationButtons
              isFirstStep={isFirstStep()}
              isLastStep={isLastStep()}
              loading={loading}
              aiGenerating={
                aiGenerating ||
                regeneratingDescription ||
                regeneratingRequirements ||
                regeneratingTitle ||
                regeneratingBenefits ||
                regeneratingResponsibilities
              }
              currentStep={currentStep}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onCancel={() => router.back()}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateJobPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateJobContent />
    </Suspense>
  );
}
