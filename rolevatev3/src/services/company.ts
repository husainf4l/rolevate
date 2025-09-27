import { API_CONFIG } from '@/lib/config';

export interface CompanyProfile {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  founded?: string;
  numberOfEmployees?: number;
  size?: string;
  headquarters: string;
  website?: string;
  description: string;
  mission?: string;
  values?: string[];
  benefits?: string[];
  stats?: Array<{
    label: string;
    value: string;
  }>;
  subscription?: {
    plan: string;
    renewal: string;
    status: string;
    features: string[];
  };
  users?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  }>;
  address?: {
    street: string;
    city: string;
    country: string;
  };
  phone?: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  logo?: string;
  industry?: string;
  founded?: string;
  numberOfEmployees?: number;
  size?: string;
  website?: string;
  description?: string;
  mission?: string;
  values?: string[];
  benefits?: string[];
  address?: {
    street: string;
    city: string;
    country: string;
  };
  phone?: string;
}

export class CompanyService {
  private static baseUrl = API_CONFIG.API_BASE_URL;

  /**
   * Get current company profile
   */
  static async getCompanyProfile(): Promise<CompanyProfile> {
    const response = await fetch(`${this.baseUrl}/company/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch company profile' }));
      throw new Error(error.message || 'Failed to fetch company profile');
    }

    const data = await response.json();
    return data as CompanyProfile;
  }

  /**
   * Update company profile
   */
  static async updateCompanyProfile(updates: UpdateCompanyRequest): Promise<CompanyProfile> {
    const response = await fetch(`${this.baseUrl}/company/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update company profile' }));
      throw new Error(error.message || 'Failed to update company profile');
    }

    const data = await response.json();
    return data as CompanyProfile;
  }

  /**
   * Upload company logo
   */
  static async uploadLogo(file: File): Promise<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await fetch(`${this.baseUrl}/company/upload-logo`, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to upload logo' }));
      throw new Error(error.message || 'Failed to upload logo');
    }

    const data = await response.json();
    return { logoUrl: data.logoUrl || data.url };
  }

  /**
   * Get company team members
   */
  static async getTeamMembers(): Promise<CompanyProfile['users']> {
    const response = await fetch(`${this.baseUrl}/company/team`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch team members' }));
      throw new Error(error.message || 'Failed to fetch team members');
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get company subscription details
   */
  static async getSubscription(): Promise<CompanyProfile['subscription']> {
    const response = await fetch(`${this.baseUrl}/company/subscription`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch subscription details' }));
      throw new Error(error.message || 'Failed to fetch subscription details');
    }

    const data = await response.json();
    return data;
  }
}