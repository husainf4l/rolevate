// Accessibility utilities and hooks for modern web applications

import React from "react";

export const a11y = {
  // Screen reader only text
  srOnly: "sr-only",

  // Focus management
  focusRing: "focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:ring-offset-2",

  // Skip links
  skipLink: "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-[#0891b2] text-white px-4 py-2 rounded-md font-medium",

  // ARIA attributes helper
  aria: {
    expanded: (isExpanded: boolean) => ({ "aria-expanded": isExpanded }),
    hidden: (isHidden: boolean) => ({ "aria-hidden": isHidden }),
    label: (label: string) => ({ "aria-label": label }),
    labelledby: (id: string) => ({ "aria-labelledby": id }),
    describedby: (id: string) => ({ "aria-describedby": id }),
    current: (isCurrent: boolean) => ({ "aria-current": isCurrent ? "page" : undefined }),
  },

  // Semantic color combinations for accessibility
  colors: {
    // High contrast combinations
    primary: {
      bg: "bg-[#0891b2]",
      text: "text-white",
      hover: "hover:bg-[#0c7594]",
      focus: "focus:bg-[#0c7594]",
    },
    secondary: {
      bg: "bg-gray-100",
      text: "text-gray-900",
      hover: "hover:bg-gray-200",
      focus: "focus:bg-gray-200",
    },
    danger: {
      bg: "bg-red-600",
      text: "text-white",
      hover: "hover:bg-red-700",
      focus: "focus:bg-red-700",
    },
  },
};

// Keyboard navigation hook
export function useKeyboardNavigation() {
  const handleKeyDown = (event: React.KeyboardEvent, callbacks: {
    onEnter?: () => void;
    onSpace?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
  }) => {
    switch (event.key) {
      case "Enter":
        event.preventDefault();
        callbacks.onEnter?.();
        break;
      case " ":
        event.preventDefault();
        callbacks.onSpace?.();
        break;
      case "Escape":
        event.preventDefault();
        callbacks.onEscape?.();
        break;
      case "ArrowUp":
        event.preventDefault();
        callbacks.onArrowUp?.();
        break;
      case "ArrowDown":
        event.preventDefault();
        callbacks.onArrowDown?.();
        break;
      case "ArrowLeft":
        event.preventDefault();
        callbacks.onArrowLeft?.();
        break;
      case "ArrowRight":
        event.preventDefault();
        callbacks.onArrowRight?.();
        break;
    }
  };

  return { handleKeyDown };
}

// Focus trap hook for modals and dropdowns
export function useFocusTrap(isActive: boolean) {
  const containerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Close modal/dropdown logic would go here
        // This should be handled by the parent component
      }
    };

    document.addEventListener("keydown", handleTabKey);
    document.addEventListener("keydown", handleEscapeKey);

    // Focus first element when trap becomes active
    firstElement?.focus();

    return () => {
      document.removeEventListener("keydown", handleTabKey);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isActive]);

  return containerRef;
}

// Announcement hook for screen readers
export function useAnnouncer() {
  const [announcements, setAnnouncements] = React.useState<string[]>([]);

  const announce = React.useCallback((message: string, _priority: "polite" | "assertive" = "polite") => {
    setAnnouncements(prev => [...prev, message]);

    // Clear announcement after screen reader processes it
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(msg => msg !== message));
    }, 1000);
  }, []);

  return {
    announce,
    announcer: (
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcements.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
    ),
  };
}

// Reduced motion hook
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}