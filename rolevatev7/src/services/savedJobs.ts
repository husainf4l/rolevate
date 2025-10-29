// Saved jobs service
import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  savedAt: string;
  job: {
    id: string;
    slug: string;
    title: string;
    department?: string;
    location: string;
    salary?: string;
    type: string;
    deadline?: string;
    description?: string;
    shortDescription?: string;
    skills?: string[];
    jobLevel?: string;
    workType?: string;
    status?: string;
    company?: {
      id: string;
      name: string;
      industry?: string;
    };
  };
}

export interface SaveJobResponse {
  id: string;
  userId: string;
  jobId: string;
  savedAt: string;
  job: {
    id: string;
    title: string;
    location: string;
    department?: string;
  };
}

class SavedJobsService {
  // GraphQL Queries
  private GET_MY_SAVED_JOBS_QUERY = gql`
    query GetMySavedJobs {
      savedJobs {
        id
        userId
        jobId
        savedAt
        job {
          id
          slug
          title
          department
          location
          salary
          type
          deadline
          description
          shortDescription
          skills
          jobLevel
          workType
          status
          company {
            id
            name
            industry
          }
        }
      }
    }
  `;

  private IS_JOB_SAVED_QUERY = gql`
    query IsJobSaved($jobId: ID!) {
      isJobSaved(jobId: $jobId)
    }
  `;

  private GET_SAVED_JOBS_COUNT_QUERY = gql`
    query GetSavedJobsCount {
      savedJobsCount
    }
  `;

  // GraphQL Mutations
  private SAVE_JOB_MUTATION = gql`
    mutation SaveJob($jobId: ID!) {
      saveJob(jobId: $jobId) {
        id
        userId
        jobId
        savedAt
        job {
          id
          title
          location
          department
        }
      }
    }
  `;

  private UNSAVE_JOB_MUTATION = gql`
    mutation UnsaveJob($jobId: ID!) {
      unsaveJob(jobId: $jobId)
    }
  `;

  /**
   * Get all saved jobs for the current user
   */
  async getMySavedJobs(): Promise<SavedJob[]> {
    try {
      const { data } = await apolloClient.query<{ savedJobs: SavedJob[] }>({
        query: this.GET_MY_SAVED_JOBS_QUERY,
        fetchPolicy: 'network-only'
      });
      return data?.savedJobs || [];
    } catch (error: any) {
      console.error('Error fetching saved jobs:', error);
      throw new Error(error?.message || 'Failed to fetch saved jobs');
    }
  }

  /**
   * Check if a specific job is saved
   */
  async isJobSaved(jobId: string): Promise<boolean> {
    try {
      const { data } = await apolloClient.query<{ isJobSaved: boolean }>({
        query: this.IS_JOB_SAVED_QUERY,
        variables: { jobId },
        fetchPolicy: 'network-only'
      });
      return data?.isJobSaved || false;
    } catch (error: any) {
      console.error('Error checking if job is saved:', error);
      return false;
    }
  }

  /**
   * Get count of saved jobs
   */
  async getSavedJobsCount(): Promise<number> {
    try {
      const { data } = await apolloClient.query<{ savedJobsCount: number }>({
        query: this.GET_SAVED_JOBS_COUNT_QUERY,
        fetchPolicy: 'network-only'
      });
      return data?.savedJobsCount || 0;
    } catch (error: any) {
      console.error('Error fetching saved jobs count:', error);
      return 0;
    }
  }

  /**
   * Save a job
   */
  async saveJob(jobId: string): Promise<SaveJobResponse> {
    try {
      const { data } = await apolloClient.mutate<{ saveJob: SaveJobResponse }>({
        mutation: this.SAVE_JOB_MUTATION,
        variables: { jobId },
        refetchQueries: ['GetMySavedJobs', 'GetSavedJobsCount']
      });

      if (!data?.saveJob) {
        throw new Error('Failed to save job');
      }

      return data.saveJob;
    } catch (error: any) {
      console.error('Error saving job:', error);
      throw new Error(error?.message || 'Failed to save job');
    }
  }

  /**
   * Unsave a job
   */
  async unsaveJob(jobId: string): Promise<boolean> {
    try {
      const { data } = await apolloClient.mutate<{ unsaveJob: boolean }>({
        mutation: this.UNSAVE_JOB_MUTATION,
        variables: { jobId },
        refetchQueries: ['GetMySavedJobs', 'GetSavedJobsCount']
      });
      return data?.unsaveJob || false;
    } catch (error: any) {
      console.error('Error unsaving job:', error);
      throw new Error(error?.message || 'Failed to unsave job');
    }
  }
}

export const savedJobsService = new SavedJobsService();

// Export convenience functions
export const getMySavedJobs = () => savedJobsService.getMySavedJobs();
export const isJobSaved = (jobId: string) => savedJobsService.isJobSaved(jobId);
export const getSavedJobsCount = () => savedJobsService.getSavedJobsCount();
export const saveJob = (jobId: string) => savedJobsService.saveJob(jobId);
export const unsaveJob = (jobId: string) => savedJobsService.unsaveJob(jobId);

// Backward compatibility - get saved jobs details
export const getSavedJobsDetails = async (): Promise<SavedJob[]> => {
  return savedJobsService.getMySavedJobs();
};
