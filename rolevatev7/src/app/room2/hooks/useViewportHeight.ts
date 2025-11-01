'use client';

import { useEffect, useState } from 'react';

export function useViewportHeight() {
  const [viewportHeight, setViewportHeight] = useState<number>(0);

  useEffect(() => {
    // Function to set the viewport height and safe areas
    const setVH = () => {
      // Get the actual viewport height
      const vh = window.visualViewport?.height || window.innerHeight;
      const vw = window.visualViewport?.width || window.innerWidth;
      setViewportHeight(vh);
      
      // Set CSS custom properties for viewport
      document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
      document.documentElement.style.setProperty('--real-vh', `${vh}px`);
      document.documentElement.style.setProperty('--real-vw', `${vw}px`);
      
      // Calculate browser UI space (difference between window and visual viewport)
      const browserUIHeight = window.innerHeight - vh;
      const browserUIWidth = window.innerWidth - vw;
      
      // Set browser UI compensation
      document.documentElement.style.setProperty('--browser-ui-height', `${browserUIHeight}px`);
      document.documentElement.style.setProperty('--browser-ui-width', `${browserUIWidth}px`);
      
      // Try to get safe area insets from CSS if available
      const computedStyle = getComputedStyle(document.documentElement);
      const safeAreaTop = computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0px';
      const safeAreaRight = computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0px';
      const safeAreaBottom = computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0px';
      const safeAreaLeft = computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0px';
      
      // Set safe area fallbacks
      document.documentElement.style.setProperty('--safe-area-top-fallback', safeAreaTop || '0px');
      document.documentElement.style.setProperty('--safe-area-right-fallback', safeAreaRight || '0px');
      document.documentElement.style.setProperty('--safe-area-bottom-fallback', safeAreaBottom || '0px');
      document.documentElement.style.setProperty('--safe-area-left-fallback', safeAreaLeft || '0px');
    };

    // Set initial values
    setVH();

    // Listen for viewport changes (address bar showing/hiding)
    const handleResize = () => {
      // Use requestAnimationFrame to avoid excessive calls
      requestAnimationFrame(setVH);
    };

    const handleVisualViewportChange = () => {
      requestAnimationFrame(setVH);
    };

    // Listen to window resize
    window.addEventListener('resize', handleResize);
    
    // Listen to visual viewport changes (better for mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
    }

    // Listen to orientation changes
    window.addEventListener('orientationchange', () => {
      // Delay to allow orientation to complete
      setTimeout(setVH, 100);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
      }
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  return viewportHeight;
}