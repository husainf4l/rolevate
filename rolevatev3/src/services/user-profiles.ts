import { UserData } from '@/types/auth';

export interface UserProfile extends UserData {
  // Additional profile fields
  bio?: string;
  bioAr?: string;
  phone?: string;
  location?: string;
  locationAr?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  skills: string[];
  languages: string[];
  experience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  availabilityStatus: 'AVAILABLE' | 'NOT_AVAILABLE' | 'OPEN_TO_OFFERS';
  preferredJobTypes: string[];
  preferredLocations: string[];
  salaryExpectation?: {
    min: number;
    max: number;
    currency: string;
  };
  profileCompletion: number;
  lastActive: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  companyAr?: string;
  position: string;
  positionAr?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  descriptionAr?: string;
  location?: string;
  locationAr?: string;
}

export interface Education {
  id: string;
  institution: string;
  institutionAr?: string;
  degree: string;
  degreeAr?: string;
  fieldOfStudy?: string;
  fieldOfStudyAr?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  grade?: string;
  description?: string;
  descriptionAr?: string;
}

export interface Certification {
  id: string;
  name: string;
  nameAr?: string;
  issuer: string;
  issuerAr?: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface UpdateProfileDto {
  name?: string;
  nameAr?: string;
  bio?: string;
  bioAr?: string;
  phone?: string;
  location?: string;
  locationAr?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  skills?: string[];
  languages?: string[];
  availabilityStatus?: UserProfile['availabilityStatus'];
  preferredJobTypes?: string[];
  preferredLocations?: string[];
  salaryExpectation?: UserProfile['salaryExpectation'];
}

export interface ProfileResponse {
  success: boolean;
  profile?: UserProfile;
  message?: string;
}

class UserProfilesService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005';

  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users/profile`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        // Ensure profile image URLs use the correct backend URL
        const profile = {
          ...result,
          image: result.image && !result.image.startsWith('http') 
            ? `${this.baseUrl}${result.image.startsWith('/') ? '' : '/'}${result.image}`
            : result.image
        };
        
        return {
          success: true,
          profile,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to fetch profile',
        };
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        message: 'Network error while fetching profile',
      };
    }
  }

  async updateProfile(data: UpdateProfileDto): Promise<ProfileResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          profile: result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to update profile',
        };
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        message: 'Network error while updating profile',
      };
    }
  }

  async uploadCV(file: File): Promise<{ success: boolean; cvUrl?: string; message?: string }> {
    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await fetch(`${this.baseUrl}/users/upload-cv`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          cvUrl: result.cvUrl,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to upload CV',
        };
      }
    } catch (error) {
      console.error('Error uploading CV:', error);
      return {
        success: false,
        message: 'Network error while uploading CV',
      };
    }
  }

  async uploadProfileImage(file: File): Promise<{ success: boolean; imageUrl?: string; message?: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${this.baseUrl}/users/upload-image`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          imageUrl: result.imageUrl,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to upload image',
        };
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      return {
        success: false,
        message: 'Network error while uploading image',
      };
    }
  }

  async addWorkExperience(experience: Omit<WorkExperience, 'id'>): Promise<ProfileResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users/profile/experience`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(experience),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          profile: result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to add experience',
        };
      }
    } catch (error) {
      console.error('Error adding work experience:', error);
      return {
        success: false,
        message: 'Network error while adding experience',
      };
    }
  }

  async updateWorkExperience(id: string, experience: Partial<WorkExperience>): Promise<ProfileResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users/profile/experience/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(experience),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          profile: result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to update experience',
        };
      }
    } catch (error) {
      console.error('Error updating work experience:', error);
      return {
        success: false,
        message: 'Network error while updating experience',
      };
    }
  }

  async deleteWorkExperience(id: string): Promise<ProfileResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users/profile/experience/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          profile: result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to delete experience',
        };
      }
    } catch (error) {
      console.error('Error deleting work experience:', error);
      return {
        success: false,
        message: 'Network error while deleting experience',
      };
    }
  }

  async addEducation(education: Omit<Education, 'id'>): Promise<ProfileResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users/profile/education`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(education),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          profile: result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to add education',
        };
      }
    } catch (error) {
      console.error('Error adding education:', error);
      return {
        success: false,
        message: 'Network error while adding education',
      };
    }
  }

  async updateEducation(id: string, education: Partial<Education>): Promise<ProfileResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users/profile/education/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(education),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          profile: result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to update education',
        };
      }
    } catch (error) {
      console.error('Error updating education:', error);
      return {
        success: false,
        message: 'Network error while updating education',
      };
    }
  }

  async deleteEducation(id: string): Promise<ProfileResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users/profile/education/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          profile: result,
        };
      } else {
        return {
          success: false,
          message: result.message || result.error || 'Failed to delete education',
        };
      }
    } catch (error) {
      console.error('Error deleting education:', error);
      return {
        success: false,
        message: 'Network error while deleting education',
      };
    }
  }
}

export const userProfilesService = new UserProfilesService();