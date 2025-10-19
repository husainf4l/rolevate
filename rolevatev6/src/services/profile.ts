// Profile service
import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

export interface WorkExperience {
  id?: string;
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  isCurrentRole?: boolean;
}

export interface Education {
  id?: string;
  degree: string;
  university: string;
  fieldOfStudy?: string;
  startDate?: string;
  graduationYear: string;
  grade?: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  currentJobTitle?: string;
  currentLocation?: string;
  profileSummary?: string;
  skills?: string[];
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  yearsOfExperience?: number;
  expectedSalary?: string;
  workExperiences?: WorkExperience[];
  educationHistory?: Education[];
  languages?: string[];
  certifications?: string[];
  availability?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  currentJobTitle?: string;
  currentLocation?: string;
  profileSummary?: string;
  skills?: string[];
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  yearsOfExperience?: number;
  expectedSalary?: string;
  languages?: string[];
  certifications?: string[];
  availability?: string;
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
        userId
        firstName
        lastName
        email
        phone
        currentJobTitle
        currentLocation
        profileSummary
        skills
        linkedInUrl
        githubUrl
        portfolioUrl
        yearsOfExperience
        expectedSalary
        workExperiences {
          id
          jobTitle
          company
          location
          startDate
          endDate
          description
          isCurrentRole
        }
        educationHistory {
          id
          degree
          university
          fieldOfStudy
          startDate
          graduationYear
          grade
        }
        languages
        certifications
        availability
        createdAt
        updatedAt
      }
    }
  `;

  // GraphQL Mutations
  private UPDATE_PROFILE_MUTATION = gql`
    mutation UpdateCandidateProfile($userId: ID!, $input: UpdateCandidateProfileInput!) {
      updateCandidateProfile(userId: $userId, input: $input) {
        id
        userId
        firstName
        lastName
        email
        phone
        currentJobTitle
        currentLocation
        profileSummary
        skills
        linkedInUrl
        githubUrl
        portfolioUrl
        yearsOfExperience
        expectedSalary
        languages
        certifications
        availability
        updatedAt
      }
    }
  `;

  /**
   * Get current user's candidate profile
   * This uses a workaround by first getting the user ID from 'me' query,
   * then fetching the candidate profile
   */
  async getProfile(): Promise<CandidateProfile | null> {
    try {
      // First get the current user to get their ID
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

      return profileData?.candidateProfileByUser || null;
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
