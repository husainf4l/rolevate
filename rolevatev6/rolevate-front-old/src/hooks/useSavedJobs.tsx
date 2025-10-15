"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSavedJobs, saveJob, unsaveJob } from "@/services/savedJobs";
import { useAuth } from "@/hooks/useAuth";

export function useSavedJobs() {
  const router = useRouter();
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);
  const userIdRef = useRef<string | undefined>(undefined);

  // Always call useAuth at the top level - hooks must be called unconditionally
  const { user, isLoading: authLoading } = useAuth();

  // Memoize user ID to prevent unnecessary re-fetches
  const userId = useMemo(() => user?.id, [user?.id]);
  const userType = useMemo(() => user?.userType, [user?.userType]);

  // Load saved jobs on mount or when user changes
  useEffect(() => {
    // Prevent multiple fetches - check if we already fetched for this user
    if (fetchedRef.current && userIdRef.current === userId) {
      console.log("useSavedJobs: Skipping fetch - already fetched for user", userId);
      return;
    }

    // Skip if still loading auth
    if (authLoading) {
      console.log("useSavedJobs: Skipping fetch - auth still loading");
      return;
    }

    const loadSavedJobs = async () => {
      console.log("useSavedJobs: Loading saved jobs for user", userId);
      
      try {
        setIsLoading(true);
        setError(null);

        // If no user, don't load saved jobs
        if (!user || !userId) {
          console.log("useSavedJobs: No user, setting empty saved jobs");
          setSavedJobIds(new Set());
          fetchedRef.current = true;
          userIdRef.current = undefined;
          return;
        }

        // Only candidates can have saved jobs
        if (userType !== "CANDIDATE") {
          console.log(
            "useSavedJobs: User is not candidate, setting empty saved jobs"
          );
          setSavedJobIds(new Set());
          fetchedRef.current = true;
          userIdRef.current = userId;
          return;
        }

        // Load saved jobs from user profile if available, otherwise from API
        if (user.candidateProfile?.savedJobs) {
          console.log(
            "useSavedJobs: Found saved jobs in profile",
            user.candidateProfile.savedJobs
          );
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
          fetchedRef.current = true;
          userIdRef.current = userId;
          console.log("useSavedJobs: Loaded saved jobs from profile:", Array.from(jobIds));
        } else {
          console.log(
            "useSavedJobs: No saved jobs in profile, fetching from API"
          );
          // Fallback to API call
          const savedJobs = await getSavedJobs();
          console.log("useSavedJobs: API response for saved jobs:", savedJobs);
          
          if (!Array.isArray(savedJobs)) {
            console.warn("getSavedJobs returned non-array:", savedJobs);
            setSavedJobIds(new Set());
            fetchedRef.current = true;
            userIdRef.current = userId;
            return;
          }
          
          const jobIds = new Set(savedJobs.map((job) => job.jobId));
          setSavedJobIds(jobIds);
          fetchedRef.current = true;
          userIdRef.current = userId;
          console.log("useSavedJobs: Loaded saved jobs from API:", Array.from(jobIds));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load saved jobs"
        );
        console.error("useSavedJobs: Failed to load saved jobs:", err);
        fetchedRef.current = true;
        userIdRef.current = userId;
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedJobs();
  }, [userId, userType, authLoading, user]);

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
        console.log("API response for refresh saved jobs:", savedJobs);
        
        // Handle case where API returns non-array response
        if (!Array.isArray(savedJobs)) {
          console.warn("getSavedJobs returned non-array on refresh:", savedJobs);
          setSavedJobIds(new Set());
          return;
        }
        
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

