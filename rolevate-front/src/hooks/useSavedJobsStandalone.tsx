"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSavedJobs, saveJob, unsaveJob } from "@/services/savedJobs";
import { getCurrentUser } from "@/services/auth";

export function useSavedJobsStandalone() {
  const router = useRouter();
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Load user and saved jobs on mount
  useEffect(() => {
    loadUserAndSavedJobs();
  }, []);

  const loadUserAndSavedJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const userData = await getCurrentUser();
      setUser(userData);

      // If no user or not a candidate, don't load saved jobs
      if (!userData || userData.userType !== "CANDIDATE") {
        setSavedJobIds(new Set());
        return;
      }

      // Load saved jobs from user profile if available, otherwise from API
      if (
        userData.candidateProfile?.savedJobs &&
        Array.isArray(userData.candidateProfile.savedJobs)
      ) {
        const jobIds = new Set<string>(
          userData.candidateProfile.savedJobs.map((savedJob: any) =>
            String(savedJob.jobId)
          )
        );
        setSavedJobIds(jobIds);
      } else {
        // Fallback to API call
        const savedJobs = await getSavedJobs();
        const jobIds = new Set(savedJobs.map((job) => job.jobId));
        setSavedJobIds(jobIds);
      }
    } catch (err) {
      // User might not be authenticated, which is fine
      console.log("User not authenticated or error loading saved jobs:", err);
      setUser(null);
      setSavedJobIds(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  const isJobSaved = (jobId: string): boolean => {
    // If user is not a candidate, they can't save jobs
    if (!user || user.userType !== "CANDIDATE") {
      return false;
    }
    return savedJobIds.has(jobId);
  };

  const canSaveJobs = (): boolean => {
    return user !== null && user.userType === "CANDIDATE";
  };

  const toggleSaveJob = async (jobId: string): Promise<boolean> => {
    try {
      setError(null);

      // Check if user is authenticated
      if (!user) {
        router.push("/login");
        throw new Error("Please log in to save jobs");
      }

      // Check if user is a candidate
      if (user.userType !== "CANDIDATE") {
        throw new Error("Only candidates can save jobs");
      }

      const wasSaved = savedJobIds.has(jobId);

      if (wasSaved) {
        await unsaveJob(jobId);
        setSavedJobIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await saveJob(jobId);
        setSavedJobIds((prev) => new Set([...prev, jobId]));
      }

      return !wasSaved; // Return new saved state
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save/unsave job"
      );
      console.error("Failed to toggle save job:", err);
      throw err;
    }
  };

  return {
    savedJobIds,
    isLoading,
    error,
    isJobSaved,
    canSaveJobs,
    toggleSaveJob,
    refreshSavedJobs: loadUserAndSavedJobs,
    user,
  };
}
