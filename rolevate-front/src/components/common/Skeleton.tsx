"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  animate?: boolean;
}

export function Skeleton({
  className = "",
  width = "100%",
  height = "1rem",
  rounded = "sm",
  animate = true,
}: SkeletonProps) {
  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  return (
    <div
      className={`
        bg-gray-200 
        ${animate ? "animate-pulse" : ""} 
        ${roundedClasses[rounded]} 
        ${className}
      `}
      style={{ width, height }}
    />
  );
}

interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  lines?: number;
}

export function SkeletonCard({
  className = "",
  showImage = false,
  lines = 3,
}: SkeletonCardProps) {
  return (
    <div className={`p-6 bg-white rounded-lg shadow-sm border ${className}`}>
      {showImage && (
        <Skeleton
          className="mb-4"
          width="100%"
          height="12rem"
          rounded="md"
        />
      )}
      
      <Skeleton
        className="mb-3"
        width="75%"
        height="1.5rem"
        rounded="md"
      />
      
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className="mb-2"
          width={index === lines - 1 ? "60%" : "100%"}
          height="1rem"
          rounded="sm"
        />
      ))}
      
      <div className="flex justify-between items-center mt-4">
        <Skeleton width="6rem" height="2rem" rounded="md" />
        <Skeleton width="4rem" height="1rem" rounded="sm" />
      </div>
    </div>
  );
}

interface SkeletonJobCardProps {
  className?: string;
}

export function SkeletonJobCard({ className = "" }: SkeletonJobCardProps) {
  return (
    <div className={`p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${className}`}>
      {/* Header with company logo and title */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton width="3rem" height="3rem" rounded="full" />
          <div>
            <Skeleton width="12rem" height="1.25rem" rounded="md" className="mb-2" />
            <Skeleton width="8rem" height="1rem" rounded="sm" />
          </div>
        </div>
        <Skeleton width="5rem" height="1.5rem" rounded="full" />
      </div>

      {/* Job details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-4">
          <Skeleton width="6rem" height="1rem" rounded="sm" />
          <Skeleton width="8rem" height="1rem" rounded="sm" />
          <Skeleton width="7rem" height="1rem" rounded="sm" />
        </div>
        <Skeleton width="100%" height="3rem" rounded="md" />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton 
            key={index}
            width={`${Math.random() * 3 + 4}rem`} 
            height="1.5rem" 
            rounded="full" 
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Skeleton width="8rem" height="1rem" rounded="sm" />
        <div className="flex space-x-2">
          <Skeleton width="4rem" height="2rem" rounded="md" />
          <Skeleton width="6rem" height="2rem" rounded="md" />
        </div>
      </div>
    </div>
  );
}

interface SkeletonDashboardWidgetProps {
  className?: string;
  title?: boolean;
  chart?: boolean;
}

export function SkeletonDashboardWidget({
  className = "",
  title = true,
  chart = false,
}: SkeletonDashboardWidgetProps) {
  return (
    <div className={`p-6 bg-white rounded-lg shadow-sm border ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <Skeleton width="8rem" height="1.5rem" rounded="md" />
          <Skeleton width="2rem" height="2rem" rounded="full" />
        </div>
      )}
      
      {chart ? (
        <div className="space-y-4">
          <Skeleton width="100%" height="12rem" rounded="md" />
          <div className="flex justify-center space-x-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton width="3rem" height="1rem" rounded="sm" className="mb-1" />
                <Skeleton width="2rem" height="0.75rem" rounded="sm" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton width="2.5rem" height="2.5rem" rounded="full" />
                <div>
                  <Skeleton width="10rem" height="1rem" rounded="sm" className="mb-1" />
                  <Skeleton width="6rem" height="0.75rem" rounded="sm" />
                </div>
              </div>
              <Skeleton width="3rem" height="1.5rem" rounded="md" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Skeleton;