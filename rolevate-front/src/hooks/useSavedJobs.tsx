"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSavedJobs, saveJob, unsaveJob } from "@/services/savedJobs";
import { useAuth } from "@/hooks/useAuth";

export function useSavedJobs() {
  const router = useRouter();
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Always call useAuth at the top level - hooks must be called unconditionally
  const { user, isLoading: authLoading } = useAuth();

  // Load saved jobs on mount or when user changes
  useEffect(() => {
    const loadSavedJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("loadSavedJobs: Starting to load saved jobs", {
          user: user?.userType,
          hasProfile: !!user?.candidateProfile,
        });

        // If no user, don't load saved jobs
        if (!user) {
          console.log("loadSavedJobs: No user, setting empty saved jobs");
          setSavedJobIds(new Set());
          return;
        }

        // Only candidates can have saved jobs
        if (user.userType !== "CANDIDATE") {
          console.log(
            "loadSavedJobs: User is not candidate, setting empty saved jobs"
          );
          setSavedJobIds(new Set());
          return;
        }

        // Load saved jobs from user profile if available, otherwise from API
        if (user.candidateProfile?.savedJobs) {
          console.log(
            "loadSavedJobs: Found saved jobs in profile",
            user.candidateProfile.savedJobs
          );
          // Check if savedJobs is array of strings (job IDs) or objects
          const savedJobsData = user.candidateProfile.savedJobs;

          let jobIds: Set<string>;
          if (savedJobsData.length > 0) {
            // If first item is a string, treat as array of job IDs
            if (typeof savedJobsData[0] === "string") {
              jobIds = new Set(savedJobsData as string[]);
              console.log("loadSavedJobs: Treating as string array", jobIds);
            } else {
              // If objects, extract jobId property
              jobIds = new Set(
                savedJobsData.map((savedJob: any) => savedJob.jobId)
              );
              console.log("loadSavedJobs: Treating as object array", jobIds);
            }
          } else {
            jobIds = new Set();
            console.log("loadSavedJobs: Empty saved jobs array");
          }

          setSavedJobIds(jobIds);
          console.log("Loaded saved jobs from profile:", Array.from(jobIds));
        } else {
          console.log(
            "loadSavedJobs: No saved jobs in profile, fetching from API"
          );
          // Fallback to API call
          const savedJobs = await getSavedJobs();
          const jobIds = new Set(savedJobs.map((job) => job.jobId));
          setSavedJobIds(jobIds);
          console.log("Loaded saved jobs from API:", Array.from(jobIds));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load saved jobs"
        );
        console.error("Failed to load saved jobs:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadSavedJobs();
    }
  }, [user, authLoading]);

  const refreshSavedJobs = async () => {
    if (authLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        setSavedJobIds(new Set());
        return;
      }

      if (user.userType !== "CANDIDATE") {
        setSavedJobIds(new Set());
        return;
      }

      if (user.candidateProfile?.savedJobs) {
        const savedJobsData = user.candidateProfile.savedJobs;
        let jobIds: Set<string>;
        if (savedJobsData.length > 0) {
          if (typeof savedJobsData[0] === "string") {
            jobIds = new Set(savedJobsData as string[]);
          } else {
            jobIds = new Set(
              savedJobsData.map((savedJob: any) => savedJob.jobId)
            );
          }
        } else {
          jobIds = new Set();
        }
        setSavedJobIds(jobIds);
      } else {
        const savedJobs = await getSavedJobs();
        const jobIds = new Set(savedJobs.map((job) => job.jobId));
        setSavedJobIds(jobIds);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load saved jobs"
      );
      console.error("Failed to refresh saved jobs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isJobSaved = (jobId: string): boolean => {
    // If user is not a candidate, they can't save jobs
    if (!user || user.userType !== "CANDIDATE") {
      console.log("isJobSaved: User not candidate or not logged in", {
        user: user?.userType,
        jobId,
      });
      return false;
    }
    const isSaved = savedJobIds.has(jobId);
    console.log("isJobSaved check:", {
      jobId,
      isSaved,
      savedJobIds: Array.from(savedJobIds),
      savedJobIdsSize: savedJobIds.size,
    });
    return isSaved;
  };

  const canSaveJobs = (): boolean => {
    const canSave = user !== null && user.userType === "CANDIDATE";
    console.log("canSaveJobs check:", {
      user: user?.userType,
      canSave,
      hasUser: !!user,
    });
    return canSave;
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
    isLoading: isLoading || authLoading,
    error,
    isJobSaved,
    canSaveJobs,
    toggleSaveJob,
    refreshSavedJobs,
    user,
  };
}

