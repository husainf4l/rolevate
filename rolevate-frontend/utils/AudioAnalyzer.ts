import { Track } from 'livekit-client';

// Simple class to detect audio activity from a LiveKit track
export class AudioAnalyzer {
  private track: Track;
  private audioContext: AudioContext | undefined;
  private analyser: AnalyserNode | undefined;
  private dataArray: Uint8Array | undefined;
  private source: MediaStreamAudioSourceNode | undefined;
  private interval: NodeJS.Timeout | undefined;
  private threshold = 25; // Adjust this threshold for sensitivity
  private listeners: { [key: string]: Array<() => void> } = {
    'speaking': [],
    'stopped_speaking': []
  };
  private isSpeaking = false;

  constructor(track: Track) {
    this.track = track;
    this.init();
  }

  private init() {
    try {
      if (!this.track.mediaStream) return;

      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      this.source = this.audioContext.createMediaStreamSource(this.track.mediaStream);
      this.source.connect(this.analyser);

      // Check audio levels at regular intervals
      this.interval = setInterval(() => this.checkAudioLevel(), 100);
    } catch (e) {
      console.error('Failed to initialize audio analyzer:', e);
    }
  }

  private checkAudioLevel() {
    if (!this.analyser || !this.dataArray) return;

    this.analyser.getByteFrequencyData(this.dataArray);
    const average = this.dataArray.reduce((acc, val) => acc + val, 0) / this.dataArray.length;
    
    if (average > this.threshold && !this.isSpeaking) {
      this.isSpeaking = true;
      this.emit('speaking');
    } else if (average <= this.threshold && this.isSpeaking) {
      this.isSpeaking = false;
      this.emit('stopped_speaking');
    }
  }

  on(event: string, callback: () => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: () => void) {
    if (!this.listeners[event]) return;
    
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  private emit(event: string) {
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach(callback => {
      try {
        callback();
      } catch (e) {
        console.error(`Error in event listener for ${event}:`, e);
      }
    });
  }

  destroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    
    if (this.source) {
      this.source.disconnect();
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    this.listeners = {
      'speaking': [],
      'stopped_speaking': []
    };
  }
}
