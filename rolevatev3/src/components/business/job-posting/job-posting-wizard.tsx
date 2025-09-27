"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  Briefcase,
  DollarSign,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { jobsService } from "@/services/jobs";
import { useAuthContext } from "@/providers/auth-provider";
import {
  CreateJobPostDto,
  CreateAddressDto,
  WorkLocation,
  JobType,
  ExperienceLevel,
  EducationLevel,
  JobCategory,
  SalaryType,
  JobPriority,
} from "@/types/job";
import BasicInformationStep from "./basic-information-step";
import JobDescriptionStep from "./job-description-step";
import JobDetailsStep from "./job-details-step";
import CompensationStep from "./compensation-step";
import RequirementsSkillsStep from "./requirements-skills-step";
import AdditionalSettingsStep from "./additional-settings-step";

interface JobPostingWizardProps {
  locale: string;
  onBack: () => void;
}

export default function JobPostingWizard({
  locale,
  onBack,
}: JobPostingWizardProps) {
  const { user } = useAuthContext();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const steps = [
    {
      id: 1,
      title: locale === "ar" ? "المعلومات الأساسية" : "Basic Information",
      icon: Building2,
    },
    {
      id: 2,
      title: locale === "ar" ? "وصف الوظيفة" : "Job Description",
      icon: Briefcase,
    },
    {
      id: 3,
      title: locale === "ar" ? "تفاصيل الوظيفة" : "Job Details",
      icon: Briefcase,
    },
    {
      id: 4,
      title: locale === "ar" ? "التعويض" : "Compensation",
      icon: DollarSign,
    },
    {
      id: 5,
      title: locale === "ar" ? "المتطلبات والمهارات" : "Requirements & Skills",
      icon: Users,
    },
    {
      id: 6,
      title: locale === "ar" ? "الإعدادات الإضافية" : "Additional Settings",
      icon: Settings,
    },
  ];

  // Form state
  const [formData, setFormData] = useState<CreateJobPostDto>({
    title: "",
    titleAr: "",
    description: "",
    descriptionAr: "",
    summary: "",
    summaryAr: "",
    address: {
      street: "",
      city: "",
      country: "",
    },
    workLocation: WorkLocation.ON_SITE,
    remotePolicy: "",
    jobType: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.ENTRY_LEVEL,
    educationLevel: EducationLevel.BACHELOR_DEGREE,
    category: JobCategory.TECHNOLOGY,
    industry: "",
    industryAr: "",
    department: "",
    reportingTo: "",
    teamSize: 1,
    skills: [],
    preferredSkills: [],
    languages: [],
    certifications: [],
    minExperienceYears: 0,
    maxExperienceYears: 0,
    requirements: "",
    requirementsAr: "",
    qualifications: "",
    qualificationsAr: "",
    responsibilities: "",
    responsibilitiesAr: "",
    benefits: "",
    benefitsAr: "",
    perks: [],
    workingHours: "",
    vacation: "",
    salaryMin: "",
    salaryMax: "",
    salaryType: SalaryType.MONTHLY,
    currency: "AED",
    salaryNegotiable: false,
    applicationDeadline: "",
    applicationProcess: "",
    applicationProcessAr: "",
    contactEmail: "",
    contactPhone: "",
    applicationUrl: "",
    priority: JobPriority.NORMAL,
    featured: false,
    urgent: false,
    tags: [],
    keywords: [],
    slug: "",
    templateId: "",
    isTemplate: false,
    templateName: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    field: keyof CreateJobPostDto,
    value:
      | string
      | number
      | boolean
      | string[]
      | CreateAddressDto
      | JobType
      | ExperienceLevel
      | EducationLevel
      | WorkLocation
      | JobCategory
      | SalaryType
      | JobPriority
      | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.title && formData.category);
      case 2:
        return !!(formData.description && formData.description.length >= 50);
      case 3:
        return !!(
          formData.jobType &&
          formData.workLocation &&
          formData.experienceLevel
        );
      case 4:
        return !!(
          formData.salaryMin &&
          formData.salaryMax &&
          formData.currency
        );
      case 5:
        return !!(formData.requirements && formData.skills.length > 0);
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setError(null);
    } else if (!validateCurrentStep()) {
      setError(
        locale === "ar"
          ? "يرجى ملء جميع الحقول المطلوبة"
          : "Please fill in all required fields"
      );
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError("You must be logged in to post a job");
      return;
    }

    // Basic validation
    if (!formData.title || !formData.description) {
      setError(
        locale === "ar"
          ? "يرجى ملء جميع الحقول المطلوبة"
          : "Please fill in all required fields"
      );
      return;
    }

    // Description length validation
    if (formData.description.length < 50) {
      setError(
        locale === "ar"
          ? "يجب أن يكون وصف الوظيفة 50 حرفًا على الأقل"
          : "Job description must be at least 50 characters long"
      );
      return;
    }

    // Salary validation
    if (
      formData.salaryMin &&
      (isNaN(Number(formData.salaryMin)) || Number(formData.salaryMin) < 0)
    ) {
      setError(
        locale === "ar"
          ? "يجب أن يكون الحد الأدنى للراتب رقمًا موجبًا"
          : "Minimum salary must be a positive number"
      );
      return;
    }

    if (
      formData.salaryMax &&
      (isNaN(Number(formData.salaryMax)) || Number(formData.salaryMax) < 0)
    ) {
      setError(
        locale === "ar"
          ? "يجب أن يكون الحد الأقصى للراتب رقمًا موجبًا"
          : "Maximum salary must be a positive number"
      );
      return;
    }

    // Email validation
    if (
      formData.contactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)
    ) {
      setError(
        locale === "ar"
          ? "يرجى إدخال بريد إلكتروني صحيح"
          : "Please enter a valid email address"
      );
      return;
    }

    // URL validation
    if (
      formData.applicationUrl &&
      !/^https?:\/\/.+/.test(formData.applicationUrl)
    ) {
      setError(
        locale === "ar" ? "يرجى إدخال رابط صحيح" : "Please enter a valid URL"
      );
      return;
    }

    // Date validation
    if (formData.applicationDeadline) {
      const date = new Date(formData.applicationDeadline);
      if (isNaN(date.getTime())) {
        setError(
          locale === "ar"
            ? "يرجى إدخال تاريخ صحيح"
            : "Please enter a valid date"
        );
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare data for submission
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { numberOfPositions: _numberOfPositions, ...submitData } = {
        ...formData,
        // Convert applicationDeadline to ISO 8601 format if it exists
        applicationDeadline: formData.applicationDeadline
          ? new Date(formData.applicationDeadline).toISOString()
          : undefined,
      };

      const result = await jobsService.createJob(submitData);

      if (result.success) {
        console.log("Job created successfully:", result.job);
        // Navigate to jobs page after successful creation
        router.push(`/${locale}/business/jobs`);
      } else {
        setError(result.message || "Failed to create job");
      }
    } catch (error) {
      console.error("Error creating job:", error);
      setError("An error occurred while creating the job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInformationStep
            formData={formData}
            onChange={handleInputChange}
            locale={locale}
          />
        );
      case 2:
        return (
          <JobDescriptionStep
            formData={formData}
            onChange={handleInputChange}
            locale={locale}
          />
        );
      case 3:
        return (
          <JobDetailsStep
            formData={formData}
            onChange={handleInputChange}
            locale={locale}
          />
        );
      case 4:
        return (
          <CompensationStep
            formData={formData}
            onChange={handleInputChange}
            locale={locale}
          />
        );
      case 5:
        return (
          <RequirementsSkillsStep
            formData={formData}
            onChange={handleInputChange}
            locale={locale}
          />
        );
      case 6:
        return (
          <AdditionalSettingsStep
            formData={formData}
            onChange={handleInputChange}
            locale={locale}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.id < currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : step.id === currentStep
                    ? "border-primary text-primary"
                    : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {step.id < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    step.id < currentStep
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Titles */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          {steps.find((step) => step.id === currentStep)?.title}
        </h2>
        <p className="text-muted-foreground mt-1">
          {locale === "ar"
            ? `الخطوة ${currentStep} من ${totalSteps}`
            : `Step ${currentStep} of ${totalSteps}`}
        </p>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">{renderCurrentStep()}</CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onBack : handlePrevious}
          disabled={isSubmitting}
        >
          {currentStep === 1 ? (
            <>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {locale === "ar" ? "العودة" : "Back"}
            </>
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              {locale === "ar" ? "السابق" : "Previous"}
            </>
          )}
        </Button>

        {currentStep < totalSteps ? (
          <Button onClick={handleNext} disabled={isSubmitting}>
            {locale === "ar" ? "التالي" : "Next"}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? locale === "ar"
                ? "جاري النشر..."
                : "Publishing..."
              : locale === "ar"
              ? "نشر الوظيفة"
              : "Publish Job"}
          </Button>
        )}
      </div>
    </div>
  );
}
