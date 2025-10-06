"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

// Animation variants
export const buttonVariants = {
  idle: { scale: 1, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" },
  hover: { 
    scale: 1.02, 
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  },
};

export const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0
  },
  hover: { 
    y: -5,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
  }
};

export const pageVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0
  },
  exit: { 
    opacity: 0, 
    x: 20
  }
};

export const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.1,
      duration: 0.3
    }
  })
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.15 }
  }
};

export const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
};

// Enhanced Button Component
interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export function AnimatedButton({ 
  variant = "primary", 
  size = "md", 
  loading = false,
  children, 
  className = "",
  disabled,
  ...props 
}: AnimatedButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white hover:from-[#0fc4b5] hover:to-[#0891b2] focus:ring-[#0fc4b5]",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      variants={buttonVariants}
      initial="idle"
      whileHover={!disabled && !loading ? "hover" : "idle"}
      whileTap={!disabled && !loading ? "tap" : "idle"}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      {children}
    </motion.button>
  );
}

// Animated Card Component
interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function AnimatedCard({ 
  children, 
  className = "", 
  hoverEffect = true, 
  ...props 
}: AnimatedCardProps) {
  const hoverProps = hoverEffect ? { whileHover: "hover" } : {};
  
  return (
    <motion.div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      {...hoverProps}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Page Wrapper Component
interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className = "" }: AnimatedPageProps) {
  return (
    <motion.div
      className={className}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

// Stagger List Component
interface AnimatedListProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function AnimatedList({ children, className = "", staggerDelay = 0.1 }: AnimatedListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={listItemVariants}
          custom={index}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Loading Spinner Component
interface AnimatedSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function AnimatedSpinner({ size = "md", color = "text-[#0fc4b5]" }: AnimatedSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-gray-200 border-t-current rounded-full ${color}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
}

// Pulse Animation Component
interface PulseProps {
  children: React.ReactNode;
  className?: string;
}

export function Pulse({ children, className = "" }: PulseProps) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}

export default {
  Button: AnimatedButton,
  Card: AnimatedCard,
  Page: AnimatedPage,
  List: AnimatedList,
  Spinner: AnimatedSpinner,
  Pulse,
  variants: {
    button: buttonVariants,
    card: cardVariants,
    page: pageVariants,
    listItem: listItemVariants,
    modal: modalVariants,
    slide: slideVariants
  }
};