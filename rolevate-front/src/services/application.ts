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
  status: "SUBMITTED" | "REVIEWING" | "INTERVIEW_SCHEDULED" | "INTERVIEWED" | "OFFERED" | "REJECTED" | "WITHDRAWN";
  appliedAt: string;
  cvAnalysisScore: number;
  jobId: string;
  candidateId: string;
  coverLetter: string;
  resumeUrl: string;
  expectedSalary: string;
  noticePeriod: string;
  cvAnalysisResults?: {
    score: number;
    summary: string;
    strengths: string[];
    overallFit: string;
    weaknesses: string[];
    skillsMatch: {
      matched: string[];
      missing: string[];
      percentage: number;
    };
    educationMatch: {
      details: string;
      relevant: boolean;
    };
    experienceMatch: {
      years: number;
      details: string;
      relevant: boolean;
    };
    recommendations: string[];
  };
  analyzedAt: string;
  companyNotes?: string;
  reviewedAt?: string;
  interviewScheduledAt?: string;
  interviewedAt?: string;
  rejectedAt?: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  job: {
    id: string;
    title: string;
    company: {
      name: string;
    };
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

// Get a single application by ID using the company endpoint with applicationId query
export async function getApplicationById(applicationId: string): Promise<Application> {
  const response = await fetch(`http://localhost:4005/api/applications/company?applicationId=${applicationId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to fetch application" }));
    throw new Error(error.message || "Failed to fetch application");
  }
  
  const data = await response.json();
  console.log('Raw response data:', data);
  
  // Handle both array and single object responses
  let application: Application;
  
  if (Array.isArray(data)) {
    // If using applicationId query, backend should return array with single application or empty array
    if (data.length === 0) {
      throw new Error("Application not found or you don't have permission to view it");
    }
    application = data[0];
  } else {
    // If backend returns a single object directly
    application = data;
  }
  
  if (!application || !application.id) {
    throw new Error("Application data is invalid or missing required fields");
  }

  return application;
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

// Application notes interfaces
export interface ApplicationNote {
  id: string;
  applicationId: string;
  text: string;
  createdAt: string;
  source: "USER" | "AI" | "SYSTEM";
  userId?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}

export interface CreateNoteData {
  text: string;
  source: ApplicationNote["source"];
}

export interface UpdateNoteData {
  text?: string;
  source?: ApplicationNote["source"];
}

// Get application notes
export async function getApplicationNotes(applicationId: string): Promise<ApplicationNote[]> {
  const response = await fetch(`http://localhost:4005/api/applications/${applicationId}/notes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to fetch application notes" }));
    throw new Error(error.message || "Failed to fetch application notes");
  }
  
  return response.json();
}

// Create application note
export async function createApplicationNote(
  applicationId: string, 
  noteData: CreateNoteData
): Promise<ApplicationNote> {
  const response = await fetch(`http://localhost:4005/api/applications/${applicationId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(noteData),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to create application note" }));
    throw new Error(error.message || "Failed to create application note");
  }
  
  return response.json();
}

// Update application note
export async function updateApplicationNote(
  applicationId: string,
  noteId: string,
  noteData: UpdateNoteData
): Promise<ApplicationNote> {
  const response = await fetch(`http://localhost:4005/api/applications/${applicationId}/notes/${noteId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(noteData),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to update application note" }));
    throw new Error(error.message || "Failed to update application note");
  }
  
  return response.json();
}
