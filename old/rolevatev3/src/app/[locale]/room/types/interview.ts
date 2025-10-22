export interface JobInfo {
  title?: string;
  description?: string;
  location?: string;
  experience?: string;
}

export interface CompanyInfo {
  name?: string;
  logo?: string;
}

export interface InterviewData {
  jobInfo?: JobInfo;
  companyInfo?: CompanyInfo;
  participantName?: string;
}