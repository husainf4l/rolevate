"use client";

import { createContext, useContext } from "react";

interface CandidateProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  nationality: string | null;
  currentLocation: string | null;
  currentJobTitle: string | null;
  currentCompany: string | null;
  experienceLevel: string | null;
  totalExperience: string | null;
  expectedSalary: string | null;
  noticePeriod: string | null;
  highestEducation: string | null;
  fieldOfStudy: string | null;
  university: string | null;
  graduationYear: string | null;
  skills: string[];
  preferredJobTypes: string[];
  preferredWorkType: string | null;
  preferredIndustries: string[];
  preferredLocations: string[];
  resumeUrl: string | null;
  portfolioUrl: string | null;
  linkedInUrl: string | null;
  githubUrl: string | null;
  isProfilePublic: boolean;
  isOpenToWork: boolean;
  profileSummary: string | null;
  userId: string;
  cvs: any[];
  applications: any[];
  workExperiences: any[];
  educationHistory: any[];
  savedJobs: any[]; // Add saved jobs to candidate profile
  createdAt: string;
  updatedAt: string;
}

interface Company {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  logo?: string;
  industry?: string;
  numberOfEmployees?: number;
  subscription?: string;
  address?: {
    id: string;
    street: string;
    city: string;
    country: string;
    companyId: string;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
  userType: "BUSINESS" | "CANDIDATE";
  phone?: string;
  avatar?: string;
  company?: Company;
  companyId?: string;
  candidateProfile?: CandidateProfile;
  createdAt?: string;
  updatedAt?: string;
  hasActiveSubscription?: boolean;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthContext };
export type { User, AuthContextType };
