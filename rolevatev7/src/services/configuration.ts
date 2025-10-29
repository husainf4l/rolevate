// Configuration service for company setup
import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

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
  private CREATE_COMPANY_MUTATION = gql`
    mutation CreateCompany($input: CreateCompanyInput!) {
      createCompany(input: $input) {
        id
        name
        description
        industry
        website
        email
        phone
        addressId
        createdAt
        updatedAt
      }
    }
  `;

  private JOIN_COMPANY_MUTATION = gql`
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

  private GENERATE_DESCRIPTION_MUTATION = gql`
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
      
      const { data: response } = await apolloClient.mutate<{ createCompany: any }>({
        mutation: this.CREATE_COMPANY_MUTATION,
        variables: { input }
      });
      
      console.log('[ConfigurationService] Response:', response);
      return response?.createCompany;
    } catch (error: any) {
      console.error('[ConfigurationService] Error:', error);
      throw new Error(error?.message || 'Failed to create company');
    }
  }

  async joinCompany(data: { invitationCode: string }): Promise<any> {
    try {
      const { data: response } = await apolloClient.mutate<{ joinCompany: any }>({
        mutation: this.JOIN_COMPANY_MUTATION,
        variables: { invitationCode: data.invitationCode }
      });
      return response?.joinCompany;
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to join company');
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
      const { data: response } = await apolloClient.mutate<{ generateCompanyDescription: { generatedDescription: string } }>({
        mutation: this.GENERATE_DESCRIPTION_MUTATION,
        variables: { input }
      });
      return response?.generateCompanyDescription || { generatedDescription: '' };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to generate description');
    }
  }

  async getCompanyDetails(id: string): Promise<any> {
    // TODO: Implement getting company details
    throw new Error('Not implemented');
  }
}

export const configurationService = new ConfigurationService();
