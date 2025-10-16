import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

export interface CompanyProfile {
  id: string;
  name: string;
  logo?: string;
  industry?: string;
  founded?: string;
  employees?: string;
  headquarters?: string;
  website?: string;
  description?: string;
  mission?: string;
  email?: string;
  phone?: string;
  values?: string[];
  benefits?: string[];
  stats?: { label: string; value: string }[];
  subscription?: {
    plan: string;
    renewal: string;
    status: string;
    features: string[];
  };
  users?: CompanyUser[];
}

export interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  applicationUpdates: boolean;
  interviewReminders: boolean;
  systemAlerts: boolean;
  weeklyReports: boolean;
}

export class CompanyService {
  private GET_MY_PROFILE_QUERY = gql`
    query GetMe {
      me {
        id
        name
        email
        userType
        companyId
        company {
          id
          name
          description
          industry
          website
          email
          phone
          logo
          size
          founded
          location
          addressId
          createdAt
          updatedAt
          users {
            id
            name
            email
          }
        }
      }
    }
  `;

  private UPDATE_COMPANY_MUTATION = gql`
    mutation UpdateCompany($id: ID!, $input: UpdateCompanyInput!) {
      updateCompany(id: $id, input: $input) {
        id
        name
        description
        industry
        website
        email
        phone
        logo
        size
        founded
        location
      }
    }
  `;

  private CREATE_COMPANY_INVITATION_MUTATION = gql`
    mutation CreateInvitation($input: CreateInvitationInput!) {
      createCompanyInvitation(input: $input) {
        id
        code
        email
        userType
        status
        expiresAt
        invitationLink
      }
    }
  `;

  async getCompanyProfile(): Promise<CompanyProfile | null> {
    try {
      const { data } = await apolloClient.query<{ me: any }>({
        query: this.GET_MY_PROFILE_QUERY,
        fetchPolicy: 'network-only',
      });

      if (!data?.me?.company) {
        return null;
      }

      const company = data.me.company;
      const users = company.users || [];
      
      // Transform the GraphQL response to match the CompanyProfile interface
      return {
        id: company.id,
        name: company.name,
        logo: company.logo,
        industry: company.industry,
        founded: company.founded ? new Date(company.founded).getFullYear().toString() : 
                 company.createdAt ? new Date(company.createdAt).getFullYear().toString() : undefined,
        employees: company.size,
        headquarters: company.location,
        website: company.website,
        description: company.description,
        mission: company.description,
        email: company.email,
        phone: company.phone,
        values: [],
        benefits: [],
        stats: [],
        subscription: undefined,
        users: users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'Member',
          avatar: undefined,
        })),
      };
    } catch (error: any) {
      console.error('[CompanyService] Error fetching company profile:', error);
      throw new Error(error?.message || 'Failed to fetch company profile');
    }
  }

  async generateInvitationCode(): Promise<{ code: string; expiresAt: string }> {
    try {
      const { data } = await apolloClient.mutate<{ 
        createCompanyInvitation: { 
          code: string; 
          expiresAt: string;
          invitationLink: string;
        } 
      }>({
        mutation: this.CREATE_COMPANY_INVITATION_MUTATION,
        variables: {
          input: {
            expiresInHours: 168 // 7 days
          }
        }
      });

      if (!data?.createCompanyInvitation) {
        throw new Error('Failed to create invitation');
      }

      return {
        code: data.createCompanyInvitation.code,
        expiresAt: data.createCompanyInvitation.expiresAt
      };
    } catch (error: any) {
      console.error('[CompanyService] Error generating invitation code:', error);
      throw new Error(error?.message || 'Failed to generate invitation code');
    }
  }

  async uploadLogo(file: File): Promise<string> {
    try {
      console.log('[CompanyService] Starting logo upload for file:', file.name, file.type, file.size);
      
      // Convert file to base64
      const base64 = await this.fileToBase64(file);
      console.log('[CompanyService] File converted to base64');
      
      // Get current user's company ID
      const me = await apolloClient.query<{ me: any }>({
        query: this.GET_MY_PROFILE_QUERY,
        fetchPolicy: 'network-only',
      });

      const companyId = me.data?.me?.companyId;
      
      if (!companyId) {
        throw new Error('Company ID not found');
      }

      console.log('[CompanyService] Updating company with base64 logo...');

      // Update the company with the base64 logo
      const { data: updateData } = await apolloClient.mutate<{ updateCompany: { id: string; logo: string } }>({
        mutation: this.UPDATE_COMPANY_MUTATION,
        variables: { 
          id: companyId,
          input: { logo: base64 }
        },
      });

      console.log('[CompanyService] Logo updated successfully');
      return updateData?.updateCompany?.logo || base64;
    } catch (error: any) {
      console.error('[CompanyService] Error uploading logo:', error);
      throw new Error(error?.message || 'Failed to upload logo');
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  async updateNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      // This endpoint might not exist in the current GraphQL schema
      // Log for now until backend implements it
      console.log('[CompanyService] Notification settings update requested:', settings);
      throw new Error('Notification settings update not yet implemented in GraphQL API');
    } catch (error: any) {
      console.error('[CompanyService] Error updating notification settings:', error);
      throw new Error(error?.message || 'Failed to update notification settings');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      // This endpoint might not exist in the current GraphQL schema
      // Log for now until backend implements it
      console.log('[CompanyService] Password change requested');
      throw new Error('Password change not yet implemented in GraphQL API');
    } catch (error: any) {
      console.error('[CompanyService] Error changing password:', error);
      throw new Error(error?.message || 'Failed to change password');
    }
  }
}

export const companyService = new CompanyService();
