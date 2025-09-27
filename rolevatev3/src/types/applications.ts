import { LucideIcon } from 'lucide-react';

export enum ApplicationStatus {
  UNDER_REVIEW = 'under_review',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEW_COMPLETED = 'interview_completed',
  OFFER_RECEIVED = 'offer_received',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_DECLINED = 'offer_declined',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  ARCHIVED = 'archived',
}

export interface Application {
  id: number;
  jobId: number;
  candidateId: string;
  jobTitle: string;
  company: string;
  companyId?: string;
  location: string;
  appliedDate: string;
  status: ApplicationStatus;
  statusText: string;
  statusColor: string;
  statusIcon: LucideIcon;
  nextStep?: string;
  lastUpdate: string;
  notes?: string;
  resumeUrl?: string;
  coverLetter?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStats {
  totalApplications: number;
  underReview: number;
  interviews: number;
  offers: number;
  accepted: number;
  rejected: number;
  successRate: number;
}

export interface ApplicationFilters {
  status?: ApplicationStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  company?: string;
  location?: string;
}

export interface ApplicationResponse {
  success: boolean;
  message?: string;
  application?: Application;
  applications?: Application[];
  stats?: ApplicationStats;
}

export interface CreateApplicationRequest {
  jobId: number;
  resumeUrl?: string;
  coverLetter?: string;
  notes?: string;
}

export interface UpdateApplicationRequest {
  status?: ApplicationStatus;
  notes?: string;
  nextStep?: string;
}

export interface ApplicationStatusConfig {
  status: ApplicationStatus;
  label: {
    en: string;
    ar: string;
  };
  color: string;
  icon: LucideIcon;
  description?: {
    en: string;
    ar: string;
  };
}