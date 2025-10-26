'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, Check, AlertCircle, Video, MicOff, VideoOff } from 'lucide-react';
import LogoIcon from '@/components/common/logo-icon';

const MotionDiv = motion.div;

interface PreRoomSetupProps {
  onComplete: () => void;
}

export function PreRoomSetup({ onComplete }: PreRoomSetupProps) {
  const [step, setStep] = useState<'privacy' | 'test'>('privacy');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraMuted, setIsCameraMuted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  // Callback ref to handle video element when it mounts
  const videoRef = useCallback((videoElement: HTMLVideoElement | null) => {
    console.log('Video ref callback called:', !!videoElement, 'stream:', !!stream);
    if (videoElement && stream) {
      console.log('Setting srcObject in callback ref');
      videoElement.srcObject = stream;
      videoElement.play().then(() => {
        console.log('Video playing from callback');
        setIsVideoReady(true);
      }).catch(err => {
        console.error('Play error in callback:', err);
        setIsVideoReady(true);
      });
    }
  }, [stream]);

  // Request permissions automatically after privacy acceptance
  const handleContinue = async () => {
    console.log('handleContinue called');
    try {
      setPermissionError(null);
      console.log('Requesting media permissions...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      
      console.log('Media stream obtained:', mediaStream.getTracks());
      setStream(mediaStream);
      setStep('test');
    } catch (error: any) {
      console.error('Permission error:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionError('Camera and microphone access denied. Please allow access in your browser settings and try again.');
      } else {
        setPermissionError('Failed to access camera and microphone. Please check your device settings.');
      }
    }
  };

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Toggle camera
  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraMuted(!videoTrack.enabled);
      }
    }
  };

  // Toggle mic
  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  // Handle complete
  const handleComplete = () => {
    // Keep stream alive - will be used by room
    onComplete();
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {/* Privacy Step */}
        {step === 'privacy' && (
          <MotionDiv
            key="privacy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md w-full"
          >
            <div className="bg-white backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-slate-200 shadow-2xl">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <LogoIcon size={64} />
              </div>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-4">
                Interview Setup
              </h2>
              <p className="text-slate-600 text-center mb-8">
                Before we begin, please review our privacy policy
              </p>

              {/* Privacy Notice */}
              <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-200">
                <h3 className="text-slate-900 font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-[#0891b2]" />
                  Privacy & Recording
                </h3>
                                <ul className="space-y-3 text-slate-600">
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0891b2]/10 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-[#0891b2]" />
                    </div>
                    <p>This interview will be recorded for evaluation and training purposes</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0891b2]/10 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-[#0891b2]" />
                    </div>
                    <p>Your camera and microphone will be accessed during the interview</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0891b2]/10 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-[#0891b2]" />
                    </div>
                    <p>By continuing, you consent to these terms</p>
                  </li>
                </ul>
              </div>

              {/* Checkbox */}
              <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded-md peer-checked:bg-[#0891b2] peer-checked:border-[#0891b2] transition-all duration-200 flex items-center justify-center">
                    {privacyAccepted && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>
                <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                  I understand and accept the privacy terms. I consent to being recorded during this interview.
                </span>
              </label>

              {/* Error Message */}
              {permissionError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <p className="text-red-600 text-sm text-center">
                    {permissionError}
                  </p>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={!privacyAccepted}
                className="w-full py-4 bg-[#0891b2] hover:bg-[#0e7490] disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 disabled:text-slate-400"
              >
                Continue to Setup
              </button>
            </div>
          </MotionDiv>
        )}

        {/* Test Step */}
        {step === 'test' && (
          <MotionDiv
            key="test"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl w-full"
          >
            <div className="bg-white backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl">
              {/* Logo */}
              <div className="flex justify-center mb-4">
                <LogoIcon size={48} />
              </div>

              {/* Title */}
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 text-center mb-2">
                Test Your Setup
              </h2>
              <p className="text-slate-600 text-center mb-6">
                Make sure your camera and microphone are working properly
              </p>

              {/* Video Preview */}
              <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden mb-6">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={(e) => {
                    console.log('Video metadata loaded', e.currentTarget.readyState);
                    setIsVideoReady(true);
                  }}
                  onPlay={() => {
                    console.log('Video started playing');
                    setIsVideoReady(true);
                  }}
                  className="w-full h-full object-cover mirror"
                  style={{ transform: 'scaleX(-1)' }}
                />
                {!isVideoReady && !isCameraMuted && (
                  <div className="absolute inset-0 bg-slate-800 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="w-12 h-12 border-3 border-slate-600 border-t-[#0891b2] rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-slate-400 text-sm">Loading camera...</p>
                    </div>
                  </div>
                )}
                {isCameraMuted && (
                  <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-10">
                    <div className="text-center">
                      <VideoOff className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600 text-sm">Camera is off</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={toggleMic}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isMicMuted
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                >
                  {isMicMuted ? (
                    <MicOff className="h-5 w-5 text-white" />
                  ) : (
                    <Mic className="h-5 w-5 text-slate-700" />
                  )}
                </button>

                <button
                  onClick={toggleCamera}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isCameraMuted
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                >
                  {isCameraMuted ? (
                    <VideoOff className="h-5 w-5 text-white" />
                  ) : (
                    <Video className="h-5 w-5 text-slate-700" />
                  )}
                </button>
              </div>

              {/* Ready Checklist */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-6">
                <h3 className="text-slate-900 font-semibold mb-3">Ready to start?</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Check className="h-4 w-4 text-[#0891b2]" />
                    <span>Can you see yourself clearly?</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Check className="h-4 w-4 text-[#0891b2]" />
                    <span>Is your microphone working?</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Check className="h-4 w-4 text-[#0891b2]" />
                    <span>Are you in a quiet environment?</span>
                  </div>
                </div>
              </div>

              {/* Start Interview Button */}
              <button
                onClick={handleComplete}
                className="w-full py-4 bg-[#0891b2] hover:bg-[#0e7490] text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Check className="h-5 w-5" />
                Start Interview
              </button>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}
