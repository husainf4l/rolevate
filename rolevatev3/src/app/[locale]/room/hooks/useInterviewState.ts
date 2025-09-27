import { useState, useCallback } from "react";
import { JobInfo, CompanyInfo } from "../types/interview";

export function useInterviewState() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState(true);
  const [participantName, setParticipantName] = useState<string>("");
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);

  const handleStartInterview = useCallback(async () => {
    console.log("🎬 Starting interview setup...");
    
    try {
      // Try to get full media access first
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      stream.getTracks().forEach((track) => track.stop());
      console.log("✅ Full media permissions granted");
      setNeedsPermission(false);
      setError(null);
      return;
    } catch (fullMediaError) {
      console.warn("⚠️ Full media access denied, trying audio-only...", fullMediaError);
    }

    try {
      // Try audio-only access
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      audioStream.getTracks().forEach((track) => track.stop());
      console.log("✅ Audio-only permissions granted");
      setNeedsPermission(false);
      setError(null);
      return;
    } catch (audioError) {
      console.warn("⚠️ Audio access also denied, proceeding without media...", audioError);
    }

    // Proceed even without any media permissions
    // The backend room creation and connection should still work
    console.log("ℹ️ Proceeding without media permissions");
    setNeedsPermission(false);
    setError(null);
  }, []);

  const updateConnectionState = useCallback((connected: boolean, connecting: boolean) => {
    setIsConnected(connected);
    setIsConnecting(connecting);
  }, []);

  const updateError = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  const updateJobData = useCallback((jobData: Record<string, unknown>, companyData: Record<string, unknown>, participantData: string) => {
    if (jobData) setJobInfo(jobData);
    if (companyData) setCompanyInfo(companyData);
    if (participantData) setParticipantName(participantData);
  }, []);

  return {
    // State
    isConnected,
    isConnecting,
    error,
    needsPermission,
    participantName,
    companyInfo,
    jobInfo,
    
    // Actions
    handleStartInterview,
    setNeedsPermission,
    updateConnectionState,
    updateError,
    updateJobData,
    
    // Setters for direct updates
    setIsConnected,
    setIsConnecting,
    setError,
    setParticipantName,
    setCompanyInfo,
    setJobInfo
  };
}