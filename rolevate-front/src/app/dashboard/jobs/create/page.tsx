"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, BriefcaseIcon, UserGroupIcon, DocumentTextIcon, EyeIcon } from "@heroicons/react/24/outline";
import {
  JobFormData,
  ScreeningQuestion,
  FormErrors,
  FormStep,
  StepConfig,
  BasicInformationStep,
  JobDetailsStep,
  ScreeningQuestionsStep,
  JobPreviewStep,
  ProgressIndicator,
  NavigationButtons,
} from "@/components/job";
import { JobService, JobAnalysisRequest } from "@/services/job";
import { getCurrentUser } from "@/services/auth";

// Helper function to get default deadline (30 days from today)
const getDefaultDeadline = () => {
  const today = new Date();
  const deadline = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)); // Add 30 days
  return deadline.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

export default function CreateJobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [regeneratingDescription, setRegeneratingDescription] = useState(false);
  const [regeneratingRequirements, setRegeneratingRequirements] = useState(false);
  const [regeneratingTitle, setRegeneratingTitle] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentStep, setCurrentStep] = useState<FormStep>("basic");
  const [jobData, setJobData] = useState<JobFormData>({
    title: "",
    department: "",
    location: "",
    salary: "",
    type: "full-time",
    deadline: getDefaultDeadline() || "",
    description: "",
    requirements: "",
    benefits: "",
    skills: [],
    experience: "",
    education: "",
    screeningQuestions: [],
    jobLevel: "mid",
    workType: "onsite",
    industry: "",
  });

  // Helper function to map industry from API to form values
  const mapIndustryToFormValue = (apiIndustry: string): string => {
    const industryMap: { [key: string]: string } = {
      'HEALTHCARE': 'healthcare',
      'TECHNOLOGY': 'technology',
      'FINANCE': 'finance',
      'EDUCATION': 'education',
      'RETAIL': 'retail',
      'MANUFACTURING': 'manufacturing',
      'CONSULTING': 'consulting',
    };
    return industryMap[apiIndustry] || 'other';
  };

  // Helper function to map location from API to form values
  const mapLocationToFormValue = (address: any): string => {
    if (!address) return '';
    
    const { city, country } = address;
    
    // Map country codes to full names
    const countryMap: { [key: string]: string } = {
      'JO': 'Jordan',
      'AE': 'UAE',
      'SA': 'Saudi Arabia',
      'QA': 'Qatar',
      'KW': 'Kuwait',
      'BH': 'Bahrain',
      'OM': 'Oman',
    };

    // Create location string
    const countryName = countryMap[country] || country;
    
    // Map to specific dropdown options
    const locationMap: { [key: string]: string } = {
      'Amman, Jordan': 'Amman, Jordan',
      'Dubai, UAE': 'Dubai, UAE',
      'Abu Dhabi, UAE': 'Abu Dhabi, UAE',
      'Sharjah, UAE': 'Sharjah, UAE',
      'Riyadh, Saudi Arabia': 'Riyadh, Saudi Arabia',
      'Jeddah, Saudi Arabia': 'Jeddah, Saudi Arabia',
      'Doha, Qatar': 'Doha, Qatar',
      'Kuwait City, Kuwait': 'Kuwait City, Kuwait',
      'Manama, Bahrain': 'Manama, Bahrain',
      'Muscat, Oman': 'Muscat, Oman',
    };

    const fullLocation = `${city}, ${countryName}`;
    return locationMap[fullLocation] || fullLocation;
  };

  // Helper function to update URL with current step
  const updateUrlStep = (step: FormStep) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', step);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Initialize step from URL on component mount
  useEffect(() => {
    const stepFromUrl = searchParams.get('step') as FormStep;
    const validSteps: FormStep[] = ['basic', 'details', 'screening', 'preview'];
    
    if (stepFromUrl && validSteps.includes(stepFromUrl)) {
      setCurrentStep(stepFromUrl);
    } else if (!searchParams.get('step')) {
      // Set default step in URL if not present
      updateUrlStep('basic');
    }
  }, [searchParams]);

  // Fetch user data on component mount to set default values
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData?.company) {
          setJobData(prev => ({
            ...prev,
            industry: mapIndustryToFormValue(userData.company.industry),
            location: mapLocationToFormValue(userData.company.address),
          }));
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // Continue with empty defaults if user fetch fails
      }
    };

    fetchUserData();
  }, []);

  const steps: StepConfig[] = [
    { key: "basic", title: "Basic Information", description: "Job title, department, and basic details", icon: BriefcaseIcon },
    { key: "details", title: "Job Details", description: "Description, requirements, and skills", icon: DocumentTextIcon },
    { key: "screening", title: "Screening Questions", description: "Add questions to filter candidates", icon: UserGroupIcon },
    { key: "preview", title: "Preview & Publish", description: "Review and publish your job posting", icon: EyeIcon },
  ];

  const getCurrentStepIndex = () => steps.findIndex(step => step.key === currentStep);
  const isLastStep = () => getCurrentStepIndex() === steps.length - 1;
  const isFirstStep = () => getCurrentStepIndex() === 0;

  const validateStep = (step: FormStep): boolean => {
    const newErrors: FormErrors = {};
    
    switch (step) {
      case "basic":
        if (!jobData.title.trim()) newErrors.title = "Job title is required";
        if (!jobData.department.trim()) newErrors.department = "Department is required";
        if (!jobData.location.trim()) newErrors.location = "Location is required";
        if (!jobData.deadline) newErrors.deadline = "Application deadline is required";
        if (!jobData.industry.trim()) newErrors.industry = "Industry is required";
        
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
        if (!jobData.description.trim()) newErrors.description = "Job description is required";
        if (!jobData.requirements.trim()) newErrors.requirements = "Requirements are required";
        if (!jobData.experience.trim()) newErrors.experience = "Experience level is required";
        if (!jobData.salary.trim()) newErrors.salary = "Salary range is required";
        if (jobData.skills.length === 0) newErrors.skills = "At least one skill is required";
        break;
        
      case "screening":
        // Screening questions are optional, but if added, they should be valid
        jobData.screeningQuestions.forEach((q, index) => {
          if (!q.question.trim()) {
            newErrors[`screening_${index}`] = "Question text is required";
          }
          if (q.type === "multiple_choice" && (!q.options || q.options.length < 2)) {
            newErrors[`screening_options_${index}`] = "Multiple choice questions need at least 2 options";
          }
        });
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (): boolean => {
    return validateStep("basic") && validateStep("details") && validateStep("screening");
  };

  const handleNext = async () => {
    const isValid = validateStep(currentStep);
    
    // Temporary debug logging to help identify validation issues
    if (!isValid) {
      console.log("Validation failed for step:", currentStep);
      console.log("Current errors:", errors);
      console.log("Current form data:", {
        description: jobData.description.length,
        requirements: jobData.requirements.length,
        experience: jobData.experience,
        salary: jobData.salary,
        skills: jobData.skills,
      });
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
          setCurrentStep(nextStep.key);
          updateUrlStep(nextStep.key);
        }
      }
    }
  };

  const generateJobAnalysis = async () => {
    setAiGenerating(true);
    try {
      const analysisRequest: JobAnalysisRequest = {
        jobTitle: jobData.title,
        department: jobData.department,
        industry: jobData.industry,
        employeeType: jobData.type.toUpperCase().replace('-', '_'),
        jobLevel: jobData.jobLevel.toUpperCase(),
        workType: jobData.workType.toUpperCase(),
        location: jobData.location,
        country: extractCountryFromLocation(jobData.location),
      };

      const analysis = await JobService.generateJobAnalysis(analysisRequest);
      
      // Update job data with AI suggestions (only if fields are empty)
      setJobData(prev => ({
        ...prev,
        description: prev.description || analysis.description,
        requirements: prev.requirements || analysis.requirements,
        benefits: prev.benefits || analysis.benefits,
        skills: prev.skills.length === 0 ? analysis.skills : prev.skills,
        salary: prev.salary || analysis.suggestedSalary || '',
        experience: prev.experience || analysis.experienceLevel || '',
        education: prev.education || analysis.educationLevel || '',
      }));
    } catch (error) {
      console.error('Failed to generate job analysis:', error);
      // Continue to next step even if AI fails
    } finally {
      setAiGenerating(false);
    }
  };

  const extractCountryFromLocation = (location: string): string => {
    // Simple extraction - in production you might want a more sophisticated approach
    const parts = location.split(',').map(part => part.trim());
    return parts[parts.length - 1] || location;
  };

  const regenerateDescription = async () => {
    if (!jobData.description.trim()) return;
    
    setRegeneratingDescription(true);
    try {
      const rewrittenDescription = await JobService.rewriteJobDescription(jobData.description);
      setJobData(prev => ({ ...prev, description: rewrittenDescription }));
    } catch (error) {
      console.error('Failed to regenerate job description:', error);
      // Could show a toast notification here
    } finally {
      setRegeneratingDescription(false);
    }
  };

  const regenerateRequirements = async () => {
    if (!jobData.requirements.trim()) return;
    
    setRegeneratingRequirements(true);
    try {
      const rewrittenRequirements = await JobService.rewriteJobRequirements(jobData.requirements);
      setJobData(prev => ({ ...prev, requirements: rewrittenRequirements }));
    } catch (error) {
      console.error('Failed to regenerate job requirements:', error);
      // Could show a toast notification here
    } finally {
      setRegeneratingRequirements(false);
    }
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      const previousStep = steps[currentIndex - 1];
      if (previousStep) {
        setCurrentStep(previousStep.key);
        updateUrlStep(previousStep.key);
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // TODO: Implement API call to create job
      console.log("Creating job:", jobData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate back to jobs page
      router.push("/dashboard/jobs");
    } catch (error) {
      console.error("Failed to create job:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof JobFormData, value: string | string[]) => {
    setJobData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !jobData.skills.includes(skill.trim())) {
      setJobData(prev => ({ ...prev, skills: [...prev.skills, skill.trim()] }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setJobData(prev => ({ ...prev, skills: prev.skills.filter(skill => skill !== skillToRemove) }));
  };

  const addScreeningQuestion = () => {
    const newQuestion: ScreeningQuestion = {
      id: Date.now().toString(),
      question: "",
      type: "yes_no",
      required: false,
    };
    setJobData(prev => ({ ...prev, screeningQuestions: [...prev.screeningQuestions, newQuestion] }));
  };

  const updateScreeningQuestion = (id: string, updates: Partial<ScreeningQuestion>) => {
    setJobData(prev => ({
      ...prev,
      screeningQuestions: prev.screeningQuestions.map(q => 
        q.id === id ? { ...q, ...updates } : q
      )
    }));
  };

  const removeScreeningQuestion = (id: string) => {
    setJobData(prev => ({
      ...prev,
      screeningQuestions: prev.screeningQuestions.filter(q => q.id !== id)
    }));
  };

  // Popular skills suggestions (would typically come from API)
  const skillSuggestions = [
    "JavaScript", "React", "Node.js", "Python", "Java", "AWS", "SQL", "Git", "Docker", "Kubernetes",
    "Project Management", "Agile", "Scrum", "Communication", "Leadership", "Problem Solving"
  ];

  const addPrebuiltQuestion = (question: { question: string; type: ScreeningQuestion['type'] }) => {
    const newQuestion: ScreeningQuestion = {
      id: Date.now().toString(),
      question: question.question,
      type: question.type,
      required: true,
    };
    setJobData(prev => ({ 
      ...prev, 
      screeningQuestions: [...prev.screeningQuestions, newQuestion] 
    }));
  };

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
              <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Create New Job</h1>
              <p className="text-[#6e6e73] text-lg mt-2">Post a new job opening and start receiving applications</p>
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
              />
            )}

            {currentStep === "details" && (
              <JobDetailsStep
                jobData={jobData}
                errors={errors}
                aiGenerating={regeneratingDescription}
                regeneratingRequirements={regeneratingRequirements}
                onInputChange={handleInputChange}
                onAddSkill={addSkill}
                onRemoveSkill={removeSkill}
                onRegenerateDescription={regenerateDescription}
                onRegenerateRequirements={regenerateRequirements}
                skillSuggestions={skillSuggestions}
              />
            )}

            {currentStep === "screening" && (
              <ScreeningQuestionsStep
                screeningQuestions={jobData.screeningQuestions}
                errors={errors}
                onAddQuestion={addScreeningQuestion}
                onUpdateQuestion={updateScreeningQuestion}
                onRemoveQuestion={removeScreeningQuestion}
                onAddPrebuiltQuestion={addPrebuiltQuestion}
              />
            )}

            {currentStep === "preview" && (
              <JobPreviewStep jobData={jobData} />
            )}

            {/* Navigation Buttons */}
            <NavigationButtons
              isFirstStep={isFirstStep()}
              isLastStep={isLastStep()}
              loading={loading}
              aiGenerating={aiGenerating || regeneratingDescription || regeneratingRequirements}
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
