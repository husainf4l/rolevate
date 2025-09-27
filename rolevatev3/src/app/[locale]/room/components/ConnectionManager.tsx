import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  VideoCameraIcon,
  ExclamationTriangleIcon,
  VideoCameraSlashIcon,
  MicrophoneIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
interface ConnectionManagerProps {
  needsPermission: boolean;
  error: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  onStartInterview: () => void;
  locale: string;
  t: (key: string) => string; // Translation function
}

const PageWrapper = ({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="min-h-screen bg-background relative">
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-card border rounded-lg p-6 sm:p-8 shadow-sm max-w-md w-full mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-lg sm:text-xl font-semibold text-card-foreground mb-2">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        {children}
      </div>
    </div>
  </div>
);



export function ConnectionManager({
  needsPermission,
  error,
  isConnecting,
  isConnected,
  onStartInterview,
  locale,
  t,
}: ConnectionManagerProps) {
  const [consentGiven, setConsentGiven] = useState(false);
  const [micTested, setMicTested] = useState(false);
  const [videoTested, setVideoTested] = useState(false);
  const [isAutoTesting, setIsAutoTesting] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isStartingInterview, setIsStartingInterview] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (audioContext) {
      audioContext.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [stream, audioContext]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Auto test both camera and microphone
  const autoTestDevices = useCallback(async () => {
    setIsAutoTesting(true);
    setCameraError(null);
    setMicError(null);

    try {
      // Test both camera and microphone together
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Setup video
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setVideoTested(true);

      // Setup audio monitoring
      const audioCtx = new (window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)();
      const analyserNode = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(mediaStream);

      analyserNode.fftSize = 256;
      source.connect(analyserNode);

      setAudioContext(audioCtx);
      setStream(mediaStream);

      const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

      const updateMicLevel = () => {
        analyserNode.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setMicLevel(Math.min(100, (average / 128) * 100));
        
        if (isAutoTesting) {
          animationFrameRef.current = requestAnimationFrame(updateMicLevel);
        }
      };

      updateMicLevel();

      // Auto-complete mic test after 3 seconds
      setTimeout(() => {
        setMicTested(true);
        setIsAutoTesting(false);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      }, 3000);

    } catch (err: unknown) {
      console.error("Error accessing media devices:", err);
      setIsAutoTesting(false);

      let errorMessage = "Camera/Microphone access failed";
      if (err instanceof Error) {
        if (err.name === "NotFoundError") {
          errorMessage = "No camera or microphone found. Please connect devices and try again.";
        } else if (err.name === "NotAllowedError") {
          errorMessage = "Camera/Microphone access denied. Please allow permissions and try again.";
        } else if (err.name === "NotReadableError") {
          errorMessage = "Camera/Microphone is being used by another application.";
        }
      }

      setCameraError(errorMessage);
      setMicError(errorMessage);
    }
  }, [isAutoTesting, videoRef, animationFrameRef]);

  // Auto-test devices when component mounts
  useEffect(() => {
    if (!isAutoTesting && !videoTested && !micTested) {
      autoTestDevices();
    }
  }, [isAutoTesting, videoTested, micTested, autoTestDevices]);

  const retryDeviceTest = () => {
    setVideoTested(false);
    setMicTested(false);
    setCameraError(null);
    setMicError(null);
    setMicLevel(0);
    cleanup();
    
    autoTestDevices();
  };

  if (needsPermission) {
    const canStartInterview = consentGiven && micTested && videoTested && !isAutoTesting;
    const hasErrors = cameraError || micError;

    return (
      <PageWrapper
        title={t('permissions.title')}
        description={t('permissions.subtitle')}
      >
        <div className="space-y-6">
          {/* Device Test Section - Top Priority */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">
                {t('permissions.allow')}
              </h3>
              <div className="text-sm text-muted-foreground">
                {isAutoTesting ? t('interview.connecting') : videoTested && micTested ? t('interview.connected') : hasErrors ? t('interview.failed') : t('interview.connecting')}
              </div>
            </div>
            
            {/* Video Preview */}
            <div className="w-full bg-muted rounded-xl h-40 sm:h-48 flex items-center justify-center mb-4 overflow-hidden relative">
              {videoTested || isAutoTesting ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover rounded-xl"
                  muted
                  playsInline
                  autoPlay
                />
              ) : hasErrors ? (
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-sm text-red-600 font-medium">{cameraError}</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Starting camera...</p>
                </div>
              )}
            </div>

            {/* Audio Level Indicator */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAutoTesting || micTested ? 'bg-blue-100' : 'bg-gray-200'}`}>
                    <MicrophoneIcon className={`w-4 h-4 ${isAutoTesting || micTested ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Microphone</span>
                </div>
                {micTested && (
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    Ready
                  </div>
                )}
              </div>
              
              {(isAutoTesting || micTested) && (
                <div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 bg-blue-500 rounded-full transition-all duration-150"
                      style={{ width: `${micLevel}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 text-center">
                    {isAutoTesting ? "Speak to test your microphone" : `Audio level: ${Math.round(micLevel)}%`}
                  </p>
                </div>
              )}
            </div>

            {/* Device Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg text-center transition-all ${
                videoTested 
                  ? 'bg-green-50 border border-green-200' 
                  : hasErrors 
                    ? 'bg-red-50 border border-red-200'
                    : isAutoTesting 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'bg-gray-50 border border-gray-200'
              }`}>
                <VideoCameraIcon className={`w-5 h-5 mx-auto mb-1 ${
                  videoTested ? 'text-green-600' : hasErrors ? 'text-red-600' : isAutoTesting ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="text-xs font-medium">
                  {videoTested ? 'Camera Ready' : hasErrors ? 'Camera Failed' : isAutoTesting ? 'Testing...' : 'Camera Pending'}
                </div>
              </div>
              
              <div className={`p-3 rounded-lg text-center transition-all ${
                micTested 
                  ? 'bg-green-50 border border-green-200' 
                  : hasErrors 
                    ? 'bg-red-50 border border-red-200'
                    : isAutoTesting 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'bg-gray-50 border border-gray-200'
              }`}>
                <MicrophoneIcon className={`w-5 h-5 mx-auto mb-1 ${
                  micTested ? 'text-green-600' : hasErrors ? 'text-red-600' : isAutoTesting ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="text-xs font-medium">
                  {micTested ? 'Mic Ready' : hasErrors ? 'Mic Failed' : isAutoTesting ? 'Testing...' : 'Mic Pending'}
                </div>
              </div>
            </div>

            {/* Helpful note when devices not found */}
            {hasErrors && cameraError?.includes("No camera or microphone found") && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Device Setup Help:</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>Make sure your camera and microphone are properly connected</li>
                    <li>Check if other applications are using your devices</li>
                    <li>Try refreshing the page after connecting devices</li>
                    <li>You can still proceed with the interview if needed</li>
                  </ul>
                </div>
              </div>
            )}

            {hasErrors && (
              <button
                onClick={retryDeviceTest}
                className="mt-4 w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                {t('errors.tryAgain')}
              </button>
            )}
          </div>

          {/* Simple Privacy Consent */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="privacyConsent"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-0.5 flex-shrink-0"
              />
              <label
                htmlFor="privacyConsent"
                className="cursor-pointer text-sm text-gray-900 font-medium"
              >
                I have read and agree to the{" "}
                <button
                  onClick={() => window.open("/privacy-policy", "_blank")}
                  className="text-blue-600 hover:text-blue-700 underline font-semibold"
                >
                  Privacy Policy
                </button>
                {" "}and consent to the recording of this interview.
              </label>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full sm:w-auto px-8 py-3 text-base font-medium"
          disabled={!canStartInterview || isStartingInterview}
          onClick={async () => {
            if (canStartInterview && !isStartingInterview) {
              setIsStartingInterview(true);
              
              // Show loading for 2 seconds
              setTimeout(() => {
                setIsStartingInterview(false);
                onStartInterview();
              }, 2000);
            }
          }}
        >
          {isStartingInterview ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>{t('interview.connecting')}</span>
            </div>
          ) : canStartInterview ? (
            t('interview.startInterview')
          ) : !consentGiven ? (
            t('permissions.denied')
          ) : isAutoTesting ? (
            t('interview.connecting')
          ) : (
            t('interview.waiting')
          )}
        </Button>

        <div className="flex items-center justify-center gap-6 mt-6">
          <button
            onClick={() => window.location.href = `/${locale}`}
            disabled={isStartingInterview}
            className={`text-sm transition-colors ${
              isStartingInterview
                ? "text-muted-foreground/50 cursor-not-allowed"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t('interview.cancel')}
          </button>
          <button
            onClick={() => window.open("/privacy-policy", "_blank")}
            disabled={isStartingInterview}
            className={`text-sm transition-colors ${
              isStartingInterview
                ? "text-muted-foreground/50 cursor-not-allowed"
                : "text-primary hover:text-primary/80"
            }`}
          >
            {t('permissions.refresh')}
          </button>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper
        title="Connection Error"
        description={error || "An unexpected error occurred while connecting."}
      >
        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
        </div>
        <div className="text-sm text-gray-500 mb-6 p-4 bg-gray-50/80 rounded-xl text-left">
          <p className="font-medium mb-2">
            This page requires specific URL parameters to function correctly.
            Please ensure you have the correct link.
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </PageWrapper>
    );
  }

  if (isConnecting) {
    return (
      <PageWrapper
        title="Connecting to Interview"
        description="Setting up your secure interview session. This won't take long."
      >
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-[#13ead9] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-[#0891b2]/30 border-b-transparent rounded-full animate-spin animation-delay-150 mx-auto"></div>
        </div>
      </PageWrapper>
    );
  }

  if (!isConnected) {
    return (
      <PageWrapper
        title="Waiting for Connection"
        description="Establishing connection to the interview room. Please wait."
      >
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <VideoCameraSlashIcon className="w-10 h-10 text-slate-500" />
        </div>
      </PageWrapper>
    );
  }

  return null;
}
