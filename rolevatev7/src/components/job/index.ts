// Job form components and types
export interface JobFormData {
  title: string;
  department: string;
  location: string;
  salary: string;
  type: string;
  deadline: string;
  description: string;
  shortDescription: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  skills: string[];
  experience: string;
  education: string;
  jobLevel: string;
  workType: string;
  industry: string;
  companyDescription: string;
  cvAnalysisPrompt?: string;
  interviewPrompt?: string;
  aiSecondInterviewPrompt?: string;
  interviewLanguage?: string;
  featured?: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
}

export interface StepConfig {
  currentStep: number;
  totalSteps: number;
  steps: FormStep[];
}

// Placeholder components - these need to be implemented
export const BasicInformationStep = () => null;
export const JobDetailsStep = () => null;
export const AIConfigurationStep = () => null;
export const JobPreviewStep = () => null;
export const ProgressIndicator = () => null;
export const NavigationButtons = () => null;
