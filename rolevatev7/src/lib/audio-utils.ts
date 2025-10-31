// Audio utilities for handling production environment issues

export const isProductionSSL = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'https:' && !window.location.hostname.includes('localhost');
};

export const detectAudioContext = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window.AudioContext || (window as any).webkitAudioContext);
};

export const unlockAudioContext = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    
    if (audioContext.state === 'suspended') {
      console.log('🔓 Attempting to unlock audio context...');
      await audioContext.resume();
    }
    
    // Create a silent buffer to test audio
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
    
    console.log('✅ Audio context unlocked successfully');
    return true;
  } catch (error) {
    console.warn('⚠️ Failed to unlock audio context:', error);
    return false;
  }
};

export const debugAudioEnvironment = (): void => {
  if (typeof window === 'undefined') return;
  
  console.group('🎵 Audio Environment Debug');
  console.log('Protocol:', window.location.protocol);
  console.log('Hostname:', window.location.hostname);
  console.log('Is Production SSL:', isProductionSSL());
  console.log('Has AudioContext:', detectAudioContext());
  console.log('User Agent:', navigator.userAgent);
  
  // Check for audio elements
  const audioElements = document.querySelectorAll('audio');
  const videoElements = document.querySelectorAll('video');
  console.log('Audio elements count:', audioElements.length);
  console.log('Video elements count:', videoElements.length);
  
  // Check for autoplay policy
  if ('getAutoplayPolicy' in navigator) {
    console.log('Autoplay policy:', (navigator as any).getAutoplayPolicy('mediaelement'));
  }
  
  console.groupEnd();
};

export const testAudioPlayback = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Create a test audio element
    const testAudio = new Audio();
    testAudio.muted = true; // Start muted to avoid autoplay restrictions
    
    // Create a silent data URL audio
    testAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMbBjiR2vbVhSYCKYTO89qJNgQZZ7zq4Z5NBQxRqOPutmUiUCz';
    
    const playPromise = testAudio.play();
    if (playPromise !== undefined) {
      await playPromise;
      testAudio.pause();
      testAudio.remove();
      console.log('✅ Test audio playback successful');
      return true;
    }
    return false;
  } catch (error) {
    console.warn('⚠️ Test audio playback failed:', error);
    return false;
  }
};