export interface JobFormData {
  title: string;
  department: string;
  location: string;
  salary: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "REMOTE";
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
  jobLevel: "ENTRY" | "MID" | "SENIOR" | "EXECUTIVE";
  workType: "ONSITE" | "REMOTE" | "HYBRID";
  industry: string;
  interviewLanguage: "english" | "arabic";
  aiCvAnalysisPrompt: string;
  aiFirstInterviewPrompt: string;
  aiSecondInterviewPrompt: string;
}

export interface ScreeningQuestion {
  id: string;
  question: string;
  type: "yes_no" | "multiple_choice" | "text" | "number";
  options?: string[];
  required: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export type FormStep = "basic" | "details" | "interview-questions" | "ai-config" | "preview";

export interface StepConfig {
  key: FormStep;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}