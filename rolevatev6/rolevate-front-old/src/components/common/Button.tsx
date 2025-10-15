// "use client";

// import React, { useRef } from "react";
// import Link from "next/link";
// import { Button as ShadcnButton } from "@/components/ui/button";
// import { cn } from "@/lib/utils";

// export interface ButtonProps
//   extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   variant?:
//     | "primary"
//     | "secondary"
//     | "outline"
//     | "ghost"
//     | "glass"
//     | "hero-primary"
//     | "hero-secondary"
//     | "danger"
//     | "success"
//     | "warning"
//     | "info";
//   size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
//   loading?: boolean | undefined;
//   href?: string;
//   external?: boolean;
//   icon?: React.ReactNode;
//   iconPosition?: "left" | "right";
//   fullWidth?: boolean;
//   ariaLabel?: string;
//   tooltip?: string;
//   rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
//   shadow?: "none" | "sm" | "md" | "lg" | "xl";
//   gradient?: boolean;
//   pulse?: boolean;
// }

// const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
//   (props, ref) => {
//     const {
//       className = "",
//       variant = "primary",
//       size = "md",
//       loading = false,
//       href,
//       external = false,
//       icon,
//       iconPosition = "left",
//       fullWidth = false,
//       ariaLabel,
//       children,
//       disabled,
//       onClick,
//       ...rest
//     } = props;

//     const buttonRef = useRef<HTMLButtonElement>(null);
//     const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
//       onClick?.(event);
//     };

//     // Map custom variants to shadcn variants
//     const getShadcnVariant = () => {
//       switch (variant) {
//         case "primary":
//         case "hero-primary":
//           return "default";
//         case "secondary":
//         case "hero-secondary":
//           return "secondary";
//         case "outline":
//           return "outline";
//         case "ghost":
//           return "ghost";
//         case "glass":
//           return "secondary"; // Map glass to secondary for now
//         case "danger":
//           return "destructive";
//         case "success":
//         case "warning":
//         case "info":
//           return "default"; // These will be handled with custom classes
//         default:
//           return "default";
//       }
//     };

//     // Map custom sizes to shadcn sizes
//     const getShadcnSize = () => {
//       switch (size) {
//         case "xs":
//           return "sm";
//         case "sm":
//           return "sm";
//         case "md":
//           return "default";
//         case "lg":
//           return "lg";
//         case "xl":
//         case "hero":
//           return "lg";
//         default:
//           return "default";
//       }
//     };

//     // Enhanced variant classes for custom variants not covered by shadcn
//     const customVariantClasses = {
//       primary:
//         "bg-[#0891b2] text-white shadow-sm hover:bg-[#0c7594] focus:ring-[#0891b2]/40 focus:ring-offset-white",
//       secondary:
//         "bg-gray-100 text-gray-900 border border-gray-300 shadow-none hover:bg-gray-200 focus:ring-gray-400/40",
//       outline:
//         "border-2 border-[#0891b2] text-[#0891b2] bg-transparent hover:bg-[#13ead9]/5 focus:ring-[#0891b2]/40",
//       ghost:
//         "text-[#0891b2] bg-transparent hover:bg-[#13ead9]/10 focus:ring-[#0891b2]/40",
//       glass:
//         "bg-white/80 backdrop-blur-lg text-gray-800 border border-gray-200/50 shadow-sm hover:bg-white/90 focus:ring-gray-400/40",
//       "hero-primary":
//         "bg-[#0891b2] text-white font-bold shadow-sm hover:bg-[#0c7594] focus:ring-[#0891b2]/40 focus:ring-offset-white",
//       "hero-secondary":
//         "bg-white/90 backdrop-blur-lg text-gray-800 font-semibold border border-gray-200/50 shadow-sm hover:bg-white focus:ring-gray-400/40",
//       danger:
//         "bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500/40",
//       success:
//         "bg-green-600 text-white shadow-sm hover:bg-green-700 focus:ring-green-500/40",
//       warning:
//         "bg-orange-600 text-white shadow-sm hover:bg-orange-700 focus:ring-yellow-500/40",
//       info: "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:ring-blue-500/40",
//     };

//     // Enhanced size classes with better proportions
//     const customSizeClasses = {
//       xs: "px-3 py-1.5 text-xs rounded-md gap-1",
//       sm: "px-4 py-2 text-sm rounded-lg gap-2",
//       md: "px-6 py-3 text-base rounded-lg gap-2",
//       lg: "px-8 py-4 text-lg rounded-lg gap-3",
//       xl: "px-10 py-5 text-xl rounded-lg gap-3",
//       hero: "px-12 py-6 text-lg rounded-xl gap-4",
//     };

//     // Icon size mapping
//     const iconSizeClasses = {
//       xs: "w-3 h-3",
//       sm: "w-4 h-4",
//       md: "w-5 h-5",
//       lg: "w-6 h-6",
//       xl: "w-7 h-7",
//       hero: "w-6 h-6",
//     };

//     // Combine classes - use shadcn base with custom overrides
//     const combinedClasses = cn(
//       // Base shadcn classes
//       "font-display font-semibold transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none disabled:cursor-not-allowed relative overflow-hidden group active:scale-[0.98] active:transition-transform active:duration-75",
//       // Custom variant classes (override shadcn)
//       customVariantClasses[variant],
//       // Custom size classes (override shadcn)
//       customSizeClasses[size],
//       // Additional classes
//       fullWidth ? "w-full" : "",
//       className
//     );

//     // Enhanced loading spinner with size awareness
//     const LoadingSpinner = () => (
//       <svg
//         className={`animate-spin ${iconSizeClasses[size]}`}
//         xmlns="http://www.w3.org/2000/svg"
//         fill="none"
//         viewBox="0 0 24 24"
//         aria-hidden="true"
//       >
//         <circle
//           className="opacity-25"
//           cx="12"
//           cy="12"
//           r="10"
//           stroke="currentColor"
//           strokeWidth="4"
//         ></circle>
//         <path
//           className="opacity-75"
//           fill="currentColor"
//           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//         ></path>
//       </svg>
//     );

//     // Enhanced content with better icon handling
//     const ButtonContent = () => {
//       const IconComponent = ({ children }: { children: React.ReactNode }) => (
//         <span
//           className={`${iconSizeClasses[size]} flex items-center justify-center`}
//         >
//           {children}
//         </span>
//       );

//       return (
//         <span className="relative z-10 flex items-center gap-inherit">
//           {loading && <LoadingSpinner />}
//           {!loading && icon && iconPosition === "left" && (
//             <IconComponent>{icon}</IconComponent>
//           )}
//           {children && <span className="whitespace-nowrap">{children}</span>}
//           {!loading && icon && iconPosition === "right" && (
//             <IconComponent>{icon}</IconComponent>
//           )}
//         </span>
//       );
//     };

//     // If href is provided, render as Link
//     if (href) {
//       if (external) {
//         return (
//           <a
//             href={href}
//             target="_blank"
//             rel="noopener noreferrer"
//             className={combinedClasses}
//             aria-label={
//               ariaLabel ||
//               (typeof children === "string" ? children : "External link")
//             }
//             role="button"
//           >
//             <ButtonContent />
//           </a>
//         );
//       }

//       return (
//         <Link
//           href={href}
//           className={combinedClasses}
//           aria-label={
//             ariaLabel ||
//             (typeof children === "string" ? children : "Navigation link")
//           }
//           role="button"
//         >
//           <ButtonContent />
//         </Link>
//       );
//     }

//     // Use the ref if provided, otherwise use the internal buttonRef
//     const mergedRef = (node: HTMLButtonElement) => {
//       if (typeof ref === "function") {
//         ref(node);
//       } else if (ref) {
//         (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
//           node;
//       }
//       buttonRef.current = node;
//     };

//     // Use ShadcnButton as base with custom classes and functionality
//     return (
//       <ShadcnButton
//         ref={mergedRef}
//         className={combinedClasses}
//         variant={getShadcnVariant()}
//         size={getShadcnSize()}
//         disabled={disabled || loading}
//         aria-label={ariaLabel || (loading ? "Loading..." : undefined)}
//         onClick={handleClick}
//         {...rest}
//       >
//         <ButtonContent />
//       </ShadcnButton>
//     );
//   }
// );

// Button.displayName = "Button";

// export { Button };
