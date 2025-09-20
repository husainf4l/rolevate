import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  navigationStart: number;
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number | null;
  firstContentfulPaint: number | null;
}

interface PerformanceState {
  metrics: PerformanceMetrics;
  isSupported: boolean;
  connection: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  } | null;
}

export const usePerformance = () => {
  const [state, setState] = useState<PerformanceState>({
    metrics: {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null,
      navigationStart: 0,
      loadTime: 0,
      domContentLoaded: 0,
      firstPaint: null,
      firstContentfulPaint: null,
    },
    isSupported: false,
    connection: null,
  });

  useEffect(() => {
    // Check if Performance API is supported
    if (!('performance' in window)) {
      return;
    }

    setState(prev => ({ ...prev, isSupported: true }));

    // Get navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      setState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          navigationStart: navigation.navigationStart,
          loadTime: navigation.loadEventEnd - navigation.navigationStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          ttfb: navigation.responseStart - navigation.navigationStart,
        },
      }));
    }

    // Get paint timing
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-paint') {
        setState(prev => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            firstPaint: entry.startTime,
          },
        }));
      }
      if (entry.name === 'first-contentful-paint') {
        setState(prev => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            firstContentfulPaint: entry.startTime,
          },
        }));
      }
    });

    // Get connection information
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setState(prev => ({
        ...prev,
        connection: {
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
        },
      }));
    }

    // Set up Web Vitals monitoring
    const setupWebVitals = () => {
      // LCP (Largest Contentful Paint)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setState(prev => ({
            ...prev,
            metrics: {
              ...prev.metrics,
              lcp: lastEntry.startTime,
            },
          }));
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            setState(prev => ({
              ...prev,
              metrics: {
                ...prev.metrics,
                fid: entry.processingStart - entry.startTime,
              },
            }));
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              setState(prev => ({
                ...prev,
                metrics: {
                  ...prev.metrics,
                  cls: clsValue,
                },
              }));
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      }
    };

    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      setupWebVitals();
    } else {
      window.addEventListener('load', setupWebVitals);
    }

    return () => {
      window.removeEventListener('load', setupWebVitals);
    };
  }, []);

  const getPerformanceScore = (): number => {
    const { lcp, fid, cls } = state.metrics;
    let score = 100;

    // LCP scoring (Good: <2.5s, Needs Improvement: 2.5-4s, Poor: >4s)
    if (lcp !== null) {
      if (lcp > 4000) score -= 30;
      else if (lcp > 2500) score -= 15;
    }

    // FID scoring (Good: <100ms, Needs Improvement: 100-300ms, Poor: >300ms)
    if (fid !== null) {
      if (fid > 300) score -= 25;
      else if (fid > 100) score -= 10;
    }

    // CLS scoring (Good: <0.1, Needs Improvement: 0.1-0.25, Poor: >0.25)
    if (cls !== null) {
      if (cls > 0.25) score -= 25;
      else if (cls > 0.1) score -= 10;
    }

    return Math.max(0, score);
  };

  const getPerformanceGrade = (): 'A' | 'B' | 'C' | 'D' | 'F' => {
    const score = getPerformanceScore();
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getPerformanceInsights = (): string[] => {
    const insights: string[] = [];
    const { lcp, fid, cls, loadTime } = state.metrics;

    if (lcp && lcp > 4000) {
      insights.push('Largest Contentful Paint is slow. Consider optimizing images and reducing server response time.');
    }

    if (fid && fid > 300) {
      insights.push('First Input Delay is high. Consider reducing JavaScript execution time.');
    }

    if (cls && cls > 0.25) {
      insights.push('Cumulative Layout Shift is high. Ensure images and ads have dimensions.');
    }

    if (loadTime && loadTime > 3000) {
      insights.push('Page load time is slow. Consider code splitting and lazy loading.');
    }

    if (state.connection && state.connection.effectiveType === 'slow-2g') {
      insights.push('Connection is slow. Consider implementing offline functionality.');
    }

    return insights;
  };

  const logPerformanceMetrics = () => {
    console.group('🚀 Performance Metrics');
    console.log('LCP:', state.metrics.lcp, 'ms');
    console.log('FID:', state.metrics.fid, 'ms');
    console.log('CLS:', state.metrics.cls);
    console.log('FCP:', state.metrics.firstContentfulPaint, 'ms');
    console.log('Load Time:', state.metrics.loadTime, 'ms');
    console.log('Performance Score:', getPerformanceScore());
    console.log('Grade:', getPerformanceGrade());
    console.log('Connection:', state.connection);
    console.groupEnd();
  };

  return {
    ...state,
    getPerformanceScore,
    getPerformanceGrade,
    getPerformanceInsights,
    logPerformanceMetrics,
  };
};
