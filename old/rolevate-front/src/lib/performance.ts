import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

// Extend global for gtag
declare global {
  function gtag(...args: any[]): void;
}

// Performance monitoring utility
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private vitals: Record<string, number> = {};

  private constructor() {
    this.initializeVitalsCollection();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeVitalsCollection() {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Collect Core Web Vitals
    onCLS((metric: Metric) => {
      this.vitals.CLS = metric.value;
      this.reportVital('CLS', metric);
    });

    onINP((metric: Metric) => {
      this.vitals.INP = metric.value;
      this.reportVital('INP', metric);
    });

    onFCP((metric: Metric) => {
      this.vitals.FCP = metric.value;
      this.reportVital('FCP', metric);
    });

    onLCP((metric: Metric) => {
      this.vitals.LCP = metric.value;
      this.reportVital('LCP', metric);
    });

    onTTFB((metric: Metric) => {
      this.vitals.TTFB = metric.value;
      this.reportVital('TTFB', metric);
    });
  }

  private reportVital(name: string, metric: any) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}:`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta
      });
    }

    // Send to analytics service (replace with your analytics endpoint)
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(name, metric);
    }
  }

  private async sendToAnalytics(name: string, metric: Metric) {
    try {
      const analyticsData = {
        name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      };

      // Example: Send to Google Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'web_vital', {
          event_category: 'Web Vitals',
          event_label: name,
          value: Math.round(name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }

      // Example: Send to custom analytics endpoint
      await fetch('/api/analytics/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyticsData)
      }).catch(() => {
        // Silently fail if analytics endpoint is not available
      });
    } catch (error) {
      console.error('Failed to send vital to analytics:', error);
    }
  }

  public getVitals() {
    return { ...this.vitals };
  }

  public getCurrentVitals() {
    return { ...this.vitals };
  }

  // Performance measurement utilities
  public measureNavigationTiming() {
    if (typeof window === 'undefined' || !window.performance) return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return null;

    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      domComplete: navigation.domComplete - navigation.fetchStart,
      loadComplete: navigation.loadEventEnd - navigation.fetchStart,
      firstByte: navigation.responseStart - navigation.requestStart,
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnect: navigation.connectEnd - navigation.connectStart,
      sslConnect: navigation.secureConnectionStart > 0 
        ? navigation.connectEnd - navigation.secureConnectionStart 
        : 0,
      redirect: navigation.redirectEnd - navigation.redirectStart,
      unload: navigation.unloadEventEnd - navigation.unloadEventStart
    };
  }

  public measureResourceTiming() {
    if (typeof window === 'undefined' || !window.performance) return [];

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resources.map(resource => ({
      name: resource.name,
      type: this.getResourceType(resource.name),
      duration: resource.duration,
      size: resource.transferSize,
      cached: resource.transferSize === 0 && resource.duration > 0
    }));
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet'; 
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
    return 'other';
  }

  public getMemoryUsage() {
    if (typeof window === 'undefined' || !(performance as any).memory) return null;

    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedPercent: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
    };
  }

  // Start monitoring
  public startMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn('[Performance] Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Longtask API not supported
      }
    }

    // Monitor layout shifts
    if ('PerformanceObserver' in window) {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          const layoutShift = entry as any;
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value;
          }
        }
        if (clsValue > 0.1) { // CLS threshold
          console.warn('[Performance] Cumulative Layout Shift detected:', clsValue);
        }
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Layout shift API not supported
      }
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Helper function for Next.js reportWebVitals
export function reportWebVitals(metric: any) {
  performanceMonitor['reportVital'](metric.name, metric);
}

// Types for better TypeScript support
export interface PerformanceMetrics {
  CLS?: number;
  FID?: number;
  FCP?: number;
  LCP?: number;
  TTFB?: number;
}

export interface NavigationMetrics {
  domContentLoaded: number;
  domComplete: number;
  loadComplete: number;
  firstByte: number;
  dnsLookup: number;
  tcpConnect: number;
  sslConnect: number;
  redirect: number;
  unload: number;
}

export interface ResourceMetrics {
  name: string;
  type: string;
  duration: number;
  size: number;
  cached: boolean;
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedPercent: number;
}