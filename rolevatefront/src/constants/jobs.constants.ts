// Experience Levels
export const EXPERIENCE_LEVELS = {
  ENTRY_LEVEL: 'Entry Level',
  JUNIOR: 'Junior',
  MID_LEVEL: 'Mid Level',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  PRINCIPAL: 'Principal',
  EXECUTIVE: 'Executive',
} as const;

// Work Types
export const WORK_TYPES = {
  ONSITE: 'On-site',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
} as const;

// Application Status
export const APPLICATION_STATUS = {
  PENDING: 'Pending',
  CV_SCREENING: 'CV Screening',
  CV_APPROVED: 'CV Approved',
  CV_REJECTED: 'CV Rejected',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  INTERVIEW_IN_PROGRESS: 'Interview In Progress',
  INTERVIEW_COMPLETED: 'Interview Completed',
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  FINAL_INTERVIEW: 'Final Interview',
  OFFER_EXTENDED: 'Offer Extended',
  OFFER_ACCEPTED: 'Offer Accepted',
  OFFER_DECLINED: 'Offer Declined',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
  ON_HOLD: 'On Hold',
} as const;

export type ExperienceLevel = keyof typeof EXPERIENCE_LEVELS;
export type WorkType = keyof typeof WORK_TYPES;
export type ApplicationStatusType = keyof typeof APPLICATION_STATUS;
