'use client';

import { useEffect } from 'react';

export function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Track LCP (Largest Contentful Paint)
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-contentful-paint') {
            console.log('FCP:', entry.startTime);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-contentful-paint'] });
      } catch (e) {
        // Fallback for browsers that don't support the observer
        console.warn('Performance observer not supported');
      }

      // Track resource loading times
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const resources = performance.getEntriesByType('resource');
        
        console.log('Page Load Performance:', {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          loadComplete: navigation.loadEventEnd - navigation.fetchStart,
          firstByte: navigation.responseStart - navigation.fetchStart,
          resourceCount: resources.length,
          largestResource: Math.max(...resources.map(r => r.duration)),
        });
      });

      return () => {
        observer.disconnect();
      };
    }
    
    return undefined;
  }, []);

  return null;
}

export default PerformanceMonitor;
