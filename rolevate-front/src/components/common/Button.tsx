import React from 'react';
import Link from 'next/link';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'hero-primary' | 'hero-secondary';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  loading?: boolean;
  href?: string;
  external?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className = '', 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    href,
    external = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    children, 
    disabled, 
    ...props 
  }, ref) => {
    
    // Base classes
    const baseClasses = 'inline-flex items-center justify-center font-display font-semibold transition-all duration-400 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group';
    
    // Variant classes
    const variantClasses = {
      primary: 'bg-gradient-to-r from-[#13ead9] to-[#0891b2] hover:from-[#0891b2] hover:to-[#13ead9] text-white shadow-corporate hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02] focus:ring-[#0891b2]/50',
      secondary: 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200/50 shadow-corporate hover:shadow-xl hover:scale-[1.02] hover:text-[#0891b2] focus:ring-gray-300',
      outline: 'border-2 border-[#0891b2] text-[#0891b2] hover:bg-gradient-to-r hover:from-[#13ead9]/10 hover:to-[#0891b2]/10 hover:scale-[1.02] focus:ring-[#0891b2]/50',
      ghost: 'text-[#0891b2] hover:bg-gradient-to-r hover:from-[#13ead9]/10 hover:to-[#0891b2]/10 hover:scale-[1.02] focus:ring-[#0891b2]/50',
      glass: 'bg-white/95 backdrop-blur-md text-gray-800 border-2 border-gray-200/30 shadow-xl hover:shadow-2xl hover:bg-white hover:border-[#0891b2]/20 hover:scale-[1.02] hover:text-[#0891b2] focus:ring-gray-300',
      'hero-primary': 'bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white font-bold shadow-2xl hover:shadow-xl transform hover:-translate-y-2 hover:scale-[1.02] focus:ring-[#0891b2]/50',
      'hero-secondary': 'bg-white/95 backdrop-blur-md text-gray-800 font-semibold border-2 border-gray-200/30 shadow-xl hover:shadow-2xl hover:bg-white hover:border-[#0891b2]/20 hover:scale-[1.02] hover:text-[#0891b2] focus:ring-gray-300'
    };
    
    // Size classes
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm rounded-xl gap-2',
      md: 'px-6 py-3 text-base rounded-2xl gap-2',
      lg: 'px-8 py-4 text-lg rounded-2xl gap-3',
      xl: 'px-10 py-5 text-xl rounded-2xl gap-3',
      hero: 'px-10 py-5 text-lg rounded-3xl gap-3'
    };
    
    // Combine classes
    const buttonClasses = `
      ${baseClasses}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    // Loading spinner
    const LoadingSpinner = () => (
      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );

    // Gradient overlay for hover effect
    const GradientOverlay = () => (
      <div className="absolute inset-0 bg-gradient-to-r from-[#0891b2] to-[#13ead9] opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
    );

    // Content with icons
    const ButtonContent = () => (
      <>
        {(variant === 'primary' || variant === 'hero-primary') && <GradientOverlay />}
        <span className="relative z-10 flex items-center gap-inherit">
          {loading && <LoadingSpinner />}
          {!loading && icon && iconPosition === 'left' && icon}
          {children}
          {!loading && icon && iconPosition === 'right' && icon}
        </span>
      </>
    );

    // If href is provided, render as Link
    if (href) {
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses}
          >
            <ButtonContent />
          </a>
        );
      }
      
      return (
        <Link href={href} className={buttonClasses}>
          <ButtonContent />
        </Link>
      );
    }

    // Regular button
    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
      >
        <ButtonContent />
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };