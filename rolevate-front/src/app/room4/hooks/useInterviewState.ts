import { useState, useCallback } from "react";

export function useInterviewState() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState(true);
  const [participantName, setParticipantName] = useState<string>("");
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [jobInfo, setJobInfo] = useState<any>(null);

  const handleStartInterview = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      stream.getTracks().forEach((track) => track.stop());
      setNeedsPermission(false);
      setError(null);
    } catch (err) {
      setError("Microphone and camera permissions are required for the interview.");
    }
  }, []);

  const updateConnectionState = useCallback((connected: boolean, connecting: boolean) => {
    setIsConnected(connected);
    setIsConnecting(connecting);
  }, []);

  const updateError = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  const updateJobData = useCallback((jobData: any, companyData: any, participantData: string) => {
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