// Configuration service for company setup
import { graphQLService } from './graphql.service';

export interface CompanyData {
  name: string;
  description?: string;
  industry?: string;
  size?: string;
  website?: string;
  email?: string;
  country?: string;
  city?: string;
  street?: string;
  phone?: string;
  location?: string;
}

export class ConfigurationService {
  private CREATE_COMPANY_MUTATION = `
    mutation CreateCompany($input: CreateCompanyInput!) {
      createCompany(input: $input) {
        id
        name
        description
        industry
        website
        email
        phone
        address {
          street
          city
          country
        }
        createdAt
        updatedAt
      }
    }
  `;

  private JOIN_COMPANY_MUTATION = `
    mutation JoinCompany($invitationCode: String!) {
      joinCompany(invitationCode: $invitationCode) {
        id
        name
        userType
        company {
          id
          name
        }
      }
    }
  `;

  private GENERATE_DESCRIPTION_MUTATION = `
    mutation GenerateCompanyDescription($input: GenerateDescriptionInput!) {
      generateCompanyDescription(input: $input) {
        generatedDescription
      }
    }
  `;

  async createCompany(data: CompanyData): Promise<any> {
    console.log('[ConfigurationService] Creating company with data:', data);
    
    try {
      const input = {
        name: data.name,
        description: data.description,
        industry: data.industry,
        size: data.size,
        website: data.website,
        email: data.email,
        country: data.country,
        city: data.city,
        street: data.street,
        phone: data.phone,
      };
      
      console.log('[ConfigurationService] GraphQL input:', input);
      
      const response = await graphQLService.request<{ createCompany: any }>(
        this.CREATE_COMPANY_MUTATION,
        { input }
      );
      
      console.log('[ConfigurationService] Response:', response);
      return response.createCompany;
    } catch (error) {
      console.error('[ConfigurationService] Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create company');
    }
  }

  async joinCompany(data: { invitationCode: string }): Promise<any> {
    try {
      const response = await graphQLService.request<{ joinCompany: any }>(
        this.JOIN_COMPANY_MUTATION,
        { invitationCode: data.invitationCode }
      );
      return response.joinCompany;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to join company');
    }
  }

  async generateCompanyDescription(data: {
    industry?: string;
    location?: string;
    country?: string;
    numberOfEmployees?: number;
    currentDescription?: string;
    website?: string;
  }): Promise<{ generatedDescription: string }> {
    try {
      const input = {
        industry: data.industry,
        location: data.location,
        country: data.country,
        numberOfEmployees: data.numberOfEmployees,
        currentDescription: data.currentDescription,
        website: data.website,
      };
      const response = await graphQLService.request<{ generateCompanyDescription: { generatedDescription: string } }>(
        this.GENERATE_DESCRIPTION_MUTATION,
        { input }
      );
      return response.generateCompanyDescription;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to generate description');
    }
  }

  async getCompanyById(id: string): Promise<any> {
    // TODO: Implement getting company details
    console.log('Getting company:', id);
    return { id, name: 'Sample Company' };
  }
}

export const configurationService = new ConfigurationService();
