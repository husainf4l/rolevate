"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/services/auth";

interface CVStatus {
  hasCV: boolean;
  fileName?: string;
  lastUpdated?: string;
  status?: "current" | "draft" | "outdated";
}

export function useCVStatus() {
  const [cvStatus, setCVStatus] = useState<CVStatus>({ hasCV: false });
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has CV using /me endpoint
    checkCVStatus();
  }, []);

  const checkCVStatus = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();

      if (user && user.userType === "CANDIDATE") {
        // Check if user has CV data in their profile from /me endpoint
        const hasCV = !!(
          user.cvId ||
          user.cv ||
          user.cvFileName ||
          user.cvFile
        );

        if (hasCV) {
          const today = new Date().toISOString().split("T")[0];
          setCVStatus({
            hasCV: true,
            fileName:
              user.cvFileName ||
              user.cv?.fileName ||
              user.cvFile?.name ||
              "CV.pdf",
            lastUpdated: user.cvUpdatedAt || user.cv?.updatedAt || today,
            status: "current",
          });
          setShowUploadPrompt(false);
        } else {
          setCVStatus({ hasCV: false });
          // Only show prompt if user hasn't dismissed it before
          const hasShownPromptBefore = localStorage.getItem("hasShownCVPrompt");
          if (!hasShownPromptBefore) {
            setShowUploadPrompt(true);
          }
        }
        setHasShownPrompt(!!localStorage.getItem("hasShownCVPrompt"));
      }
    } catch (error) {
      console.error("Error checking CV status:", error);
      setCVStatus({ hasCV: false });
      // If there's an error, still show the prompt for candidates
      const hasShownPromptBefore = localStorage.getItem("hasShownCVPrompt");
      if (!hasShownPromptBefore) {
        setShowUploadPrompt(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCVUpload = async (file: File) => {
    try {
      // TODO: Replace with actual API call to upload CV
      // For now, just simulate the upload
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(now.getDate()).padStart(2, "0")}`;

      setCVStatus({
        hasCV: true,
        fileName: file.name,
        lastUpdated: today,
        status: "current",
      });
      setShowUploadPrompt(false);
      setHasShownPrompt(true);
      localStorage.setItem("hasShownCVPrompt", "true");

      // Refresh CV status after upload
      await checkCVStatus();
    } catch (error) {
      console.error("Error uploading CV:", error);
    }
  };

  const handleSkipUpload = () => {
    setShowUploadPrompt(false);
    setHasShownPrompt(true);
    localStorage.setItem("hasShownCVPrompt", "true");
  };

  const handleDismissPrompt = () => {
    setShowUploadPrompt(false);
    // Don't mark as shown, so it can appear again next time
  };

  const resetPromptStatus = () => {
    localStorage.removeItem("hasShownCVPrompt");
    setHasShownPrompt(false);
  };

  return {
    cvStatus,
    showUploadPrompt,
    hasShownPrompt,
    loading,
    handleCVUpload,
    handleSkipUpload,
    handleDismissPrompt,
    resetPromptStatus,
    checkCVStatus,
  };
}
