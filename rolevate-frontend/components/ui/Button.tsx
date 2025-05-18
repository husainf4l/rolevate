import Link from "next/link";
import React from "react";

type ButtonProps = {
  href?: string;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  "aria-label"?: string;
};

export default function Button({
  href,
  variant = "primary",
  children,
  className = "",
  onClick,
  type = "button",
  disabled = false,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const baseClasses = "px-8 py-3 rounded-lg font-medium transition duration-300 flex items-center justify-center shadow-md";
  
  const variantClasses = {
    primary: "bg-[#00A99D] hover:bg-[#008F85] text-white focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:ring-opacity-50",
    secondary: "bg-[#172232] border-2 border-[#334155] hover:border-[#00A99D] hover:bg-[#131D2A] text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#334155] focus:ring-opacity-50"
  };
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`;

  if (href) {
    return (
      <Link 
        href={href} 
        className={buttonClasses}
        aria-label={ariaLabel}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
