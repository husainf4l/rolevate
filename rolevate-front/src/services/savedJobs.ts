const BASE_API = "http://localhost:4005/api";

export interface SavedJobRequest {
  jobId: string;
}

export interface SavedJobResponse {
  id: string;
  jobId: string;
  candidateId: string;
  createdAt: string;
}

// Save a job
export async function saveJob(jobId: string): Promise<SavedJobResponse> {
  try {
    const res = await fetch(`${BASE_API}/candidate/saved-jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send HTTP-only cookies
      body: JSON.stringify({ jobId }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error?.message || error?.error || "Failed to save job");
    }

    return await res.json();
  } catch (error) {
    console.error("Save job failed:", error);
    throw error;
  }
}

// Unsave a job
export async function unsaveJob(jobId: string): Promise<void> {
  try {
    const res = await fetch(`${BASE_API}/candidate/saved-jobs/${jobId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send HTTP-only cookies
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error?.message || error?.error || "Failed to unsave job");
    }
  } catch (error) {
    console.error("Unsave job failed:", error);
    throw error;
  }
}

// Get all saved jobs
export async function getSavedJobs(): Promise<SavedJobResponse[]> {
  try {
    const res = await fetch(`${BASE_API}/candidate/saved-jobs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send HTTP-only cookies
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error?.message || error?.error || "Failed to get saved jobs");
    }

    return await res.json();
  } catch (error) {
    console.error("Get saved jobs failed:", error);
    throw error;
  }
}

// Check if a job is saved
export async function isJobSaved(jobId: string): Promise<boolean> {
  try {
    const savedJobs = await getSavedJobs();
    return savedJobs.some(savedJob => savedJob.jobId === jobId);
  } catch (error) {
    console.error("Check if job is saved failed:", error);
    return false;
  }
}

export interface SavedJobDetails {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  deadline: string;
  description: string;
  shortDescription: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  skills: string[];
  experience: string;
  education: string;
  jobLevel: "ENTRY" | "MID" | "SENIOR" | "EXECUTIVE";
  workType: "ON_SITE" | "REMOTE" | "HYBRID";
  industry: string;
  status: "ACTIVE" | "INACTIVE" | "CLOSED";
  featured: boolean;
  applicants: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
    industry: string;
    numberOfEmployees: number;
    address: {
      city: string;
      country: string;
    };
  };
  screeningQuestions: Array<{
    id: string;
    question: string;
    type: "YES_NO" | "MULTIPLE_CHOICE" | "TEXT";
    required: boolean;
  }>;
  _count: {
    applications: number;
  };
}

export interface SavedJobsDetailsResponse {
  savedJobs: SavedJobDetails[];
}

// Get saved jobs with full details
export async function getSavedJobsDetails(): Promise<SavedJobsDetailsResponse> {
  try {
    const res = await fetch(`${BASE_API}/candidate/saved-jobs/details`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send HTTP-only cookies
    });

    if (!res.ok) {
      // If 404, treat as no saved jobs
      if (res.status === 404) {
        return { savedJobs: [] };
      }
      const error = await res.json().catch(() => ({}));
      throw new Error(error?.message || error?.error || "Failed to get saved jobs details");
    }

    // If response is empty or not an object, treat as no saved jobs
    const data = await res.json().catch(() => null);
    if (!data || typeof data !== "object" || !Array.isArray(data.savedJobs)) {
      return { savedJobs: [] };
    }
    return data;
  } catch (error) {
    console.error("Get saved jobs details failed:", error);
    throw error;
  }
}
