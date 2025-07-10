export interface JobFormData {
  title: string;
  department: string;
  location: string;
  salary: string;
  type: "full-time" | "part-time" | "contract" | "remote";
  deadline: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  skills: string[];
  experience: string;
  education: string;
  screeningQuestions: ScreeningQuestion[];
  jobLevel: "entry" | "mid" | "senior" | "executive";
  workType: "onsite" | "remote" | "hybrid";
  industry: string;
  companyDescription: string;
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

export type FormStep = "basic" | "details" | "screening" | "preview";

export interface StepConfig {
  key: FormStep;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}