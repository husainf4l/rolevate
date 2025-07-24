import { useState, useEffect, useCallback, useRef } from "react";

export function useAudioVisualization(isMicEnabled: boolean) {
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(45).fill(0));
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if we're on mobile and skip audio visualization entirely to prevent crashes
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Initialize audio analysis when mic is enabled (skip on mobile)
  useEffect(() => {
    // Completely skip audio visualization on mobile to prevent voice crashes
    if (isMobile) {
      setAudioLevels(Array(45).fill(0));
      return;
    }

    if (!isMicEnabled) {
      setAudioLevels(Array(45).fill(0));

      // Clean up existing resources
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
        setAudioContext(null);
        setAnalyser(null);
      }
      return;
    }

    const setupAudioAnalysis = async () => {
      try {
        // Check if we're on mobile and reduce resource usage
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: isMobile ? 16000 : 44100, // Lower sample rate on mobile
          }
        });

        streamRef.current = stream;

        const context = new AudioContext({
          sampleRate: isMobile ? 16000 : 44100, // Match sample rates
        });

        const source = context.createMediaStreamSource(stream);
        const analyserNode = context.createAnalyser();

        // Reduce FFT size on mobile to save memory
        analyserNode.fftSize = isMobile ? 64 : 128;
        source.connect(analyserNode);

        setAudioContext(context);
        setAnalyser(analyserNode);
        return undefined;
      } catch (error) {
        console.warn("Could not access microphone for audio analysis:", error);
        // Fallback to simulation with lower frequency on mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const interval = setInterval(() => {
          const newLevels = Array.from({ length: 45 }, () => Math.random() * 0.3);
          setAudioLevels(newLevels);
        }, isMobile ? 200 : 100); // Slower updates on mobile

        intervalRef.current = interval;
        return () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        };
      }
    };

    setupAudioAnalysis();

    return () => {
      // Clean up all resources
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [isMicEnabled]);

  // Update audio levels from analyser
  useEffect(() => {
    if (!analyser || !isMicEnabled) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const updateAudioLevels = () => {
      if (!analyser || !isMicEnabled) return;

      try {
        analyser.getByteFrequencyData(dataArray);

        const newLevels = Array.from({ length: 45 }, (_, i) => {
          const dataIndex = Math.floor((i / 45) * dataArray.length);
          const rawLevel = (dataArray[dataIndex] || 0) / 255;
          return Math.max(0.05, rawLevel);
        });

        setAudioLevels(newLevels);

        // Use a slower frame rate on mobile to reduce CPU usage
        const nextFrame = () => {
          animationFrameRef.current = requestAnimationFrame(updateAudioLevels);
        };

        if (isMobile) {
          setTimeout(nextFrame, 32); // ~30fps on mobile
        } else {
          nextFrame(); // 60fps on desktop
        }
      } catch (error) {
        console.warn("Error updating audio levels:", error);
        // Stop the animation if there's an error
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      }
    };

    updateAudioLevels();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [analyser, isMicEnabled]);

  const hasAudioActivity = useCallback(() => {
    return isMicEnabled && audioLevels.some(level => level > 0.5);
  }, [isMicEnabled, audioLevels]);

  return {
    audioLevels,
    hasAudioActivity: hasAudioActivity()
  };
}