import React from "react";

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  height?: string;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  className = "",
  height = "400px",
}) => {
  return (
    <div
      className={`overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800 ${className}`}
      style={{ maxHeight: height }}
    >
      {children}
    </div>
  );
};
