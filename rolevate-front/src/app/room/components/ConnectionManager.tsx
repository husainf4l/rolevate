import React, { useState, useRef, useEffect } from "react";
import {
  VideoCameraIcon,
  ExclamationTriangleIcon,
  VideoCameraSlashIcon,
  MicrophoneIcon,
} from "@heroicons/react/24/outline";
import ParticleBackground from "@/components/interview/ParticleBackground";

interface ConnectionManagerProps {
  needsPermission: boolean;
  error: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  onStartInterview: () => void;
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
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4 relative overflow-hidden">
    <ParticleBackground />
    <div className="relative z-10 w-full max-w-4xl text-center">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-12 animate-in slide-in-from-bottom-4 duration-500">
        {children}
        <h2 className="text-2xl font-bold text-gray-900 mb-3 mt-8 font-display tracking-tight">
          {title}
        </h2>
        <p className="text-gray-600 mb-8 font-text leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      </div>
    </div>
  </div>
);

const PrimaryButton = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className="w-full bg-gradient-to-r from-[#13ead9] to-[#0891b2] hover:from-[#0891b2] hover:to-[#13ead9] text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#13ead9] focus:ring-offset-2"
  >
    {children}
  </button>
);

export function ConnectionManager({
  needsPermission,
  error,
  isConnecting,
  isConnected,
  onStartInterview,
}: ConnectionManagerProps) {
  const [consentGiven, setConsentGiven] = useState(false);
  const [showDeviceTest, setShowDeviceTest] = useState(false);
  const [micTested, setMicTested] = useState(false);
  const [videoTested, setVideoTested] = useState(false);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [isTestingVideo, setIsTestingVideo] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isStartingInterview, setIsStartingInterview] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Cleanup function
  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (audioContext) {
      audioContext.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  // Test camera function
  const testCamera = async () => {
    try {
      setIsTestingVideo(true);
      setCameraError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setStream(mediaStream);
      setVideoTested(true);
      setIsTestingVideo(false);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setIsTestingVideo(false);

      let errorMessage = "Camera access failed";
      if (
        err.name === "NotFoundError" ||
        err.message?.includes("Requested device not found")
      ) {
        errorMessage =
          "No camera found. Please connect a camera and try again.";
      } else if (err.name === "NotAllowedError") {
        errorMessage =
          "Camera access denied. Please allow camera permission and try again.";
      } else if (err.name === "NotReadableError") {
        errorMessage = "Camera is being used by another application.";
      } else if (err.name === "OverconstrainedError") {
        errorMessage = "Camera doesn't meet the requirements.";
      }

      setCameraError(errorMessage);
    }
  };

  // Test microphone function
  const testMicrophone = async () => {
    try {
      setIsTestingMic(true);
      setMicError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      const audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const analyserNode = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(mediaStream);

      analyserNode.fftSize = 256;
      source.connect(analyserNode);

      setAudioContext(audioCtx);

      const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

      const updateMicLevel = () => {
        analyserNode.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setMicLevel(Math.min(100, (average / 128) * 100));

        if (isTestingMic) {
          animationFrameRef.current = requestAnimationFrame(updateMicLevel);
        }
      };

      updateMicLevel();

      // Auto-complete test after 3 seconds of detection
      setTimeout(() => {
        setMicTested(true);
        setIsTestingMic(false);
        mediaStream.getTracks().forEach((track) => track.stop());
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      }, 3000);
    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      setIsTestingMic(false);

      let errorMessage = "Microphone access failed";
      if (
        err.name === "NotFoundError" ||
        err.message?.includes("Requested device not found")
      ) {
        errorMessage =
          "No microphone found. Please connect a microphone and try again.";
      } else if (err.name === "NotAllowedError") {
        errorMessage =
          "Microphone access denied. Please allow microphone permission and try again.";
      } else if (err.name === "NotReadableError") {
        errorMessage = "Microphone is being used by another application.";
      } else if (err.name === "OverconstrainedError") {
        errorMessage = "Microphone doesn't meet the requirements.";
      }

      setMicError(errorMessage);
    }
  };

  // Show device testing after consent is given
  if (consentGiven && showDeviceTest) {
    return (
      <PageWrapper
        title="Device Testing"
        description="Let's make sure your camera and microphone are working properly before starting the interview."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Video Test */}
          <div className="flex flex-col items-center text-center">
            <div className="w-full bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 h-48 flex items-center justify-center mb-4 overflow-hidden relative">
              {videoTested || isTestingVideo ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover rounded-lg"
                  muted
                  playsInline
                  autoPlay
                />
              ) : cameraError ? (
                <div className="text-center p-4">
                  <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-red-600 font-medium">
                    {cameraError}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Live video preview will appear here
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Click "Test Camera" to start
                  </p>
                </div>
              )}
              {isTestingVideo && !videoTested && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm">Starting camera...</p>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={testCamera}
              disabled={isTestingVideo}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                videoTested
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : cameraError
                  ? "bg-red-100 text-red-800 border border-red-200 hover:bg-red-200"
                  : isTestingVideo
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  : "bg-[#0891b2] hover:bg-[#0fc4b5] text-white"
              }`}
            >
              {videoTested
                ? "✓ Camera Working"
                : cameraError
                ? "Try Again"
                : isTestingVideo
                ? "Starting Camera..."
                : "Test Camera"}
            </button>
          </div>

          {/* Right Column - Audio Test */}
          <div className="flex flex-col items-center text-center">
            <div className="w-full bg-gray-100 rounded-xl border border-gray-200 p-6 h-48 flex flex-col items-center justify-center mb-4">
              <div className="text-center">
                {micError ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-sm text-red-600 font-medium px-2">
                      {micError}
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
                        isTestingMic ? "bg-[#0891b2]" : "bg-gray-200"
                      }`}
                    >
                      <MicrophoneIcon
                        className={`w-8 h-8 ${
                          isTestingMic ? "text-white" : "text-gray-400"
                        }`}
                      />
                    </div>
                    {isTestingMic && (
                      <div className="mb-4">
                        <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto">
                          <div
                            className="h-2 bg-[#0891b2] rounded-full transition-all duration-150"
                            style={{ width: `${micLevel}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Speak to test your microphone
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Level: {Math.round(micLevel)}%
                        </p>
                      </div>
                    )}
                    {!isTestingMic && !micTested && (
                      <p className="text-sm text-gray-600">
                        Click "Test Microphone" to start
                      </p>
                    )}
                    {micTested && (
                      <p className="text-sm text-green-700">
                        ✓ Microphone is working
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            <button
              onClick={testMicrophone}
              disabled={isTestingMic && !micTested}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                micTested
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : micError
                  ? "bg-red-100 text-red-800 border border-red-200 hover:bg-red-200"
                  : isTestingMic
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  : "bg-[#0891b2] hover:bg-[#0fc4b5] text-white"
              }`}
            >
              {micTested
                ? "✓ Microphone Working"
                : micError
                ? "Try Again"
                : isTestingMic
                ? "Testing... (3s)"
                : "Test Microphone"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <PrimaryButton
            onClick={async () => {
              if (micTested && videoTested && !isStartingInterview) {
                setIsStartingInterview(true);

                // Show loading for 5 seconds
                setTimeout(() => {
                  setIsStartingInterview(false);
                  onStartInterview();
                }, 5000);
              }
            }}
          >
            {isStartingInterview ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Starting Interview...</span>
              </div>
            ) : micTested && videoTested ? (
              "Everything Looks Good - Start Interview"
            ) : (
              "Please test both camera and microphone"
            )}
          </PrimaryButton>

          <div className="flex items-center justify-center gap-4 text-sm">
            <button
              onClick={() => {
                if (!isStartingInterview) {
                  cleanup();
                  setShowDeviceTest(false);
                  setVideoTested(false);
                  setMicTested(false);
                  setMicLevel(0);
                  setCameraError(null);
                  setMicError(null);
                }
              }}
              disabled={isStartingInterview}
              className={`py-2 px-3 transition-colors rounded ${
                isStartingInterview
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Back to Setup
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => {
                if (!isStartingInterview) {
                  window.location.href = "/";
                }
              }}
              disabled={isStartingInterview}
              className={`py-2 px-3 transition-colors rounded ${
                isStartingInterview
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Cancel & Go Home
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (needsPermission) {
    return (
      <PageWrapper
        title="Interview Setup"
        description="Please review the recording policy and grant camera/microphone permissions to begin."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Permission Request */}
          <div className="flex flex-col items-center text-center">
            <div className="relative w-24 h-24 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
              <VideoCameraIcon className="w-12 h-12 text-white" />
              <div className="absolute inset-0 rounded-2xl border-2 border-[#13ead9]/50 animate-ping"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Camera & Microphone Access
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              We'll request access to your camera and microphone to conduct the
              interview.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 text-left">
              <div className="space-y-2 text-sm text-blue-800">
                <p>✓ Camera for video recording</p>
                <p>✓ Microphone for audio recording</p>
                <p>✓ Screen sharing (if required)</p>
              </div>
            </div>
          </div>

          {/* Right Column - Recording Consent */}
          <div className="text-left">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 h-full flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Recording Notice
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p>
                      This interview session will be recorded (video and audio)
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p>
                      Recording is used for evaluation and training purposes
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p>You can request recording deletion at any time</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="recordingConsent"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="w-5 h-5 text-[#0891b2] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#0891b2] focus:ring-offset-2 transition-all duration-200 mt-0.5"
                  />
                  <label
                    htmlFor="recordingConsent"
                    className="cursor-pointer text-sm text-gray-900 font-medium"
                  >
                    I consent to having my interview recorded and understand it
                    will be used for evaluation purposes.
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PrimaryButton
          onClick={() => {
            if (consentGiven) {
              setShowDeviceTest(true);
            }
          }}
        >
          {consentGiven
            ? "Grant Permissions & Test Devices"
            : "Please accept recording consent to continue"}
        </PrimaryButton>

        <div className="flex items-center justify-center gap-4 mt-4 text-sm">
          <button
            onClick={() => (window.location.href = "/")}
            className="text-gray-500 hover:text-gray-700 py-2 px-3 transition-colors hover:bg-gray-100 rounded"
          >
            Cancel & Go Home
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => (window.location.href = "/privacy-policy")}
            className="text-[#0891b2] hover:text-[#0fc4b5] py-2 px-3 transition-colors hover:bg-gray-50 rounded"
          >
            Privacy Policy
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
        <PrimaryButton onClick={() => window.location.reload()}>
          Try Again
        </PrimaryButton>
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
