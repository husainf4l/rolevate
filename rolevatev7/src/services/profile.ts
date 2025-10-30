// Profile service
import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

export interface WorkExperience {
  id?: string;
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  description?: string;
  isCurrent?: boolean;
}

export interface Education {
  id?: string;
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
}

export interface CandidateProfile {
  id: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  availability?: string;
  salaryExpectation?: string;
  preferredWorkType?: string;
  workExperiences?: WorkExperience[];
  educations?: Education[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  availability?: string;
  salaryExpectation?: string;
  preferredWorkType?: string;
}

class ProfileService {
  // GraphQL Queries
  private GET_MY_PROFILE_QUERY = gql`
    query GetMyProfile {
      me {
        id
        email
        name
      }
    }
  `;

  private GET_CANDIDATE_PROFILE_QUERY = gql`
    query GetCandidateProfile($userId: ID!) {
      candidateProfileByUser(userId: $userId) {
        id
        user {
          id
          email
          name
        }
        name
        phone
        location
        bio
        skills
        experience
        education
        linkedinUrl
        githubUrl
        portfolioUrl
        resumeUrl
        availability
        salaryExpectation
        preferredWorkType
        workExperiences {
          id
          company
          position
          description
          isCurrent
        }
        educations {
          id
          degree
          institution
          fieldOfStudy
          grade
        }
      }
    }
  `;

  // GraphQL Mutations
  private UPDATE_PROFILE_MUTATION = gql`
    mutation UpdateCandidateProfile($userId: ID!, $input: UpdateCandidateProfileInput!) {
      updateCandidateProfile(userId: $userId, input: $input) {
        id
        user {
          id
          email
          name
        }
        name
        phone
        location
        bio
        skills
        experience
        education
        linkedinUrl
        githubUrl
        portfolioUrl
        resumeUrl
        availability
        salaryExpectation
        preferredWorkType
      }
    }
  `;

  /**
   * Get current user's candidate profile
   * This uses a workaround by first getting the user ID from 'me' query,
   * then fetching the candidate profile, and merging with user data
   */
  async getProfile(): Promise<CandidateProfile | null> {
    try {
      // First get the current user to get their ID and basic info
      const { data: userData } = await apolloClient.query<{ me: { id: string; email: string; name: string } }>({
        query: this.GET_MY_PROFILE_QUERY,
        fetchPolicy: 'network-only'
      });

      if (!userData?.me?.id) {
        throw new Error('User not authenticated');
      }

      // Then fetch the candidate profile using the user ID
      const { data: profileData } = await apolloClient.query<{ candidateProfileByUser: CandidateProfile }>({
        query: this.GET_CANDIDATE_PROFILE_QUERY,
        variables: { userId: userData.me.id },
        fetchPolicy: 'network-only'
      });

      const candidateProfile = profileData?.candidateProfileByUser;

      // If candidate profile exists, merge with user data
      if (candidateProfile) {
        return {
          ...candidateProfile,
          user: userData.me,
          name: candidateProfile.name || userData.me.name, // Use profile name or fallback to user name
          email: userData.me.email
        };
      }

      // If candidate profile doesn't exist yet, return user data as fallback
      return {
        id: userData.me.id,
        user: userData.me,
        name: userData.me.name,
        email: userData.me.email
      };
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      throw new Error(error?.message || 'Failed to fetch profile');
    }
  }

  /**
   * Update current user's candidate profile
   */
  async updateProfile(input: UpdateProfileInput): Promise<CandidateProfile> {
    try {
      // First get the current user ID
      const { data: userData } = await apolloClient.query<{ me: { id: string } }>({
        query: this.GET_MY_PROFILE_QUERY,
        fetchPolicy: 'network-only'
      });

      if (!userData?.me?.id) {
        throw new Error('User not authenticated');
      }

      // Update the profile
      const { data } = await apolloClient.mutate<{ updateCandidateProfile: CandidateProfile }>({
        mutation: this.UPDATE_PROFILE_MUTATION,
        variables: {
          userId: userData.me.id,
          input
        },
        refetchQueries: ['GetCandidateProfile']
      });

      if (!data?.updateCandidateProfile) {
        throw new Error('Failed to update profile');
      }

      return data.updateCandidateProfile;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw new Error(error?.message || 'Failed to update profile');
    }
  }

  /**
   * Get candidate profile by user ID (for compatibility)
   */
  async getProfileByUserId(userId: string): Promise<CandidateProfile | null> {
    try {
      const { data } = await apolloClient.query<{ candidateProfileByUser: CandidateProfile }>({
        query: this.GET_CANDIDATE_PROFILE_QUERY,
        variables: { userId },
        fetchPolicy: 'network-only'
      });

      return data?.candidateProfileByUser || null;
    } catch (error: any) {
      console.error('Error fetching profile by user ID:', error);
      throw new Error(error?.message || 'Failed to fetch profile');
    }
  }
}

export const profileService = new ProfileService();

// Export static methods for backward compatibility
export const getProfile = () => profileService.getProfile();
export const updateProfile = (input: UpdateProfileInput) => profileService.updateProfile(input);
export const getProfileByUserId = (userId: string) => profileService.getProfileByUserId(userId);
