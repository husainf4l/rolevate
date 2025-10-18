"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Check, ArrowRight, Loader2, Briefcase, DollarSign, FileText, MessageSquare, Settings, Eye, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apolloClient } from "@/lib/apollo";
import { gql } from "@apollo/client";
import { useAuth } from "@/hooks/useAuth";

// GraphQL Mutations
const CREATE_JOB_MUTATION = gql`
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) {
      id
      title
      slug
      status
      createdAt
    }
  }
`;

const REWRITE_JOB_TITLE = gql`
  mutation RewriteJobTitle($input: JobTitleRewriteRequestDto!) {
    rewriteJobTitle(input: $input) {
      rewrittenTitle
      originalTitle
    }
  }
`;

const REWRITE_JOB_DESCRIPTION = gql`
  mutation RewriteJobDescription($input: JobDescriptionRewriteInput!) {
    rewriteJobDescription(input: $input) {
      rewrittenDescription
      originalDescription
    }
  }
`;

const POLISH_REQUIREMENTS = gql`
  mutation PolishRequirements($input: RequirementsPolishRequestDto!) {
    polishRequirements(input: $input) {
      polishedRequirements
      originalRequirements
    }
  }
`;

const POLISH_RESPONSIBILITIES = gql`
  mutation PolishResponsibilities($input: PolishResponsibilitiesInput!) {
    polishResponsibilities(input: $input) {
      polishedResponsibilities
      originalResponsibilities
    }
  }
`;

const POLISH_BENEFITS = gql`
  mutation PolishBenefits($input: PolishBenefitsInput!) {
    polishBenefits(input: $input) {
      polishedBenefits
      originalBenefits
    }
  }
`;

const SUGGEST_SKILLS = gql`
  mutation SuggestSkills($input: SuggestSkillsInput!) {
    suggestSkills(input: $input) {
      skills
    }
  }
`;

const GENERATE_JOB_ANALYSIS = gql`
  mutation GenerateJobAnalysis($input: JobAnalysisInput!) {
    generateJobAnalysis(input: $input) {
      description
      shortDescription
      responsibilities
      requirements
      benefits
      skills
      suggestedSalary
      experienceLevel
      educationLevel
    }
  }
`;

const GENERATE_AI_CONFIGURATION = gql`
  mutation GenerateAIConfiguration($input: AIConfigInput!) {
    generateAIConfiguration(input: $input) {
      aiCvAnalysisPrompt
      aiFirstInterviewPrompt
      aiSecondInterviewPrompt
    }
  }
`;

// Types// Types
type FormStep = "basic" | "details" | "interview" | "ai-config" | "preview";
type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
type JobLevel = "ENTRY" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE";
type WorkType = "REMOTE" | "HYBRID" | "ONSITE";

interface JobFormData {
  title: string;
  department: string;
  location: string;
  salary: string;
  type: JobType;
  deadline: string;
  description: string;
  shortDescription: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  skills: string[];
  experience: string;
  education: string;
  interviewQuestions: string;
  jobLevel: JobLevel;
  workType: WorkType;
  industry: string;
  interviewLanguage: string;
  aiCvAnalysisPrompt: string;
  aiFirstInterviewPrompt: string;
  aiSecondInterviewPrompt: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CreateJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<FormStep>("basic");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<JobFormData>({
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
    jobLevel: "MID",
    workType: "ONSITE",
    industry: "",
    interviewLanguage: "english",
    aiCvAnalysisPrompt: "",
    aiFirstInterviewPrompt: "",
    aiSecondInterviewPrompt: "",
  });

  // Steps configuration
  const steps = [
    { key: "basic" as FormStep, title: "Basic Info", icon: Briefcase },
    { key: "details" as FormStep, title: "Job Details", icon: FileText },
    { key: "interview" as FormStep, title: "Interview", icon: MessageSquare },
    { key: "ai-config" as FormStep, title: "AI Config", icon: Settings },
    { key: "preview" as FormStep, title: "Preview", icon: Eye },
  ];

  const getCurrentStepIndex = () => steps.findIndex(s => s.key === currentStep);
  const isFirstStep = getCurrentStepIndex() === 0;
  const isLastStep = getCurrentStepIndex() === steps.length - 1;

  // Validation
  const validateStep = useCallback((step: FormStep): boolean => {
    const newErrors: FormErrors = {};

    if (step === "basic") {
      if (!formData.title.trim()) newErrors.title = "Title is required";
      if (!formData.department.trim()) newErrors.department = "Department is required";
      if (!formData.location.trim()) newErrors.location = "Location is required";
      if (!formData.industry.trim()) newErrors.industry = "Industry is required";
      if (!formData.deadline) newErrors.deadline = "Deadline is required";
    }

    if (step === "details") {
      if (!formData.description.trim()) newErrors.description = "Description is required";
      if (!formData.shortDescription.trim()) newErrors.shortDescription = "Short description is required";
      if (!formData.requirements.trim()) newErrors.requirements = "Requirements are required";
      if (!formData.responsibilities.trim()) newErrors.responsibilities = "Responsibilities are required";
      if (formData.skills.length === 0) newErrors.skills = "At least one skill is required";
      if (!formData.experience.trim()) newErrors.experience = "Experience is required";
      if (!formData.education.trim()) newErrors.education = "Education is required";
      if (!formData.salary.trim()) newErrors.salary = "Salary is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof JobFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [errors]);

  // Skills management
  const addSkill = useCallback((skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      handleInputChange("skills", [...formData.skills, skill.trim()]);
    }
  }, [formData.skills, handleInputChange]);

  const removeSkill = useCallback((skill: string) => {
    handleInputChange("skills", formData.skills.filter(s => s !== skill));
  }, [formData.skills, handleInputChange]);

  // AI Functions
  const enhanceTitle = useCallback(async () => {
    if (!formData.title.trim()) return;
    
    setAiLoading("title");
    try {
      const { data } = await apolloClient.mutate<{
        rewriteJobTitle: { rewrittenTitle: string; originalTitle: string }
      }>({
        mutation: REWRITE_JOB_TITLE,
        variables: {
          input: {
            jobTitle: formData.title,
            currentTitle: formData.title,
            industry: formData.industry || undefined,
            jobLevel: formData.jobLevel,
          },
        },
      });
      
      if (data?.rewriteJobTitle?.rewrittenTitle) {
        handleInputChange("title", data.rewriteJobTitle.rewrittenTitle);
      }
    } catch (error) {
      console.error("Failed to enhance title:", error);
    } finally {
      setAiLoading(null);
    }
  }, [formData.title, formData.industry, formData.jobLevel, handleInputChange]);

  const enhanceDescription = useCallback(async () => {
    if (!formData.description.trim()) return;
    
    setAiLoading("description");
    try {
      const { data } = await apolloClient.mutate<{
        rewriteJobDescription: { rewrittenDescription: string; originalDescription: string }
      }>({
        mutation: REWRITE_JOB_DESCRIPTION,
        variables: {
          input: {
            description: formData.description,
          },
        },
      });
      
      if (data?.rewriteJobDescription?.rewrittenDescription) {
        handleInputChange("description", data.rewriteJobDescription.rewrittenDescription);
      }
    } catch (error) {
      console.error("Failed to enhance description:", error);
    } finally {
      setAiLoading(null);
    }
  }, [formData.description, handleInputChange]);

  const polishRequirements = useCallback(async () => {
    if (!formData.requirements.trim()) return;
    
    setAiLoading("requirements");
    try {
      const { data } = await apolloClient.mutate<{
        polishRequirements: { polishedRequirements: string; originalRequirements: string }
      }>({
        mutation: POLISH_REQUIREMENTS,
        variables: {
          input: {
            requirements: formData.requirements,
          },
        },
      });
      
      if (data?.polishRequirements?.polishedRequirements) {
        handleInputChange("requirements", data.polishRequirements.polishedRequirements);
      }
    } catch (error) {
      console.error("Failed to polish requirements:", error);
    } finally {
      setAiLoading(null);
    }
  }, [formData.requirements, handleInputChange]);

  const polishResponsibilities = useCallback(async () => {
    if (!formData.responsibilities.trim()) return;
    
    setAiLoading("responsibilities");
    try {
      const { data } = await apolloClient.mutate<{
        polishResponsibilities: { polishedResponsibilities: string; originalResponsibilities: string }
      }>({
        mutation: POLISH_RESPONSIBILITIES,
        variables: {
          input: {
            responsibilities: formData.responsibilities,
          },
        },
      });
      
      if (data?.polishResponsibilities?.polishedResponsibilities) {
        handleInputChange("responsibilities", data.polishResponsibilities.polishedResponsibilities);
      }
    } catch (error) {
      console.error("Failed to polish responsibilities:", error);
    } finally {
      setAiLoading(null);
    }
  }, [formData.responsibilities, handleInputChange]);

  const polishBenefits = useCallback(async () => {
    if (!formData.benefits.trim()) return;
    
    setAiLoading("benefits");
    try {
      const { data } = await apolloClient.mutate<{
        polishBenefits: { polishedBenefits: string; originalBenefits: string }
      }>({
        mutation: POLISH_BENEFITS,
        variables: {
          input: {
            benefits: formData.benefits,
          },
        },
      });
      
      if (data?.polishBenefits?.polishedBenefits) {
        handleInputChange("benefits", data.polishBenefits.polishedBenefits);
      }
    } catch (error) {
      console.error("Failed to polish benefits:", error);
    } finally {
      setAiLoading(null);
    }
  }, [formData.benefits, handleInputChange]);

  const suggestSkills = useCallback(async () => {
    if (!formData.title.trim()) return;
    
    setAiLoading("skills");
    try {
      const { data } = await apolloClient.mutate<{
        suggestSkills: { skills: string[] }
      }>({
        mutation: SUGGEST_SKILLS,
        variables: {
          input: {
            jobTitle: formData.title,
            description: formData.description || undefined,
          },
        },
      });
      
      if (data?.suggestSkills?.skills) {
        const newSkills = data.suggestSkills.skills.filter(
          (skill: string) => !formData.skills.includes(skill)
        );
        handleInputChange("skills", [...formData.skills, ...newSkills]);
      }
    } catch (error) {
      console.error("Failed to suggest skills:", error);
    } finally {
      setAiLoading(null);
    }
  }, [formData.title, formData.description, formData.skills, handleInputChange]);

  // Generate job analysis when moving from basic to details
  const generateJobAnalysis = useCallback(async () => {
    if (!formData.title || !formData.department) return;
    
    setAiLoading("analysis");
    try {
      const { data } = await apolloClient.mutate<{
        generateJobAnalysis: {
          description: string;
          shortDescription: string;
          responsibilities: string;
          requirements: string;
          benefits: string;
          skills: string[];
          suggestedSalary: string;
          experienceLevel: string;
          educationLevel: string;
        }
      }>({
        mutation: GENERATE_JOB_ANALYSIS,
        variables: {
          input: {
            jobTitle: formData.title,
            department: formData.department,
            industry: formData.industry,
            employeeType: formData.type,
            jobLevel: formData.jobLevel,
            workType: formData.workType,
            location: formData.location,
          },
        },
      });
      
      if (data?.generateJobAnalysis) {
        const analysis = data.generateJobAnalysis;
        // Only fill empty fields
        setFormData(prev => ({
          ...prev,
          description: prev.description || analysis.description || "",
          shortDescription: prev.shortDescription || analysis.shortDescription || "",
          responsibilities: prev.responsibilities || analysis.responsibilities || "",
          requirements: prev.requirements || analysis.requirements || "",
          benefits: prev.benefits || analysis.benefits || "",
          skills: prev.skills.length === 0 && analysis.skills ? analysis.skills : prev.skills,
          salary: prev.salary || analysis.suggestedSalary || "",
          experience: prev.experience || analysis.experienceLevel || "",
          education: prev.education || analysis.educationLevel || "",
        }));
      }
    } catch (error) {
      console.error("Failed to generate job analysis:", error);
      // Continue anyway - user can fill manually
    } finally {
      setAiLoading(null);
    }
  }, [formData.title, formData.department, formData.industry, formData.type, formData.jobLevel, formData.workType, formData.location]);

  // Generate AI configuration prompts when moving from interview to ai-config
  const generateAIConfiguration = useCallback(async () => {
    if (!formData.title || !formData.description) return;
    
    setAiLoading("ai-config");
    try {
      const { data } = await apolloClient.mutate<{
        generateAIConfiguration: {
          aiCvAnalysisPrompt: string;
          aiFirstInterviewPrompt: string;
          aiSecondInterviewPrompt: string;
        }
      }>({
        mutation: GENERATE_AI_CONFIGURATION,
        variables: {
          input: {
            jobTitle: formData.title,
            department: formData.department,
            industry: formData.industry,
            jobLevel: formData.jobLevel,
            description: formData.description,
            responsibilities: formData.responsibilities,
            requirements: formData.requirements,
            skills: formData.skills,
            interviewQuestions: formData.interviewQuestions || undefined,
          },
        },
      });
      
      if (data?.generateAIConfiguration) {
        const config = data.generateAIConfiguration;
        // Only fill empty fields
        setFormData(prev => ({
          ...prev,
          aiCvAnalysisPrompt: prev.aiCvAnalysisPrompt || config.aiCvAnalysisPrompt || "",
          aiFirstInterviewPrompt: prev.aiFirstInterviewPrompt || config.aiFirstInterviewPrompt || "",
          aiSecondInterviewPrompt: prev.aiSecondInterviewPrompt || config.aiSecondInterviewPrompt || "",
        }));
      }
    } catch (error) {
      console.error("Failed to generate AI configuration:", error);
      // Continue anyway - user can fill manually
    } finally {
      setAiLoading(null);
    }
  }, [formData.title, formData.department, formData.industry, formData.jobLevel, formData.description, formData.responsibilities, formData.requirements, formData.skills, formData.interviewQuestions]);

  // Navigation
  const handleNext = useCallback(async () => {
    if (!validateStep(currentStep)) return;
    
    const currentIndex = steps.findIndex(s => s.key === currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1].key;
      
      // Auto-generate job details when moving from basic to details (only if not already generated)
      if (currentStep === "basic" && nextStep === "details") {
        // Check if any of the fields are empty - if so, generate
        const needsGeneration = !formData.description || !formData.responsibilities || !formData.requirements;
        if (needsGeneration) {
          await generateJobAnalysis();
        }
      }
      
      // Auto-generate AI config when moving from interview to ai-config (only if not already generated)
      if (currentStep === "interview" && nextStep === "ai-config") {
        // Check if AI prompts are empty - if so, generate
        const needsAIConfig = !formData.aiCvAnalysisPrompt || !formData.aiFirstInterviewPrompt || !formData.aiSecondInterviewPrompt;
        if (needsAIConfig) {
          await generateAIConfiguration();
        }
      }
      
      setCurrentStep(nextStep);
    }
  }, [currentStep, steps, validateStep, generateJobAnalysis, generateAIConfiguration, formData.description, formData.responsibilities, formData.requirements, formData.aiCvAnalysisPrompt, formData.aiFirstInterviewPrompt, formData.aiSecondInterviewPrompt]);

  const handlePrevious = useCallback(() => {
    const currentIndex = steps.findIndex(s => s.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key);
    }
  }, [currentStep, steps]);

  // Submit
  const handleSubmit = useCallback(async (isDraft: boolean) => {
    if (!validateStep("basic") || !validateStep("details")) {
      setCurrentStep("basic");
      return;
    }

    setLoading(true);
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_JOB_MUTATION,
        variables: {
          input: {
            title: formData.title,
            department: formData.department,
            description: formData.description,
            shortDescription: formData.shortDescription || formData.description.substring(0, 200),
            location: formData.location,
            type: formData.type,
            workType: formData.workType,
            jobLevel: formData.jobLevel,
            salary: formData.salary,
            skills: formData.skills,
            requirements: formData.requirements,
            responsibilities: formData.responsibilities,
            benefits: formData.benefits,
            experience: formData.experience,
            education: formData.education,
            industry: formData.industry,
            deadline: formData.deadline,
            interviewLanguage: formData.interviewLanguage,
            interviewQuestions: formData.interviewQuestions || undefined,
            cvAnalysisPrompt: formData.aiCvAnalysisPrompt || undefined,
            interviewPrompt: formData.aiFirstInterviewPrompt || undefined,
            aiSecondInterviewPrompt: formData.aiSecondInterviewPrompt || undefined,
            companyDescription: "Company description placeholder", // TODO: Get from company profile
            status: isDraft ? "DRAFT" : "ACTIVE",
          },
        },
      });

      router.push('/dashboard/jobs');
    } catch (error) {
      console.error("Failed to create job:", error);
      setErrors({ submit: "Failed to create job. Please try again." });
    } finally {
      setLoading(false);
    }
  }, [formData, user, router, validateStep]);

  // Progress Indicator
  const ProgressIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.key === currentStep;
          const isCompleted = getCurrentStepIndex() > index;
          
          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-primary-600 text-white"
                      : isActive
                      ? "bg-primary-600 text-white ring-4 ring-primary-100"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" strokeWidth={2.5} />
                  ) : (
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium ${isActive || isCompleted ? "text-primary-700" : "text-gray-500"}`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? "bg-primary-600" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  // Step Components - Using useMemo to prevent losing focus
  const BasicInfoStep = useMemo(() => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium">Job Title *</Label>
        <div className="flex gap-2 mt-1.5">
          <Input
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="e.g., Senior Frontend Developer"
            className={errors.title ? "border-red-500" : ""}
          />
          {formData.title && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={enhanceTitle}
              disabled={aiLoading === "title"}
              className="shrink-0"
            >
              {aiLoading === "title" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Department *</Label>
          <select
            value={formData.department}
            onChange={(e) => handleInputChange("department", e.target.value)}
            className={`w-full mt-1.5 px-3 py-2 border rounded-lg ${errors.department ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="">Select department</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Customer Support">Customer Support</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
            <option value="Legal">Legal</option>
            <option value="IT">IT</option>
            <option value="Data & Analytics">Data & Analytics</option>
            <option value="Business Development">Business Development</option>
            <option value="Administration">Administration</option>
            <option value="Other">Other</option>
          </select>
          {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
        </div>

        <div>
          <Label className="text-sm font-medium">Industry *</Label>
          <select
            value={formData.industry}
            onChange={(e) => handleInputChange("industry", e.target.value)}
            className={`w-full mt-1.5 px-3 py-2 border rounded-lg ${errors.industry ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="">Select industry</option>
            <option value="technology">Technology</option>
            <option value="finance">Finance</option>
            <option value="healthcare">Healthcare</option>
            <option value="education">Education</option>
            <option value="retail">Retail</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="consulting">Consulting</option>
            <option value="other">Other</option>
          </select>
          {errors.industry && <p className="text-xs text-red-500 mt-1">{errors.industry}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium">Job Type *</Label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange("type", e.target.value as JobType)}
            className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>

        <div>
          <Label className="text-sm font-medium">Work Type *</Label>
          <select
            value={formData.workType}
            onChange={(e) => handleInputChange("workType", e.target.value as WorkType)}
            className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="ONSITE">On-site</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>

        <div>
          <Label className="text-sm font-medium">Level *</Label>
          <select
            value={formData.jobLevel}
            onChange={(e) => handleInputChange("jobLevel", e.target.value as JobLevel)}
            className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="ENTRY">Entry</option>
            <option value="MID">Mid</option>
            <option value="SENIOR">Senior</option>
            <option value="LEAD">Lead</option>
            <option value="EXECUTIVE">Executive</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium">Location *</Label>
          <select
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className={`w-full mt-1.5 px-3 py-2 border rounded-lg ${errors.location ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="">Select location</option>
            <option value="Amman, Jordan">Amman, Jordan</option>
            <option value="Dubai, UAE">Dubai, UAE</option>
            <option value="Abu Dhabi, UAE">Abu Dhabi, UAE</option>
            <option value="Sharjah, UAE">Sharjah, UAE</option>
            <option value="Ajman, UAE">Ajman, UAE</option>
            <option value="Ras Al Khaimah, UAE">Ras Al Khaimah, UAE</option>
            <option value="Fujairah, UAE">Fujairah, UAE</option>
            <option value="Umm Al Quwain, UAE">Umm Al Quwain, UAE</option>
            <option value="Riyadh, Saudi Arabia">Riyadh, Saudi Arabia</option>
            <option value="Jeddah, Saudi Arabia">Jeddah, Saudi Arabia</option>
            <option value="Dammam, Saudi Arabia">Dammam, Saudi Arabia</option>
            <option value="Doha, Qatar">Doha, Qatar</option>
            <option value="Kuwait City, Kuwait">Kuwait City, Kuwait</option>
            <option value="Manama, Bahrain">Manama, Bahrain</option>
            <option value="Muscat, Oman">Muscat, Oman</option>
            <option value="Remote">Remote</option>
            <option value="Multiple Locations">Multiple Locations</option>
          </select>
          {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
        </div>

        <div>
          <Label className="text-sm font-medium">Interview Language *</Label>
          <select
            value={formData.interviewLanguage}
            onChange={(e) => handleInputChange("interviewLanguage", e.target.value)}
            className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="english">English</option>
            <option value="arabic">Arabic</option>
          </select>
        </div>

        <div>
          <Label className="text-sm font-medium">Application Deadline *</Label>
          <Input
            type="date"
            value={formData.deadline}
            onChange={(e) => handleInputChange("deadline", e.target.value)}
            className={`mt-1.5 ${errors.deadline ? "border-red-500" : ""}`}
          />
          {errors.deadline && <p className="text-xs text-red-500 mt-1">{errors.deadline}</p>}
        </div>
      </div>
    </div>
  ), [formData, errors, handleInputChange, enhanceTitle, aiLoading]);

  const JobDetailsStep = useMemo(() => (
    <div className="space-y-6">
      {aiLoading === "analysis" && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-5 flex items-start gap-4 shadow-sm">
          <div className="relative">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <div className="absolute inset-0 w-6 h-6 border-2 border-blue-200 rounded-full animate-ping opacity-25"></div>
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-blue-900 mb-1">🤖 AI is crafting your job posting...</p>
            <p className="text-sm text-blue-700 mb-2">This may take up to 20 seconds. Please wait while we generate:</p>
            <ul className="text-xs text-blue-600 space-y-1 ml-4">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                Job description & summary
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                Key responsibilities
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                Requirements & qualifications
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                Benefits & perks
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
                Recommended skills
              </li>
            </ul>
            <p className="text-xs text-blue-500 mt-3 italic">💡 You can edit everything after generation</p>
          </div>
        </div>
      )}
      
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-sm font-medium">Job Description *</Label>
          {formData.description && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={enhanceDescription}
              disabled={aiLoading === "description"}
            >
              {aiLoading === "description" ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Enhance
                </>
              )}
            </Button>
          )}
        </div>
        <Textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Provide a detailed description of the role..."
          rows={6}
          className={errors.description ? "border-red-500" : ""}
          disabled={aiLoading === "analysis"}
        />
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
      </div>

      <div>
        <Label className="text-sm font-medium">Short Description *</Label>
        <Textarea
          value={formData.shortDescription}
          onChange={(e) => handleInputChange("shortDescription", e.target.value)}
          placeholder="Brief summary (1-2 sentences)"
          rows={2}
          className={`mt-1.5 ${errors.shortDescription ? "border-red-500" : ""}`}
          disabled={aiLoading === "analysis"}
        />
        {errors.shortDescription && <p className="text-xs text-red-500 mt-1">{errors.shortDescription}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-sm font-medium">Key Responsibilities *</Label>
          {formData.responsibilities && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={polishResponsibilities}
              disabled={aiLoading === "responsibilities"}
            >
              {aiLoading === "responsibilities" ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Polishing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Polish
                </>
              )}
            </Button>
          )}
        </div>
        <Textarea
          value={formData.responsibilities}
          onChange={(e) => handleInputChange("responsibilities", e.target.value)}
          placeholder="List key responsibilities..."
          rows={5}
          className={errors.responsibilities ? "border-red-500" : ""}
          disabled={aiLoading === "analysis"}
        />
        {errors.responsibilities && <p className="text-xs text-red-500 mt-1">{errors.responsibilities}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-sm font-medium">Requirements *</Label>
          {formData.requirements && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={polishRequirements}
              disabled={aiLoading === "requirements"}
            >
              {aiLoading === "requirements" ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Polishing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Polish
                </>
              )}
            </Button>
          )}
        </div>
        <Textarea
          value={formData.requirements}
          onChange={(e) => handleInputChange("requirements", e.target.value)}
          placeholder="List requirements and qualifications..."
          rows={5}
          className={errors.requirements ? "border-red-500" : ""}
          disabled={aiLoading === "analysis"}
        />
        {errors.requirements && <p className="text-xs text-red-500 mt-1">{errors.requirements}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-sm font-medium">Benefits</Label>
          {formData.benefits && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={polishBenefits}
              disabled={aiLoading === "benefits"}
            >
              {aiLoading === "benefits" ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Polishing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Polish
                </>
              )}
            </Button>
          )}
        </div>
        <Textarea
          value={formData.benefits}
          onChange={(e) => handleInputChange("benefits", e.target.value)}
          placeholder="List benefits and perks..."
          rows={4}
          disabled={aiLoading === "analysis"}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-sm font-medium">Skills *</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={suggestSkills}
            disabled={aiLoading === "skills"}
          >
            {aiLoading === "skills" ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Suggesting...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-1" />
                Suggest
              </>
            )}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-1 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add a skill..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              if (input?.value) {
                addSkill(input.value);
                input.value = "";
              }
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {errors.skills && <p className="text-xs text-red-500 mt-1">{errors.skills}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium">Experience (years) *</Label>
          <Input
            value={formData.experience}
            onChange={(e) => handleInputChange("experience", e.target.value)}
            placeholder="e.g., 3-5"
            className={`mt-1.5 ${errors.experience ? "border-red-500" : ""}`}
          />
          {errors.experience && <p className="text-xs text-red-500 mt-1">{errors.experience}</p>}
        </div>

        <div>
          <Label className="text-sm font-medium">Education</Label>
          <Input
            value={formData.education}
            onChange={(e) => handleInputChange("education", e.target.value)}
            placeholder="e.g., Bachelor's"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Salary Range *</Label>
          <Input
            value={formData.salary}
            onChange={(e) => handleInputChange("salary", e.target.value)}
            placeholder="e.g., 80000-120000"
            className={`mt-1.5 ${errors.salary ? "border-red-500" : ""}`}
          />
          {errors.salary && <p className="text-xs text-red-500 mt-1">{errors.salary}</p>}
        </div>
      </div>
    </div>
  ), [formData, errors, handleInputChange, enhanceDescription, polishRequirements, polishResponsibilities, polishBenefits, suggestSkills, aiLoading, addSkill, removeSkill]);

  const InterviewQuestionsStep = useMemo(() => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Additional Interview Questions (Optional)</Label>
        <p className="text-xs text-gray-600 mt-1 mb-3">
          Add custom questions for the AI interviewer. Enter one per line or separate with semicolons.
        </p>
        <Textarea
          value={formData.interviewQuestions}
          onChange={(e) => handleInputChange("interviewQuestions", e.target.value)}
          placeholder="What interests you about this role?&#10;Describe your experience with..."
          rows={8}
        />
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-900 mb-2">Tips for AI Interview Questions:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Focus on role-specific skills and experience</li>
          <li>• Ask behavioral questions to understand problem-solving</li>
          <li>• Include questions about motivation and career goals</li>
          <li>• Keep questions open-ended for detailed responses</li>
        </ul>
      </div>
    </div>
  ), [formData, handleInputChange]);

  const AIConfigStep = useMemo(() => (
    <div className="space-y-4">
      {aiLoading === "ai-config" && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-5 flex items-start gap-4 shadow-sm">
          <div className="relative">
            <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
            <div className="absolute inset-0 w-6 h-6 border-2 border-purple-200 rounded-full animate-ping opacity-25"></div>
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-purple-900 mb-1">🤖 AI is generating interview prompts...</p>
            <p className="text-sm text-purple-700 mb-2">Creating customized AI configurations for your recruitment process</p>
            <ul className="text-xs text-purple-600 space-y-1 ml-4">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                CV Analysis Prompt
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                First Interview Prompt
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                Second Interview Prompt
              </li>
            </ul>
            <p className="text-xs text-purple-500 mt-3 italic">✨ Tailored to your job requirements</p>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-900">
          These prompts will be automatically generated based on your job details. You can customize them if needed.
        </p>
      </div>

      <div>
        <Label className="text-sm font-medium">CV Analysis Prompt</Label>
        <Textarea
          value={formData.aiCvAnalysisPrompt}
          onChange={(e) => handleInputChange("aiCvAnalysisPrompt", e.target.value)}
          placeholder="Will be auto-generated..."
          rows={4}
          className="mt-1.5"
          disabled={aiLoading === "ai-config"}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">First Interview Prompt</Label>
        <Textarea
          value={formData.aiFirstInterviewPrompt}
          onChange={(e) => handleInputChange("aiFirstInterviewPrompt", e.target.value)}
          placeholder="Will be auto-generated..."
          rows={4}
          className="mt-1.5"
          disabled={aiLoading === "ai-config"}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Second Interview Prompt</Label>
        <Textarea
          value={formData.aiSecondInterviewPrompt}
          onChange={(e) => handleInputChange("aiSecondInterviewPrompt", e.target.value)}
          placeholder="Will be auto-generated..."
          rows={4}
          className="mt-1.5"
          disabled={aiLoading === "ai-config"}
        />
      </div>
    </div>
  ), [formData, handleInputChange, aiLoading]);

  const PreviewStep = useMemo(() => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{formData.title}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-600">Department:</span> {formData.department}
          </div>
          <div>
            <span className="text-gray-600">Location:</span> {formData.location}
          </div>
          <div>
            <span className="text-gray-600">Type:</span> {formData.type.replace("_", " ")}
          </div>
          <div>
            <span className="text-gray-600">Level:</span> {formData.jobLevel}
          </div>
          <div>
            <span className="text-gray-600">Work Type:</span> {formData.workType}
          </div>
          <div>
            <span className="text-gray-600">Interview Language:</span> {formData.interviewLanguage.charAt(0).toUpperCase() + formData.interviewLanguage.slice(1)}
          </div>
        </div>
        
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{formData.description}</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Responsibilities</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{formData.responsibilities}</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Requirements</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{formData.requirements}</p>
          </div>
          
          {formData.benefits && (
            <div>
              <h4 className="font-semibold mb-2">Benefits</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{formData.benefits}</p>
            </div>
          )}
          
          <div>
            <h4 className="font-semibold mb-2">Skills Required</h4>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map(skill => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </div>
          
          {formData.interviewQuestions && (
            <div>
              <h4 className="font-semibold mb-2">Interview Questions</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{formData.interviewQuestions}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* AI Configuration Section */}
      {(formData.aiCvAnalysisPrompt || formData.aiFirstInterviewPrompt || formData.aiSecondInterviewPrompt) && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            AI Configuration
          </h3>
          <div className="space-y-4 text-sm">
            {formData.aiCvAnalysisPrompt && (
              <div>
                <h4 className="font-semibold mb-2 text-purple-900">CV Analysis Prompt</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-white rounded p-3 border border-purple-100">{formData.aiCvAnalysisPrompt}</p>
              </div>
            )}
            
            {formData.aiFirstInterviewPrompt && (
              <div>
                <h4 className="font-semibold mb-2 text-purple-900">First Interview Prompt</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-white rounded p-3 border border-purple-100">{formData.aiFirstInterviewPrompt}</p>
              </div>
            )}
            
            {formData.aiSecondInterviewPrompt && (
              <div>
                <h4 className="font-semibold mb-2 text-purple-900">Second Interview Prompt</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-white rounded p-3 border border-purple-100">{formData.aiSecondInterviewPrompt}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Button
          onClick={() => handleSubmit(true)}
          disabled={loading}
          className="w-full max-w-md h-11 bg-primary-600 hover:bg-primary-700"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
          Save as Draft
        </Button>
      </div>
    </div>
  ), [formData, loading, handleSubmit]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Create Job Posting</h1>
              <p className="text-sm text-gray-600 mt-0.5">Fill in the details to create your job posting</p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator />

        {/* Error Message */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {errors.submit}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentStep === "basic" && "Basic Information"}
              {currentStep === "details" && "Job Details"}
              {currentStep === "interview" && "Interview Questions"}
              {currentStep === "ai-config" && "AI Configuration"}
              {currentStep === "preview" && "Review & Publish"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {currentStep === "basic" && "Essential details about the position"}
              {currentStep === "details" && "Detailed description and requirements"}
              {currentStep === "interview" && "Optional custom questions for AI interviewer"}
              {currentStep === "ai-config" && "Configure AI prompts for recruitment"}
              {currentStep === "preview" && "Final review before publishing"}
            </p>
          </div>

          {/* Step Content */}
          {currentStep === "basic" && BasicInfoStep}
          {currentStep === "details" && JobDetailsStep}
          {currentStep === "interview" && InterviewQuestionsStep}
          {currentStep === "ai-config" && AIConfigStep}
          {currentStep === "preview" && PreviewStep}

          {/* Navigation */}
          {currentStep !== "preview" && (
            <>
              <div className="flex gap-3 mt-8 pt-8 border-t">
                {!isFirstStep && (
                  <Button
                    type="button"
                    onClick={handlePrevious}
                    variant="outline"
                    className="flex-1 h-11 border-2"
                    disabled={aiLoading === "analysis" || aiLoading === "ai-config"}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 h-11 bg-primary-600 hover:bg-primary-700"
                  disabled={aiLoading === "analysis" || aiLoading === "ai-config"}
                >
                  {aiLoading === "analysis" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Job Details...
                    </>
                  ) : aiLoading === "ai-config" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating AI Config...
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
              {(aiLoading === "analysis" || aiLoading === "ai-config") && (
                <p className="text-xs text-gray-500 text-center mt-3 font-medium">
                  This may take up to 30 seconds
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
