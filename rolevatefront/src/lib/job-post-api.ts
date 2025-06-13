export interface JobData {
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  skills: string[];
  experienceLevel: string;
  location: string;
  workType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  department: string;
  enableAiInterview: boolean;
  isFeatured: boolean;
}

export interface SessionInfo {
  session_id: string;
  company_id: string;
  company_name: string;
  created_at: string;
  last_updated: string;
  current_step: string;
  is_complete: boolean;
  conversation_turns: number;
  job_data: JobData;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  error?: string;
  session_id?: string;
  agent_response?: string;
  is_complete?: boolean;
  job_data?: JobData;
  current_step?: string;
  data?: T;
}

export class JobPostAPI {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  private async makeRequest(endpoint: string, data: Record<string, any>): Promise<Response> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: formData,
    });

    return response;
  }

  /**
   * Create a new job post conversation or resume an existing one
   */
  async createJobPost(params: {
    message: string;
    companyId: string;
    companyName?: string;
    sessionId?: string;
  }): Promise<ApiResponse> {
    const response = await this.makeRequest('/create-job-post', {
      message: params.message,
      company_id: params.companyId,
      company_name: params.companyName,
      session_id: params.sessionId,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Continue an existing job post conversation
   */
  async continueChat(params: {
    message: string;
    sessionId: string;
    companyId?: string;
    companyName?: string;
  }): Promise<ApiResponse> {
    const response = await this.makeRequest('/job-post-chat', {
      message: params.message,
      session_id: params.sessionId,
      company_id: params.companyId,
      company_name: params.companyName,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get information about a session
   */
  async getSessionInfo(sessionId: string): Promise<SessionInfo> {
    const response = await fetch(`${this.baseUrl}/job-post-session/${sessionId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Session not found or expired');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/job-post-session/${sessionId}`, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Health check for the API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export a default instance
export const jobPostAPI = new JobPostAPI();

// Custom hook for React components
export function useJobPostAPI(baseUrl?: string) {
  const api = baseUrl ? new JobPostAPI(baseUrl) : jobPostAPI;
  
  return {
    api,
    createJobPost: api.createJobPost.bind(api),
    continueChat: api.continueChat.bind(api),
    getSessionInfo: api.getSessionInfo.bind(api),
    deleteSession: api.deleteSession.bind(api),
    healthCheck: api.healthCheck.bind(api),
  };
}
