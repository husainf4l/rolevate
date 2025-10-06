"use client";

import React, { useEffect } from "react";

// Focus management utilities
export const useFocusManagement = () => {
  const focusRingClasses = "focus:outline-none focus:ring-2 focus:ring-[#0fc4b5] focus:ring-offset-2 focus:ring-offset-white";
  
  const trapFocus = (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  };

  const moveFocusToElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  };

  return { focusRingClasses, trapFocus, moveFocusToElement };
};

// Screen reader utilities
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

// Skip link component
interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => (
  <a
    href={href}
    className="absolute -top-40 left-6 z-50 bg-[#0fc4b5] text-white px-4 py-2 rounded-md font-medium focus:top-6 transition-all duration-200"
  >
    {children}
  </a>
);

// Announce to screen readers
export const useAnnouncement = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return { announce };
};

// Enhanced button with accessibility
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
  loading?: boolean;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  variant = 'primary',
  children,
  ariaLabel,
  ariaExpanded,
  ariaControls,
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const { focusRingClasses } = useFocusManagement();
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white hover:from-[#0fc4b5] hover:to-[#0891b2]',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium
        transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${focusRingClasses} ${className}
      `}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <>
          <svg 
            className="w-4 h-4 mr-2 animate-spin" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
              className="opacity-25" 
            />
            <path 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
              className="opacity-75" 
            />
          </svg>
          <ScreenReaderOnly>Loading...</ScreenReaderOnly>
        </>
      )}
      {children}
    </button>
  );
};

// Enhanced form input with accessibility
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  error,
  helperText,
  required = false,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const { focusRingClasses } = useFocusManagement();

  return (
    <div className="space-y-1">
      <label 
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      <input
        id={inputId}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          ${error ? 'border-red-300' : 'border-gray-300'}
          placeholder-gray-400 ${focusRingClasses} ${className}
        `}
        aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`}
        aria-invalid={!!error}
        aria-required={required}
        {...props}
      />
      
      {error && (
        <p id={errorId} className="text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={helperId} className="text-gray-500 text-sm">
          {helperText}
        </p>
      )}
    </div>
  );
};

// Modal with proper accessibility
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  const { trapFocus } = useFocusManagement();
  const modalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      trapFocus(modalRef.current);
      modalRef.current.focus();
    }
  }, [isOpen, trapFocus]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />

        <div
          ref={modalRef}
          className={`
            inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all
            sm:my-8 sm:align-middle ${sizeClasses[size]} sm:w-full
          `}
          tabIndex={-1}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 
                  className="text-lg leading-6 font-medium text-gray-900 mb-4"
                  id="modal-title"
                >
                  {title}
                </h3>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Keyboard navigation hook
export const useKeyboardNavigation = (items: string[], onSelect: (index: number) => void) => {
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onSelect(focusedIndex);
        }
        break;
      case 'Escape':
        setFocusedIndex(-1);
        break;
    }
  };

  return { focusedIndex, handleKeyDown, setFocusedIndex };
};