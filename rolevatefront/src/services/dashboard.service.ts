// Dashboard API Service
import { getMyCompanyJobs, getJobStats, JobStats } from './jobs.service';
import { getMyCompanyApplications, getApplicationStats } from './applications.service';
import { getCandidateStats } from './candidates.service';
import { getMyNotifications } from './notifications.service';

const API_BASE_URL = 'https://rolevate.com/api';

// Auth token helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Dashboard Data Interfaces
export interface DashboardStats {
  jobs: JobStats;
  applications: {
    total: number;
    byStatus: { [key: string]: number };
    recentCount: number;
  };
  candidates: {
    total: number;
    byAvailability: { [key: string]: number };
    byLocation: { [key: string]: number };
    recentCount: number;
  };
  notifications: {
    unreadCount: number;
    recentCount: number;
  };
}

export interface DashboardActivity {
  id: string;
  type: 'job_created' | 'application_received' | 'interview_scheduled' | 'candidate_hired';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface CompanyOverview {
  id: string;
  name: string;
  displayName?: string;
  industry?: string;
  description?: string;
  website?: string;
  location?: string;
  size?: string;
  logo?: string;
  subscription: {
    plan: string;
    isActive: boolean;
    expiresAt?: string;
    limits: {
      jobPosts: number;
      applications: number;
      users: number;
      cvAnalysis: number;
    };
    usage: {
      jobPosts: number;
      applications: number;
      users: number;
      cvAnalysis: number;
    };
  };
  team: {
    totalUsers: number;
    byRole: { [key: string]: number };
  };
}

export interface DashboardData {
  stats: DashboardStats;
  company: CompanyOverview;
  recentActivities: DashboardActivity[];
  recentJobs: any[];
  recentApplications: any[];
  notifications: any[];
}

// API Functions

// Get company overview with subscription details
export const getCompanyOverview = async (): Promise<CompanyOverview> => {
  try {
    // Get company details
    const companyResponse = await fetch(`${API_BASE_URL}/companies/my-company`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!companyResponse.ok) {
      throw new Error('Failed to fetch company details');
    }

    const company = await companyResponse.json();

    // Get company stats
    const statsResponse = await fetch(`${API_BASE_URL}/companies/my-company/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    let stats = {};
    if (statsResponse.ok) {
      stats = await statsResponse.json();
    }

    // Get team users
    const usersResponse = await fetch(`${API_BASE_URL}/companies/my-company/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    let users = [];
    if (usersResponse.ok) {
      users = await usersResponse.json();
    }

    // Get subscription info
    const subscriptionResponse = await fetch(`${API_BASE_URL}/auth/subscription/status`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    let subscription: CompanyOverview['subscription'] = {
      plan: 'FREE',
      isActive: false,
      expiresAt: undefined,
      limits: { jobPosts: 0, applications: 0, users: 0, cvAnalysis: 0 },
      usage: { jobPosts: 0, applications: 0, users: 0, cvAnalysis: 0 },
    };

    if (subscriptionResponse.ok) {
      const subData = await subscriptionResponse.json();
      
      // Get subscription limits
      const limitsResponse = await fetch(`${API_BASE_URL}/auth/subscription/limits`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (limitsResponse.ok) {
        const limitsData = await limitsResponse.json();
        subscription = {
          plan: subData.subscription?.plan || 'FREE',
          isActive: subData.isActive,
          expiresAt: subData.subscription?.expiresAt,
          limits: limitsData.limits || subscription.limits,
          usage: limitsData.usage || subscription.usage,
        };
      }
    }

    // Calculate team stats
    const teamStats = {
      totalUsers: users.length,
      byRole: users.reduce((acc: any, user: any) => {
        const role = user.role || 'UNKNOWN';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {}),
    };

    return {
      id: company.id,
      name: company.name,
      displayName: company.displayName,
      industry: company.industry,
      description: company.description,
      website: company.website,
      location: company.location,
      size: company.size,
      logo: company.logo,
      subscription,
      team: teamStats,
    };
  } catch (error) {
    console.error('Error fetching company overview:', error);
    throw error;
  }
};

// Get comprehensive dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const [jobStats, applicationStats, candidateStats, notificationStats] = await Promise.allSettled([
      getJobStats(),
      getApplicationStats(),
      getCandidateStats(),
      getMyNotifications({ isRead: false, limit: 1 }).then(data => ({
        unreadCount: data.notifications.length,
        recentCount: data.notifications.filter(n => {
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          return new Date(n.createdAt) >= threeDaysAgo;
        }).length,
      })),
    ]);

    return {
      jobs: jobStats.status === 'fulfilled' ? jobStats.value : {
        totalJobs: 0,
        activeJobs: 0,
        featuredJobs: 0,
        totalApplications: 0,
        recentJobs: 0,
        distribution: { byExperience: [], byWorkType: [] },
      },
      applications: applicationStats.status === 'fulfilled' ? applicationStats.value : {
        total: 0,
        byStatus: {},
        recentCount: 0,
      },
      candidates: candidateStats.status === 'fulfilled' ? candidateStats.value : {
        total: 0,
        byAvailability: {},
        byLocation: {},
        recentCount: 0,
      },
      notifications: notificationStats.status === 'fulfilled' ? notificationStats.value : {
        unreadCount: 0,
        recentCount: 0,
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Get recent activities (mock for now - would need activity log API)
export const getRecentActivities = async (limit: number = 10): Promise<DashboardActivity[]> => {
  try {
    // Get recent jobs, applications, etc. to create activity feed
    const [recentJobs, recentApplications] = await Promise.allSettled([
      getMyCompanyJobs({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
      getMyCompanyApplications({ limit: 5, sortBy: 'appliedAt', sortOrder: 'desc' }),
    ]);

    const activities: DashboardActivity[] = [];

    // Add job creation activities
    if (recentJobs.status === 'fulfilled') {
      recentJobs.value.jobs.forEach(job => {
        activities.push({
          id: `job-${job.id}`,
          type: 'job_created',
          title: 'New Job Posted',
          description: `${job.title} was posted`,
          timestamp: job.createdAt,
          metadata: { jobId: job.id, jobTitle: job.title },
        });
      });
    }

    // Add application activities
    if (recentApplications.status === 'fulfilled') {
      recentApplications.value.applications.forEach(app => {
        activities.push({
          id: `app-${app.id}`,
          type: 'application_received',
          title: 'New Application',
          description: `Application received for ${app.jobPost.title}`,
          timestamp: app.appliedAt,
          metadata: { 
            applicationId: app.id, 
            jobTitle: app.jobPost.title,
            candidateName: app.candidate.fullName || app.candidate.phoneNumber,
          },
        });
      });
    }

    // Sort activities by timestamp and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
};

// Get complete dashboard data
export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const [stats, company, activities, recentJobs, recentApplications, notifications] = await Promise.allSettled([
      getDashboardStats(),
      getCompanyOverview(),
      getRecentActivities(10),
      getMyCompanyJobs({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
      getMyCompanyApplications({ limit: 5, sortBy: 'appliedAt', sortOrder: 'desc' }),
      getMyNotifications({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
    ]);

    return {
      stats: stats.status === 'fulfilled' ? stats.value : {
        jobs: { totalJobs: 0, activeJobs: 0, featuredJobs: 0, totalApplications: 0, recentJobs: 0, distribution: { byExperience: [], byWorkType: [] } },
        applications: { total: 0, byStatus: {}, recentCount: 0 },
        candidates: { total: 0, byAvailability: {}, byLocation: {}, recentCount: 0 },
        notifications: { unreadCount: 0, recentCount: 0 },
      },
      company: company.status === 'fulfilled' ? company.value : {
        id: '',
        name: 'Loading...',
        subscription: { plan: 'FREE', isActive: false, limits: { jobPosts: 0, applications: 0, users: 0, cvAnalysis: 0 }, usage: { jobPosts: 0, applications: 0, users: 0, cvAnalysis: 0 } },
        team: { totalUsers: 0, byRole: {} },
      },
      recentActivities: activities.status === 'fulfilled' ? activities.value : [],
      recentJobs: recentJobs.status === 'fulfilled' ? recentJobs.value.jobs : [],
      recentApplications: recentApplications.status === 'fulfilled' ? recentApplications.value.applications : [],
      notifications: notifications.status === 'fulfilled' ? notifications.value.notifications : [],
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// Dashboard action functions
export const refreshDashboard = async (): Promise<DashboardData> => {
  return getDashboardData();
};

export const getQuickStats = async (): Promise<{
  totalJobs: number;
  activeApplications: number;
  unreadNotifications: number;
  teamMembers: number;
}> => {
  try {
    const dashboardData = await getDashboardData();
    
    return {
      totalJobs: dashboardData.stats.jobs.totalJobs,
      activeApplications: dashboardData.stats.applications.total,
      unreadNotifications: dashboardData.stats.notifications.unreadCount,
      teamMembers: dashboardData.company.team.totalUsers,
    };
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    return {
      totalJobs: 0,
      activeApplications: 0,
      unreadNotifications: 0,
      teamMembers: 0,
    };
  }
};
