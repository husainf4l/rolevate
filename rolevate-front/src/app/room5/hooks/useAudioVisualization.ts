import { useRef, useEffect } from "react";
import { Participant, Track } from "livekit-client";

export function useAudioVisualization(participant: Participant) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!participant || !canvasRef.current) return;

    const audioTrack = participant.getTrackPublication(Track.Source.Microphone)?.track?.mediaStreamTrack;
    if (!audioTrack) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
    source.connect(analyser);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    let animationFrameId: number;

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        if (value !== undefined) {
          barHeight = value / 2;
          canvasCtx.fillStyle = `rgba(19, 234, 217, ${barHeight / 100})`;
          canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      source.disconnect();
      audioContext.close();
    };
  }, [participant]);

  return { canvasRef };
}
