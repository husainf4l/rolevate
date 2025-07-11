// Application service for job applications and CV upload
export type ApplicationData = {
  jobId: string;
  coverLetter: string;
  resumeUrl?: string;
  expectedSalary?: string;
  noticePeriod?: string;
};

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
