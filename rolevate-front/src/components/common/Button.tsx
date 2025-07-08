'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'hero-primary' | 'hero-secondary' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  loading?: boolean | undefined;
  href?: string;
  external?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  ripple?: boolean;
  ariaLabel?: string;
  tooltip?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  gradient?: boolean;
  pulse?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      className = '',
      variant = 'primary',
      size = 'md',
      loading = false,
      href,
      external = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      ariaLabel,
      children,
      disabled,
      onClick,
      ...rest
    } = props;

    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const rippleTimeouts = useRef<number[]>([]);
    
    // Ripple effect handler
    const handleRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!props.ripple || disabled || loading) return;
      
      const button = buttonRef.current;
      if (!button) return;
      
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rippleId = Date.now();
      
      setRipples(prev => [...prev, { x, y, id: rippleId }]);
      
      const timeout = window.setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== rippleId));
      }, 600);
      
      rippleTimeouts.current.push(timeout);
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      handleRipple(event);
      onClick?.(event);
    };

    // Base classes with improved focus states
    const baseClasses = `
      inline-flex items-center justify-center font-display font-semibold 
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-4 focus:ring-offset-2 
      disabled:opacity-60 disabled:pointer-events-none disabled:cursor-not-allowed
      relative overflow-hidden group
      active:scale-[0.98] active:transition-transform active:duration-75
      ${!disabled && !loading ? 'cursor-pointer' : ''}
    `.trim().replace(/\s+/g, ' ');
    
    // Enhanced variant classes with better accessibility
    const variantClasses = {
      primary: 'bg-gradient-to-r from-[#13ead9] to-[#0891b2] hover:from-[#0891b2] hover:to-[#13ead9] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-[1.01] focus:ring-[#0891b2]/40 focus:ring-offset-white',
      secondary: 'bg-gradient-to-r from-gray-50 to-white text-gray-700 border border-gray-300 shadow-sm hover:shadow-md hover:scale-[1.01] hover:text-[#0891b2] hover:border-[#0891b2]/30 focus:ring-gray-400/40',
      outline: 'border-2 border-[#0891b2] text-[#0891b2] bg-transparent hover:bg-gradient-to-r hover:from-[#13ead9]/5 hover:to-[#0891b2]/5 hover:scale-[1.01] hover:shadow-sm focus:ring-[#0891b2]/40',
      ghost: 'text-[#0891b2] bg-transparent hover:bg-gradient-to-r hover:from-[#13ead9]/10 hover:to-[#0891b2]/10 hover:scale-[1.01] focus:ring-[#0891b2]/40',
      glass: 'bg-white/80 backdrop-blur-lg text-gray-800 border border-gray-200/50 shadow-lg hover:shadow-xl hover:bg-white/90 hover:border-[#0891b2]/30 hover:scale-[1.01] hover:text-[#0891b2] focus:ring-gray-400/40',
      'hero-primary': 'bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02] focus:ring-[#0891b2]/40 focus:ring-offset-white',
      'hero-secondary': 'bg-white/90 backdrop-blur-lg text-gray-800 font-semibold border border-gray-200/50 shadow-lg hover:shadow-xl hover:bg-white hover:border-[#0891b2]/30 hover:scale-[1.02] hover:text-[#0891b2] focus:ring-gray-400/40',
      danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-[1.01] focus:ring-red-500/40',
      success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-[1.01] focus:ring-green-500/40',
      warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-orange-500 hover:to-yellow-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-[1.01] focus:ring-yellow-500/40',
      info: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-[1.01] focus:ring-blue-500/40'
    };
    
    // Enhanced size classes with better proportions
    const sizeClasses = {
      xs: 'px-3 py-1.5 text-xs rounded-lg gap-1',
      sm: 'px-4 py-2 text-sm rounded-xl gap-2',
      md: 'px-6 py-3 text-base rounded-2xl gap-2',
      lg: 'px-8 py-4 text-lg rounded-2xl gap-3',
      xl: 'px-10 py-5 text-xl rounded-2xl gap-3',
      hero: 'px-12 py-6 text-lg rounded-3xl gap-4'
    };

    // Icon size mapping
    const iconSizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7',
      hero: 'w-6 h-6'
    };
    
    // Combine classes
    const buttonClasses = `
      ${baseClasses}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    // Enhanced loading spinner with size awareness
    const LoadingSpinner = () => (
      <svg 
        className={`animate-spin ${iconSizeClasses[size]}`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );

    // Ripple animation component
    const RippleEffect = () => (
      <>
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none animate-ping"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
              animationDuration: '600ms'
            }}
          />
        ))}
      </>
    );

    // Gradient overlay for hover effect
    const GradientOverlay = () => (
      <div className="absolute inset-0 bg-gradient-to-r from-[#0891b2] to-[#13ead9] opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
    );

    // Enhanced content with better icon handling
    const ButtonContent = () => {
      const IconComponent = ({ children }: { children: React.ReactNode }) => (
        <span className={`${iconSizeClasses[size]} flex items-center justify-center`}>
          {children}
        </span>
      );

      return (
        <>
          {props.ripple && <RippleEffect />}
          {(variant === 'primary' || variant === 'hero-primary') && <GradientOverlay />}
          <span className="relative z-10 flex items-center gap-inherit">
            {loading && <LoadingSpinner />}
            {!loading && icon && iconPosition === 'left' && (
              <IconComponent>{icon}</IconComponent>
            )}
            {children && <span className="whitespace-nowrap">{children}</span>}
            {!loading && icon && iconPosition === 'right' && (
              <IconComponent>{icon}</IconComponent>
            )}
          </span>
        </>
      );
    };

    // If href is provided, render as Link
    if (href) {
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses}
            aria-label={ariaLabel || (typeof children === 'string' ? children : 'External link')}
            role="button"
          >
            <ButtonContent />
          </a>
        );
      }
      
      return (
        <Link 
          href={href} 
          className={buttonClasses}
          aria-label={ariaLabel || (typeof children === 'string' ? children : 'Navigation link')}
          role="button"
        >
          <ButtonContent />
        </Link>
      );
    }

    // Use the ref if provided, otherwise use the internal buttonRef
    const mergedRef = (node: HTMLButtonElement) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }
      buttonRef.current = node;
    };

    // Regular button with enhanced accessibility
    return (
      <button
        ref={mergedRef}
        className={buttonClasses}
        disabled={disabled || loading}
        aria-label={ariaLabel || (loading ? 'Loading...' : undefined)}
        aria-disabled={disabled || loading}
        onClick={handleClick}
        {...rest}
      >
        <ButtonContent />
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };