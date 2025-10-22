import { API_CONFIG } from '@/lib/config';

export interface CommunicationRecord {
  id: string;
  candidateId: string;
  companyId: string;
  jobId?: string;
  type: "WHATSAPP" | "EMAIL" | "PHONE" | "SMS";
  direction: "INBOUND" | "OUTBOUND";
  status: "SENT" | "DELIVERED" | "READ" | "FAILED";
  content: string;
  subject?: string;
  whatsappId?: string;
  phoneNumber?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
  };
  job?: {
    title: string;
  };
}

export interface CreateCommunicationData {
  candidateId: string;
  companyId?: string; // Will be automatically filled if not provided
  jobId?: string;
  type: "WHATSAPP" | "EMAIL" | "PHONE" | "SMS";
  direction: "INBOUND" | "OUTBOUND";
  content: string;
  subject?: string;
  phoneNumber?: string;
  whatsappId?: string;
}

export interface CommunicationStats {
  total: number;
  whatsapp: number;
  email: number;
  phone: number;
  sms: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

export class CommunicationService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }



  // Get current user's company ID
  private static async getCurrentCompanyId(): Promise<string> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/auth/profile`, {
        credentials: 'include',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get user profile');
      }
      
      const profile = await response.json();
      const companyId = profile.companyId || profile.company?.id || '';
      
      console.log('User profile:', profile);
      console.log('Extracted company ID:', companyId);
      
      return companyId;
    } catch (error) {
      console.error('Error getting company ID:', error);
      throw error;
    }
  }

  static async createCommunication(data: CreateCommunicationData): Promise<CommunicationRecord> {
    try {
      // Get company ID if not provided
      let companyId = data.companyId;
      if (!companyId) {
        companyId = await this.getCurrentCompanyId();
      }

      if (!companyId) {
        throw new Error('Company ID is required but could not be determined');
      }

      // Use original CUID format - backend will accept CUID
      const payload = {
        ...data,
        candidateId: data.candidateId,
        companyId: companyId,
        jobId: data.jobId,
      };

      console.log('Sending communication payload:', payload);

      const response = await fetch(`${API_CONFIG.API_BASE_URL}/communications`, {
        method: 'POST',
        credentials: 'include',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: 'Failed to create communication' 
        }));
        throw new Error(error.message || 'Failed to create communication');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating communication:', error);
      throw error;
    }
  }

  static async getCommunications(params?: {
    candidateId?: string;
    jobId?: string;
    type?: string;
    direction?: string;
    limit?: number;
    offset?: number;
  }): Promise<CommunicationRecord[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `${API_CONFIG.API_BASE_URL}/communications${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      const response = await fetch(url, {
        credentials: 'include',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch communications');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching communications:', error);
      throw error;
    }
  }

  static async getCommunicationById(id: string): Promise<CommunicationRecord> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/communications/${id}`, {
        credentials: 'include',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch communication');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching communication:', error);
      throw error;
    }
  }

  static async getCommunicationStats(): Promise<CommunicationStats> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/communications/stats`, {
        credentials: 'include',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch communication stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching communication stats:', error);
      throw error;
    }
  }

  static async updateCommunicationStatus(
    id: string, 
    status: CommunicationRecord['status']
  ): Promise<CommunicationRecord> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/communications/${id}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update communication status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating communication status:', error);
      throw error;
    }
  }

  // Convenience methods for specific communication types
  static async sendWhatsAppMessage(candidateId: string, content: string, jobId?: string): Promise<CommunicationRecord> {
    const data: CreateCommunicationData = {
      candidateId,
      type: 'WHATSAPP',
      direction: 'OUTBOUND',
      content,
    };
    
    if (jobId) {
      data.jobId = jobId;
    }
    
    return this.createCommunication(data);
  }

  static async sendEmail(
    candidateId: string, 
    content: string, 
    subject: string, 
    jobId?: string
  ): Promise<CommunicationRecord> {
    const data: CreateCommunicationData = {
      candidateId,
      type: 'EMAIL',
      direction: 'OUTBOUND',
      content,
      subject,
    };
    
    if (jobId) {
      data.jobId = jobId;
    }
    
    return this.createCommunication(data);
  }

  static async sendSMS(candidateId: string, content: string, phoneNumber: string, jobId?: string): Promise<CommunicationRecord> {
    const data: CreateCommunicationData = {
      candidateId,
      type: 'SMS',
      direction: 'OUTBOUND',
      content,
      phoneNumber,
    };
    
    if (jobId) {
      data.jobId = jobId;
    }
    
    return this.createCommunication(data);
  }

  static async logPhoneCall(candidateId: string, content: string, phoneNumber: string, jobId?: string): Promise<CommunicationRecord> {
    const data: CreateCommunicationData = {
      candidateId,
      type: 'PHONE',
      direction: 'OUTBOUND',
      content,
      phoneNumber,
    };
    
    if (jobId) {
      data.jobId = jobId;
    }
    
    return this.createCommunication(data);
  }
}

export default CommunicationService;
