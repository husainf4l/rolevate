import { API_CONFIG } from '@/lib/config';

export interface CompanyData {
  name: string;
  industry: string;
  size: string;
  website: string;
  description: string;
  country: string;
  city: string;
  street: string;
  phone: string;
}

export interface CreateCompanyRequest extends CompanyData {}

export interface JoinCompanyRequest {
  invitationCode: string;
}

export interface GenerateDescriptionRequest {
  industry: string;
  location: string;
  country: string;
  numberOfEmployees: number;
  currentDescription: string;
  website?: string;
}

export interface GenerateDescriptionResponse {
  generatedDescription: string;
}

export class ConfigurationService {
  private static baseUrl = API_CONFIG.API_BASE_URL;

  /**
   * Create a new company
   */
  static async createCompany(companyData: CreateCompanyRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/company/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create company' }));
      throw new Error(error.message || 'Failed to create company');
    }

    return response.json();
  }

  /**
   * Join an existing company using invitation code
   */
  static async joinCompany(joinData: JoinCompanyRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/companies/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(joinData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to join company' }));
      throw new Error(error.message || 'Failed to join company');
    }

    return response.json();
  }

  /**
   * Generate AI company description
   */
  static async generateCompanyDescription(
    descriptionData: GenerateDescriptionRequest
  ): Promise<GenerateDescriptionResponse> {
    const response = await fetch(`${this.baseUrl}/aiautocomplete/companydescription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(descriptionData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to generate description' }));
      throw new Error(error.message || 'Failed to generate description');
    }

    return response.json();
  }
}
