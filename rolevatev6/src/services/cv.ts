import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

export interface CVData {
  id: string;
  fileName: string;
  fileUrl: string;
  status: 'PENDING' | 'ANALYZED' | 'FAILED';
  analysisResults?: any;
  uploadedAt: string;
  updatedAt: string;
}

export interface CVUploadResponse {
  id: string;
  fileUrl: string;
  status: string;
}

class CVService {
  private GET_CVS_QUERY = gql`
    query GetCVs {
      cvs {
        id
        fileName
        fileUrl
        status
        analysisResults
        uploadedAt
        updatedAt
      }
    }
  `;

  private UPLOAD_CV_MUTATION = gql`
    mutation UploadCV($file: Upload!) {
      uploadCV(file: $file) {
        id
        fileUrl
        status
      }
    }
  `;

  private DELETE_CV_MUTATION = gql`
    mutation DeleteCV($id: ID!) {
      deleteCV(id: $id)
    }
  `;

  private ACTIVATE_CV_MUTATION = gql`
    mutation ActivateCV($id: ID!) {
      activateCV(id: $id)
    }
  `;

  async getCVs(): Promise<CVData[]> {
    try {
      const { data } = await apolloClient.query<{ cvs: CVData[] }>({
        query: this.GET_CVS_QUERY,
        fetchPolicy: 'network-only'
      });
      return data?.cvs || [];
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch CVs');
    }
  }

  async uploadCV(file: File): Promise<string> {
    // TODO: Implement file upload to GraphQL
    // For now, return a placeholder URL
    return 'https://example.com/cv.pdf';
  }

  async deleteCV(id: string): Promise<boolean> {
    try {
      const { data } = await apolloClient.mutate<{ deleteCV: boolean }>({
        mutation: this.DELETE_CV_MUTATION,
        variables: { id }
      });
      return data?.deleteCV || false;
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to delete CV');
    }
  }

  async activateCV(id: string): Promise<boolean> {
    try {
      const { data } = await apolloClient.mutate<{ activateCV: boolean }>({
        mutation: this.ACTIVATE_CV_MUTATION,
        variables: { id }
      });
      return data?.activateCV || false;
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to activate CV');
    }
  }

  transformCVData(cv: CVData) {
    return {
      ...cv,
      displayName: cv.fileName,
      statusColor: cv.status === 'ANALYZED' ? 'green' : cv.status === 'PENDING' ? 'yellow' : 'red'
    };
  }
}

export const cvService = new CVService();

// Export functions for backward compatibility
export const getCVs = () => cvService.getCVs();
export const uploadCV = (file: File) => cvService.uploadCV(file);
export const deleteCV = (id: string) => cvService.deleteCV(id);
export const activateCV = (id: string) => cvService.activateCV(id);
export const transformCVData = (cv: CVData) => cvService.transformCVData(cv);
