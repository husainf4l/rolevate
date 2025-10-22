"use client";

import React, { Suspense, ComponentType } from "react";
import { LoadingSpinner } from "./Loading";

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function LazyWrapper({
  children,
  fallback,
  className = ""
}: LazyWrapperProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className={`flex items-center justify-center p-8 ${className}`}>
            <LoadingSpinner size="md" />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(importFunc);

  return function WithLazyLoading(props: P) {
    return (
      <LazyWrapper fallback={fallback}>
        <LazyComponent {...props} />
      </LazyWrapper>
    );
  };
}

// Dynamic import helper
export function lazyImport<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return React.lazy(importFunc);
}

// Preload helper for critical components
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  const preload = () => importFunc();
  return { preload, component: lazyImport(importFunc) };
}