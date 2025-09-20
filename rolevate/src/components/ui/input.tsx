import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "glass" | "minimal" | "floating";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = "default",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value.length > 0);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    const baseClasses = cn(
      "flex h-12 w-full rounded-xl border-2 bg-background px-4 py-3 text-sm ring-offset-background transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      {
        "border-primary/20 focus:border-primary": variant === "default",
        "border-white/20 bg-white/5 backdrop-blur-sm focus:border-white/40": variant === "glass",
        "border-transparent bg-muted/50 focus:bg-background focus:border-primary": variant === "minimal",
        "border-primary/20 focus:border-primary": variant === "floating",
      },
      error && "border-destructive focus:border-destructive",
      className
    );

    const floatingLabelClasses = cn(
      "absolute left-4 transition-all duration-300 pointer-events-none",
      {
        "top-3 text-muted-foreground": !isFocused && !hasValue,
        "top-1 text-xs text-primary": isFocused || hasValue,
      }
    );

    if (variant === "floating" && label) {
      return (
        <div className="relative">
          <div className="relative">
            {leftIcon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {leftIcon}
              </div>
            )}
            <input
              type={type}
              className={cn(
                baseClasses,
                leftIcon && "pl-10",
                rightIcon && "pr-10"
              )}
              ref={ref}
              id={inputId}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              {...props}
            />
            {rightIcon && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {rightIcon}
              </div>
            )}
            <label
              htmlFor={inputId}
              className={floatingLabelClasses}
            >
              {label}
            </label>
          </div>
          {error && (
            <p className="mt-2 text-sm text-destructive">{error}</p>
          )}
          {helperText && !error && (
            <p className="mt-2 text-sm text-muted-foreground">{helperText}</p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {label && variant !== "floating" && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              baseClasses,
              leftIcon && "pl-10",
              rightIcon && "pr-10"
            )}
            ref={ref}
            id={inputId}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
