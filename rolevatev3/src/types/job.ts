export enum JobStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  EXPIRED = 'EXPIRED',
  PAUSED = 'PAUSED',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  FREELANCE = 'FREELANCE',
  INTERNSHIP = 'INTERNSHIP',
  TEMPORARY = 'TEMPORARY',
  SEASONAL = 'SEASONAL',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
}

export enum ExperienceLevel {
  ENTRY_LEVEL = 'ENTRY_LEVEL',
  JUNIOR = 'JUNIOR',
  MID_LEVEL = 'MID_LEVEL',
  SENIOR = 'SENIOR',
  EXECUTIVE = 'EXECUTIVE',
  LEAD = 'LEAD',
  DIRECTOR = 'DIRECTOR',
  VP = 'VP',
  C_LEVEL = 'C_LEVEL',
}

export enum EducationLevel {
  HIGH_SCHOOL = 'HIGH_SCHOOL',
  ASSOCIATE_DEGREE = 'ASSOCIATE_DEGREE',
  BACHELOR_DEGREE = 'BACHELOR_DEGREE',
  MASTER_DEGREE = 'MASTER_DEGREE',
  PHD = 'PHD',
  PROFESSIONAL_CERTIFICATION = 'PROFESSIONAL_CERTIFICATION',
  NO_FORMAL_EDUCATION = 'NO_FORMAL_EDUCATION',
}

export enum JobPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum SalaryType {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  PROJECT_BASED = 'PROJECT_BASED',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  SAR = 'SAR',
  AED = 'AED',
  KWD = 'KWD',
  BHD = 'BHD',
  QAR = 'QAR',
  OMR = 'OMR',
  JOD = 'JOD',
  EGP = 'EGP',
  LBP = 'LBP',
}

export enum WorkLocation {
  ON_SITE = 'ON_SITE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
}

export enum JobCategory {
  TECHNOLOGY = 'TECHNOLOGY',
  FINANCE = 'FINANCE',
  HEALTHCARE = 'HEALTHCARE',
  MARKETING = 'MARKETING',
  SALES = 'SALES',
  HUMAN_RESOURCES = 'HUMAN_RESOURCES',
  OPERATIONS = 'OPERATIONS',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  DESIGN = 'DESIGN',
  ENGINEERING = 'ENGINEERING',
  EDUCATION = 'EDUCATION',
  LEGAL = 'LEGAL',
  CONSULTING = 'CONSULTING',
  MANUFACTURING = 'MANUFACTURING',
  RETAIL = 'RETAIL',
  HOSPITALITY = 'HOSPITALITY',
  CONSTRUCTION = 'CONSTRUCTION',
  TRANSPORTATION = 'TRANSPORTATION',
  MEDIA = 'MEDIA',
  NON_PROFIT = 'NON_PROFIT',
  GOVERNMENT = 'GOVERNMENT',
  AGRICULTURE = 'AGRICULTURE',
  ENERGY = 'ENERGY',
  REAL_ESTATE = 'REAL_ESTATE',
  OTHER = 'OTHER',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEWED = 'INTERVIEWED',
  SECOND_INTERVIEW = 'SECOND_INTERVIEW',
  FINAL_INTERVIEW = 'FINAL_INTERVIEW',
  REFERENCE_CHECK = 'REFERENCE_CHECK',
  BACKGROUND_CHECK = 'BACKGROUND_CHECK',
  OFFER_EXTENDED = 'OFFER_EXTENDED',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_DECLINED = 'OFFER_DECLINED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  ON_HOLD = 'ON_HOLD',
}

export enum QuestionType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  YES_NO = 'YES_NO',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  FILE_UPLOAD = 'FILE_UPLOAD',
  RATING = 'RATING',
}

export enum AlertFrequency {
  IMMEDIATE = 'IMMEDIATE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum ApplicationSource {
  DIRECT = 'DIRECT',
  LINKEDIN = 'LINKEDIN',
  INDEED = 'INDEED',
  GLASSDOOR = 'GLASSDOOR',
  COMPANY_WEBSITE = 'COMPANY_WEBSITE',
  REFERRAL = 'REFERRAL',
  RECRUITMENT_AGENCY = 'RECRUITMENT_AGENCY',
  JOB_FAIR = 'JOB_FAIR',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  OTHER = 'OTHER',
}

export interface CreateAddressDto {
  street?: string;
  city?: string;
  country?: string;
  cityAr?: string;
  countryAr?: string;
}

export interface CreateJobPostDto {
  // Basic Information
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  summary?: string;
  summaryAr?: string;

  // Requirements and Qualifications
  requirements?: string;
  requirementsAr?: string;
  qualifications?: string;
  qualificationsAr?: string;
  responsibilities?: string;
  responsibilitiesAr?: string;

  // Location and Work Setup
  address?: CreateAddressDto;
  workLocation?: WorkLocation;
  remotePolicy?: string;

  // Compensation
  salaryMin?: number | string;
  salaryMax?: number | string;
  currency?: string;
  salaryType?: SalaryType;
  salaryNegotiable?: boolean;

  // Job Details
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  educationLevel?: EducationLevel;
  category: JobCategory;
  industry?: string;
  industryAr?: string;
  department?: string;
  reportingTo?: string;
  teamSize?: number;

  // Skills and Experience
  skills: string[];
  preferredSkills?: string[];
  languages?: string[];
  certifications?: string[];
  minExperienceYears?: number;
  maxExperienceYears?: number;

  // Benefits and Perks
  benefits?: string;
  benefitsAr?: string;
  perks?: string[];
  workingHours?: string;
  vacation?: string;

  // Application Process
  applicationDeadline?: string;
  applicationProcess?: string;
  applicationProcessAr?: string;
  contactEmail?: string;
  contactPhone?: string;
  applicationUrl?: string;

  // Metadata
  priority?: JobPriority;
  featured?: boolean;
  urgent?: boolean;
  tags?: string[];
  keywords?: string[];
  slug?: string;

  // Additional fields for form compatibility
  numberOfPositions?: number;

  // Templates
  templateId?: string;
  isTemplate?: boolean;
  templateName?: string;
}

export interface JobsResponse {
  success: boolean;
  message?: string;
  jobs?: Job[];
  job?: Job;
}

// Updated Job interface with proper enums

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  workLocation: WorkLocation;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  educationLevel?: EducationLevel;
  category: JobCategory;
  skills: string[];
  tags?: string[];
  requirements?: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: SalaryType;
  currency: Currency;
  status: JobStatus;
  priority: JobPriority;
  isRemote?: boolean;
  isUrgent?: boolean;
  applicationDeadline?: string;
  numberOfPositions?: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  expiresAt?: string;
}

// Simplified interface for job creation form
export interface CreateJobRequest {
  title: string;
  description: string;
  location?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  workLocation?: WorkLocation;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  educationLevel?: EducationLevel;
  category: JobCategory;
  skills: string[];
  requirements?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: SalaryType;
  currency?: string;
  priority?: JobPriority;
  applicationDeadline?: string;
  numberOfPositions?: number;
}

// Screening questions
export interface ScreeningQuestion {
  id: string;
  jobId: string;
  question: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
  order: number;
}

// Job alerts/notifications
export interface JobAlert {
  id: string;
  userId: string;
  keywords?: string[];
  categories?: JobCategory[];
  locations?: string[];
  jobTypes?: JobType[];
  experienceLevels?: ExperienceLevel[];
  salaryMin?: number;
  salaryMax?: number;
  frequency: AlertFrequency;
  isActive: boolean;
  createdAt: string;
  lastSentAt?: string;
}

// Application related interfaces
export interface JobApplication {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  source: ApplicationSource;
  appliedAt: string;
  updatedAt: string;
  notes?: string;
  rating?: number;
}