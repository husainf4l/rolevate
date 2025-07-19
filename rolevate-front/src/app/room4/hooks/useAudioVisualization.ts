import { useState, useEffect, useCallback } from "react";

export function useAudioVisualization(isMicEnabled: boolean) {
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(45).fill(0));
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // Initialize audio analysis when mic is enabled
  useEffect(() => {
    if (!isMicEnabled) {
      setAudioLevels(Array(45).fill(0));
      if (audioContext) {
        audioContext.close();
        setAudioContext(null);
        setAnalyser(null);
      }
      return;
    }

    const setupAudioAnalysis = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const analyserNode = context.createAnalyser();
        
        analyserNode.fftSize = 128;
        source.connect(analyserNode);
        
        setAudioContext(context);
        setAnalyser(analyserNode);
        return undefined;
      } catch (error) {
        console.warn("Could not access microphone for audio analysis:", error);
        // Fallback to simulation
        const interval = setInterval(() => {
          const newLevels = Array.from({ length: 45 }, () => Math.random() * 0.3);
          setAudioLevels(newLevels);
        }, 100);
        return () => clearInterval(interval);
      }
    };

    setupAudioAnalysis();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isMicEnabled, audioContext]);

  // Update audio levels from analyser
  useEffect(() => {
    if (!analyser || !isMicEnabled) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateAudioLevels = () => {
      analyser.getByteFrequencyData(dataArray);
      
      const newLevels = Array.from({ length: 45 }, (_, i) => {
        const dataIndex = Math.floor((i / 45) * dataArray.length);
        const rawLevel = (dataArray[dataIndex] || 0) / 255;
        return Math.max(0.05, rawLevel);
      });
      
      setAudioLevels(newLevels);
      requestAnimationFrame(updateAudioLevels);
    };

    updateAudioLevels();
  }, [analyser, isMicEnabled]);

  const hasAudioActivity = useCallback(() => {
    return isMicEnabled && audioLevels.some(level => level > 0.5);
  }, [isMicEnabled, audioLevels]);

  return {
    audioLevels,
    hasAudioActivity: hasAudioActivity()
  };
}