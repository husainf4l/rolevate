export interface JobFormData {
  title: string;
  department: string;
  location: string;
  workType: "ONSITE" | "REMOTE" | "HYBRID";
  experienceLevel: "ENTRY_LEVEL" | "JUNIOR" | "MID_LEVEL" | "SENIOR" | "LEAD" | "PRINCIPAL" | "EXECUTIVE";
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  skills: string[];
  currency: string;
  salaryMin?: number;
  salaryMax?: number;
  enableAiInterview: boolean;
  interviewDuration?: number;
  aiPrompt?: string;
  aiInstructions?: string;
}

export interface JobCreationProps {
  formData: JobFormData;
  fieldErrors: { [key: string]: string };
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onValidate?: (name: string, value: any) => void;
}

export interface SkillManagementProps {
  skills: string[];
  skillInput: string;
  skillSuggestions: string[];
  fieldErrors: { [key: string]: string };
  onSkillInputChange: (value: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skill: string) => void;
  onSkillSuggestionClick: (skill: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}
