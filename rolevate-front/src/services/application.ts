// Application service for job applications and CV upload
export type ApplicationData = {
  jobId: string;
  coverLetter: string;
  resumeUrl?: string;
  expectedSalary?: string;
  noticePeriod?: string;
};

export interface Application {
  id: string;
  status: "PENDING" | "REVIEWING" | "REJECTED" | "OFFERED" | "HIRED";
  appliedAt: string;
  cvAnalysisScore: number;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  job: {
    id: string;
    title: string;
    location?: string;
    salary?: string;
  };
  cv?: {
    id: string;
    fileName: string;
    skills?: string[];
    experience?: string;
    education?: string;
  };
}

export async function uploadCV(file: File): Promise<string> {
  const uploadData = new FormData();
  uploadData.append("file", file);
  const uploadRes = await fetch("http://localhost:4005/api/uploads/cvs", {
    method: "POST",
    body: uploadData,
    credentials: "include",
  });
  if (!uploadRes.ok) throw new Error("Failed to upload CV");
  const uploadJson = await uploadRes.json();
  const resumeUrl = uploadJson.fileUrl || uploadJson.url || uploadJson.resumeUrl;
  if (!resumeUrl) throw new Error("No resume URL returned from upload");
  return resumeUrl;
}

export async function applyToJob(data: ApplicationData): Promise<{ message: string; applicationId?: string }> {
  const response = await fetch("http://localhost:4005/api/applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to apply to job" }));
    throw new Error(error.message || "Failed to apply to job");
  }
  const resJson = await response.json();
  return {
    message: resJson.message || "Application submitted successfully",
    applicationId: resJson.id || resJson.applicationId,
  };
}

export type AnonymousApplicationData = {
  jobId: string;
  name: string;
  email: string;
  phone: string;
  coverLetter?: string;
  resumeUrl?: string;
  portfolio?: string;
};

export async function applyToJobAnonymously(data: AnonymousApplicationData): Promise<{ message: string; applicationId?: string }> {
  const response = await fetch("http://localhost:4005/api/applications/apply-with-cv", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to apply to job" }));
    throw new Error(error.message || "Failed to apply to job");
  }
  const resJson = await response.json();
  return {
    message: resJson.message || "Application submitted successfully",
    applicationId: resJson.id || resJson.applicationId,
  };
}

// Company endpoints for managing applications

// Get all applications for a specific job
export async function getApplicationsByJob(jobId: string): Promise<Application[]> {
  const response = await fetch(`http://localhost:4005/api/applications/job/${jobId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to fetch applications" }));
    throw new Error(error.message || "Failed to fetch applications");
  }
  
  return response.json();
}

// Get all applications for a company with optional filtering
export async function getCompanyApplications(jobId?: string): Promise<Application[]> {
  const url = jobId 
    ? `http://localhost:4005/api/applications/company?jobId=${jobId}`
    : `http://localhost:4005/api/applications/company`;
    
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to fetch company applications" }));
    throw new Error(error.message || "Failed to fetch company applications");
  }
  
  return response.json();
}

// Update application status
export async function updateApplicationStatus(
  applicationId: string, 
  status: Application["status"]
): Promise<{ message: string }> {
  const response = await fetch(`http://localhost:4005/api/applications/${applicationId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to update application status" }));
    throw new Error(error.message || "Failed to update application status");
  }
  
  return response.json();
}

// Bulk update application statuses
export async function bulkUpdateApplicationStatus(
  applicationIds: string[], 
  status: Application["status"]
): Promise<{ message: string }> {
  const promises = applicationIds.map(id => updateApplicationStatus(id, status));
  await Promise.all(promises);
  return { message: `Successfully updated ${applicationIds.length} applications` };
}
