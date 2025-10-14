import { API_CONFIG } from '@/lib/config';

// Profile interfaces
export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  currentlyWorking: boolean;
  description: string;
  candidateProfileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: string;
  degree: string;
  fieldOfStudy: string;
  university: string;
  location: string;
  startDate: string;
  endDate: string | null;
  currentlyStudying: boolean;
  grade: string | null;
  description: string | null;
  candidateProfileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CV {
  id: string;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: "UPLOADED" | "PROCESSING" | "PROCESSED" | "FAILED";
  isActive: boolean;
  candidateId: string;
  uploadedAt: string;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedJob {
  id: string;
  candidateId: string;
  jobId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateProfile {
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
  totalExperience: number | null;
  expectedSalary: string | null;
  noticePeriod: string | null;
  highestEducation: string | null;
  fieldOfStudy: string | null;
  university: string | null;
  graduationYear: number | null;
  skills: string[];
  preferredJobTypes: string[];
  preferredWorkType: string | null;
  preferredIndustries: string[];
  preferredLocations: string[];
  savedJobs: SavedJob[] | string[];
  resumeUrl: string | null;
  portfolioUrl: string | null;
  linkedInUrl: string | null;
  githubUrl: string | null;
  isProfilePublic: boolean;
  isOpenToWork: boolean;
  profileSummary: string | null;
  userId: string;
  cvs: CV[];
  applications: any[];
  workExperiences: WorkExperience[];
  educationHistory: Education[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  userType: "COMPANY" | "CANDIDATE";
  phone: string | null;
  avatar: string | null;
  candidateProfile: CandidateProfile | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  currentLocation?: string;
  currentJobTitle?: string;
  currentCompany?: string;
  experienceLevel?: string;
  totalExperience?: number;
  expectedSalary?: string;
  noticePeriod?: string;
  highestEducation?: string;
  fieldOfStudy?: string;
  university?: string;
  graduationYear?: number;
  skills?: string[];
  preferredJobTypes?: string[];
  preferredWorkType?: string;
  preferredIndustries?: string[];
  preferredLocations?: string[];
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  isProfilePublic?: boolean;
  isOpenToWork?: boolean;
  profileSummary?: string;
}

export interface CreateWorkExperienceData {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string | null;
  currentlyWorking: boolean;
  description: string;
}

export interface UpdateWorkExperienceData extends Partial<CreateWorkExperienceData> {}

export interface CreateEducationData {
  degree: string;
  fieldOfStudy: string;
  university: string;
  location: string;
  startDate: string;
  endDate?: string | null;
  currentlyStudying: boolean;
  grade?: string | null;
  description?: string | null;
}

export interface UpdateEducationData extends Partial<CreateEducationData> {}

export class ProfileService {
  private static baseUrl = API_CONFIG.API_BASE_URL;

  /**
   * Get the current user's profile
   * Returns the candidate profile directly (not wrapped in user object)
   */
  static async getUserProfile(): Promise<CandidateProfile> {
    const response = await fetch(`${this.baseUrl}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch user profile' }));
      throw new Error(error.message || 'Failed to fetch user profile');
    }

    return response.json();
  }

  /**
   * Update the current user's candidate profile
   */
  static async updateProfile(data: UpdateProfileData): Promise<CandidateProfile> {
    const response = await fetch(`${this.baseUrl}/user/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update profile' }));
      throw new Error(error.message || 'Failed to update profile');
    }

    return response.json();
  }

  /**
   * Update user avatar
   */
  static async updateAvatar(file: File): Promise<{ avatar: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${this.baseUrl}/user/profile/avatar`, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to upload avatar' }));
      throw new Error(error.message || 'Failed to upload avatar');
    }

    return response.json();
  }

  /**
   * Delete user avatar
   */
  static async deleteAvatar(): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/user/profile/avatar`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete avatar' }));
      throw new Error(error.message || 'Failed to delete avatar');
    }

    return response.json();
  }

  /**
   * Create a new work experience entry
   */
  static async createWorkExperience(data: CreateWorkExperienceData): Promise<WorkExperience> {
    const response = await fetch(`${this.baseUrl}/user/profile/work-experience`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create work experience' }));
      throw new Error(error.message || 'Failed to create work experience');
    }

    return response.json();
  }

  /**
   * Update a work experience entry
   */
  static async updateWorkExperience(
    experienceId: string,
    data: UpdateWorkExperienceData
  ): Promise<WorkExperience> {
    const response = await fetch(`${this.baseUrl}/user/profile/work-experience/${experienceId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update work experience' }));
      throw new Error(error.message || 'Failed to update work experience');
    }

    return response.json();
  }

  /**
   * Delete a work experience entry
   */
  static async deleteWorkExperience(experienceId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/user/profile/work-experience/${experienceId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete work experience' }));
      throw new Error(error.message || 'Failed to delete work experience');
    }

    return response.json();
  }

  /**
   * Create a new education entry
   */
  static async createEducation(data: CreateEducationData): Promise<Education> {
    const response = await fetch(`${this.baseUrl}/user/profile/education`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create education' }));
      throw new Error(error.message || 'Failed to create education');
    }

    return response.json();
  }

  /**
   * Update an education entry
   */
  static async updateEducation(
    educationId: string,
    data: UpdateEducationData
  ): Promise<Education> {
    const response = await fetch(`${this.baseUrl}/user/profile/education/${educationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update education' }));
      throw new Error(error.message || 'Failed to update education');
    }

    return response.json();
  }

  /**
   * Delete an education entry
   */
  static async deleteEducation(educationId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/user/profile/education/${educationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete education' }));
      throw new Error(error.message || 'Failed to delete education');
    }

    return response.json();
  }

  /**
   * Upload resume/CV
   */
  static async uploadResume(file: File): Promise<{ resumeUrl: string }> {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(`${this.baseUrl}/user/profile/resume`, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to upload resume' }));
      throw new Error(error.message || 'Failed to upload resume');
    }

    return response.json();
  }

  /**
   * Delete resume/CV
   */
  static async deleteResume(): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/user/profile/resume`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete resume' }));
      throw new Error(error.message || 'Failed to delete resume');
    }

    return response.json();
  }
}
