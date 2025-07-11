// src/services/cv.ts

const BASE_API = "http://localhost:4005/api";

export interface CVData {
  id: string;
  fileName: string;
  originalFileName: string;
  lastUpdated: string;
  status: "current" | "processing" | "error" | "uploaded";
  downloadUrl: string;
  fileSize: string;
  isActive: boolean;
  mimeType: string;
  uploadedAt: string;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CVResponseDto {
  id: string;
  fileName: string;
  originalFileName?: string | null;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  status: CVStatus;
  isActive: boolean;
  candidateId: string;
  uploadedAt: Date;
  processedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum CVStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  ERROR = 'ERROR'
}

// Upload CV
export async function uploadCV(file: File): Promise<CVResponseDto> {
  const formData = new FormData();
  formData.append('cv', file);

  const res = await fetch(`${BASE_API}/candidate/upload-cv`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message || 'Failed to upload CV');
  }

  return res.json();
}

// Get all CVs for the authenticated user
export async function getCVs(): Promise<CVResponseDto[]> {
  const res = await fetch(`${BASE_API}/candidate/cvs`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message || 'Failed to fetch CVs');
  }

  return res.json();
}

// Delete CV
export async function deleteCV(cvId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE_API}/candidate/cvs/${cvId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message || 'Failed to delete CV');
  }

  return res.json();
}

// Activate CV
export async function activateCV(cvId: string): Promise<CVResponseDto> {
  const res = await fetch(`${BASE_API}/candidate/cvs/${cvId}/activate`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message || 'Failed to activate CV');
  }

  return res.json();
}

// Helper function to transform backend CV data to frontend format
export function transformCVData(cv: CVResponseDto): CVData {
  return {
    id: cv.id,
    fileName: cv.fileName,
    originalFileName: cv.originalFileName || cv.fileName,
    lastUpdated: new Date(cv.updatedAt).toISOString(),
    status: mapCVStatus(cv.status),
    downloadUrl: cv.fileUrl,
    fileSize: formatFileSize(cv.fileSize || 0),
    isActive: cv.isActive,
    mimeType: cv.mimeType || 'application/octet-stream',
    uploadedAt: new Date(cv.uploadedAt).toISOString(),
    processedAt: cv.processedAt ? new Date(cv.processedAt).toISOString() : null,
    createdAt: new Date(cv.createdAt).toISOString(),
    updatedAt: new Date(cv.updatedAt).toISOString(),
  };
}

// Map backend CV status to frontend status
function mapCVStatus(status: CVStatus): "current" | "processing" | "error" | "uploaded" {
  switch (status) {
    case CVStatus.PROCESSED:
      return "current";
    case CVStatus.PROCESSING:
      return "processing";
    case CVStatus.ERROR:
      return "error";
    case CVStatus.UPLOADED:
      return "uploaded";
    default:
      return "uploaded";
  }
}

// Format file size from bytes to human readable format
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
