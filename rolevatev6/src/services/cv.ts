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

  private UPLOAD_CV_TO_S3_MUTATION = gql`
    mutation UploadCVToS3(
      $base64File: String!
      $filename: String!
      $mimetype: String!
      $candidateId: String
    ) {
      uploadCVToS3(
        base64File: $base64File
        filename: $filename
        mimetype: $mimetype
        candidateId: $candidateId
      ) {
        url
        key
        bucket
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

  /**
   * Convert File to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Upload CV file to S3 via GraphQL
   */
  async uploadCV(file: File, candidateId?: string): Promise<string> {
    try {
      // Convert file to base64
      const base64File = await this.fileToBase64(file);

      // Upload to S3 via GraphQL
      const { data } = await apolloClient.mutate<{
        uploadCVToS3: { url: string; key: string; bucket: string };
      }>({
        mutation: this.UPLOAD_CV_TO_S3_MUTATION,
        variables: {
          base64File,
          filename: file.name,
          mimetype: file.type,
          candidateId
        }
      });

      if (!data?.uploadCVToS3?.url) {
        throw new Error('Failed to upload CV');
      }

      return data.uploadCVToS3.url;
    } catch (error: any) {
      console.error('Error uploading CV:', error);
      throw new Error(error?.message || 'Failed to upload CV');
    }
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
export const uploadCV = (file: File, candidateId?: string) => cvService.uploadCV(file, candidateId);
export const deleteCV = (id: string) => cvService.deleteCV(id);
export const activateCV = (id: string) => cvService.activateCV(id);
export const transformCVData = (cv: CVData) => cvService.transformCVData(cv);
