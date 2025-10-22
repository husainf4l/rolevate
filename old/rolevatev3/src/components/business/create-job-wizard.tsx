'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  FileText,
  MessageSquare,
  Bot,
  Eye,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { jobsService } from '@/services/jobs';
import {
  JobFormData,
  FormErrors,
  FormStep,
  StepConfig,
  JobAnalysisRequest,
  AIConfigRequest,
} from '@/types/job';
import { toast } from 'sonner';

// Import step components (we'll create these)
import BasicInformationStep from './steps/basic-information-step';
import JobDetailsStep from './steps/job-details-step';
import InterviewQuestionsStep from './steps/interview-questions-step';
import AIConfigurationStep from './steps/ai-configuration-step';
import JobPreviewStep from './steps/job-preview-step';

interface CreateJobWizardProps {
  locale: string;
}

export default function CreateJobWizard({ locale }: CreateJobWizardProps) {
  const router = useRouter();
  const t = useTranslations('business.jobs.create');
  
  const [currentStep, setCurrentStep] = useState<FormStep>('basic');
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [jobData, setJobData] = useState<JobFormData>({
    // Basic Information (Step 1)
    title: '',
    department: '',
    location: '',
    salary: '',
    type: 'FULL_TIME' as any,
    deadline: '',
    jobLevel: 'MID_LEVEL' as any,
    workType: 'ON_SITE' as any,
    industry: '',

    // Job Details (Step 2)
    description: '',
    shortDescription: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    skills: [],
    experience: '',
    education: '',

    // Interview Questions (Step 3)
    interviewQuestions: '',

    // AI Configuration (Step 4)
    interviewLanguage: 'english',
    aiCvAnalysisPrompt: '',
    aiFirstInterviewPrompt: '',
    aiSecondInterviewPrompt: '',
  });

  const steps: StepConfig[] = [
    {
      key: 'basic',
      title: t('steps.basic.title'),
      description: t('steps.basic.description'),
      icon: Briefcase,
    },
    {
      key: 'details',
      title: t('steps.details.title'),
      description: t('steps.details.description'),
      icon: FileText,
    },
    {
      key: 'interview-questions',
      title: t('steps.interview.title'),
      description: t('steps.interview.description'),
      icon: MessageSquare,
    },
    {
      key: 'ai-config',
      title: t('steps.aiConfig.title'),
      description: t('steps.aiConfig.description'),
      icon: Bot,
    },
    {
      key: 'preview',
      title: t('steps.preview.title'),
      description: t('steps.preview.description'),
      icon: Eye,
    },
  ];

  const getCurrentStepIndex = () =>
    steps.findIndex((step) => step.key === currentStep);
  
  const isLastStep = () => getCurrentStepIndex() === steps.length - 1;
  const isFirstStep = () => getCurrentStepIndex() === 0;

  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key);
    }
  };

  const updateJobData = (field: string, value: any) => {
    setJobData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: FormStep): boolean => {
    const stepErrors: FormErrors = {};

    switch (step) {
      case 'basic':
        if (!jobData.title.trim()) stepErrors.title = t('validation.required');
        if (!jobData.department.trim()) stepErrors.department = t('validation.required');
        if (!jobData.location.trim()) stepErrors.location = t('validation.required');
        break;
      case 'details':
        if (!jobData.description.trim()) stepErrors.description = t('validation.required');
        if (jobData.skills.length === 0) stepErrors.skills = t('validation.skillsRequired');
        break;
      case 'interview-questions':
        // Interview questions are optional
        break;
      case 'ai-config':
        // AI config is optional
        break;
      case 'preview':
        // Final validation happens here
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      goToNextStep();
    }
  };

  const handleBack = () => {
    goToPreviousStep();
  };

  const generateWithAI = async () => {
    if (!jobData.title || !jobData.department || !jobData.industry) {
      toast.error(t('ai.missingFields'));
      return;
    }

    setAiGenerating(true);
    try {
      const request: JobAnalysisRequest = {
        jobTitle: jobData.title,
        department: jobData.department,
        industry: jobData.industry,
        employeeType: jobData.type,
        jobLevel: jobData.jobLevel,
        workType: jobData.workType,
        location: jobData.location,
        country: 'UAE', // Default country, could be extracted from location
      };

      const aiResponse = await jobsService.generateJobAnalysis(request);
      
      setJobData(prev => ({
        ...prev,
        description: aiResponse.description,
        shortDescription: aiResponse.shortDescription,
        responsibilities: aiResponse.responsibilities,
        requirements: aiResponse.requirements,
        benefits: aiResponse.benefits,
        skills: aiResponse.skills,
        experience: aiResponse.experienceLevel || prev.experience,
        education: aiResponse.educationLevel || prev.education,
        salary: aiResponse.suggestedSalary || prev.salary,
      }));

      toast.success(t('ai.generated'));
      goToNextStep(); // Move to details step
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(t('ai.error'));
    } finally {
      setAiGenerating(false);
    }
  };

  const generateAIPrompts = async () => {
    setLoading(true);
    try {
      const request: AIConfigRequest = {
        jobTitle: jobData.title,
        department: jobData.department,
        industry: jobData.industry,
        jobLevel: jobData.jobLevel,
        description: jobData.description,
        responsibilities: jobData.responsibilities,
        requirements: jobData.requirements,
        skills: jobData.skills,
        interviewQuestions: jobData.interviewQuestions,
      };

      const aiPrompts = await jobsService.generateAIPrompts(request);
      
      setJobData(prev => ({
        ...prev,
        aiCvAnalysisPrompt: aiPrompts.aiCvAnalysisPrompt,
        aiFirstInterviewPrompt: aiPrompts.aiFirstInterviewPrompt,
        aiSecondInterviewPrompt: aiPrompts.aiSecondInterviewPrompt,
      }));

      toast.success(t('ai.promptsGenerated'));
    } catch (error) {
      console.error('AI prompts generation error:', error);
      toast.error(t('ai.promptsError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Convert form data to create job request
      const createJobRequest = {
        title: jobData.title,
        description: jobData.description,
        summary: jobData.shortDescription,
        responsibilities: jobData.responsibilities,
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        skills: jobData.skills,
        jobType: jobData.type,
        experienceLevel: jobData.jobLevel,
        category: 'TECHNOLOGY' as any, // Default, could be mapped from industry
        workLocation: jobData.workType,
        applicationDeadline: jobData.deadline,
        salaryMin: jobData.salary ? parseFloat(jobData.salary.split('-')[0]?.trim() || '0') : undefined,
        salaryMax: jobData.salary ? parseFloat(jobData.salary.split('-')[1]?.trim() || '0') : undefined,
        currency: 'AED',
      };

      const response = await jobsService.createJob(createJobRequest);
      
      if (response.success) {
        toast.success(t('success'));
        router.push('/business/jobs');
      } else {
        toast.error(response.message || t('error'));
      }
    } catch (error) {
      console.error('Job creation error:', error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <BasicInformationStep
            data={jobData}
            errors={errors}
            onChange={updateJobData}
            onGenerateAI={generateWithAI}
            aiGenerating={aiGenerating}
            locale={locale}
          />
        );
      case 'details':
        return (
          <JobDetailsStep
            data={jobData}
            errors={errors}
            onChange={updateJobData}
            locale={locale}
          />
        );
      case 'interview-questions':
        return (
          <InterviewQuestionsStep
            data={jobData}
            errors={errors}
            onChange={updateJobData}
            locale={locale}
          />
        );
      case 'ai-config':
        return (
          <AIConfigurationStep
            data={jobData}
            errors={errors}
            onChange={updateJobData}
            onGeneratePrompts={generateAIPrompts}
            loading={loading}
            locale={locale}
          />
        );
      case 'preview':
        return (
          <JobPreviewStep
            data={jobData}
            locale={locale}
            onSubmit={handleSubmit}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  const progress = ((getCurrentStepIndex() + 1) / steps.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/business/jobs')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('backToJobs')}
        </Button>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t('title')}
        </h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {/* Progress Bar */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle>{steps[getCurrentStepIndex()].title}</CardTitle>
            <span className="text-sm text-muted-foreground">
              {getCurrentStepIndex() + 1} / {steps.length}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === getCurrentStepIndex();
              const isCompleted = index < getCurrentStepIndex();
              
              return (
                <div
                  key={step.key}
                  className={`flex flex-col items-center text-center ${
                    isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-medium hidden sm:block">
                    {step.title}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="mb-8">
        <CardContent className="p-6">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={isFirstStep() || loading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('previous')}
        </Button>

        {isLastStep() ? (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('publish')}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={loading}>
            {t('next')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}