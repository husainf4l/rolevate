import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "pulse" | "wave" | "orbit" | "modern";
  className?: string;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = "md",
  variant = "modern",
  className,
  text,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const renderSpinner = () => (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        className
      )}
    />
  );

  const renderDots = () => (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full bg-current animate-pulse",
            size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-3 h-3"
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div
      className={cn(
        "rounded-full bg-current animate-pulse",
        sizeClasses[size],
        className
      )}
    />
  );

  const renderWave = () => (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-current rounded-sm animate-pulse",
            size === "sm" ? "w-1 h-3" : size === "md" ? "w-1 h-4" : "w-1 h-6"
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: "1.2s",
          }}
        />
      ))}
    </div>
  );

  const renderOrbit = () => (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className="absolute inset-0 rounded-full border-2 border-current border-t-transparent animate-spin" />
      <div
        className="absolute inset-0 rounded-full border-2 border-current border-t-transparent animate-spin"
        style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
      />
    </div>
  );

  const renderModern = () => (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent animate-spin" />
      <div className="absolute inset-1 rounded-full bg-background" />
      <div className="absolute inset-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse" />
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case "spinner":
        return renderSpinner();
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      case "wave":
        return renderWave();
      case "orbit":
        return renderOrbit();
      case "modern":
        return renderModern();
      default:
        return renderModern();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      {renderLoader()}
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

// Skeleton loader component
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular" | "rounded";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rectangular",
  width,
  height,
  lines = 1,
  ...props
}) => {
  const baseClasses = "animate-pulse bg-muted rounded-md";
  
  const variantClasses = {
    text: "h-4 w-full",
    rectangular: "h-4 w-full",
    circular: "rounded-full",
    rounded: "rounded-lg",
  };

  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              variantClasses[variant],
              i === lines - 1 ? "w-3/4" : "w-full",
              className
            )}
            style={i === lines - 1 ? { ...style, width: "75%" } : style}
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
      {...props}
    />
  );
};

export { Loading, Skeleton };
