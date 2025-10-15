// Dashboard service for fetching dashboard statistics and data

export interface DashboardEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "interview" | "deadline" | "meeting";
  jobId?: string;
  applicationId?: string;
}

export interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  candidatesHired: number;
  hireSuccessRate: number;
  recentApplications: number;
  pendingReviews: number;
}

export class DashboardService {
  private static baseUrl = 'http://localhost:4005'; // Backend URL

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${this.baseUrl}/api/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard statistics');
    }

    return response.json();
  }

  /**
   * Get upcoming events/schedule for dashboard
   */
  static async getUpcomingEvents(): Promise<DashboardEvent[]> {
    const response = await fetch(`${this.baseUrl}/api/dashboard/events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard events');
    }

    return response.json();
  }
}
