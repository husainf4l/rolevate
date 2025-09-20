import * as React from "react";
import { Toaster as SonnerToaster } from "sonner";
import { cn } from "@/lib/utils";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning" | "info";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast: React.FC<ToastProps> = ({
  title,
  description,
  variant = "default",
  duration = 5000,
  action,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const variantClasses = {
    default: "bg-background border-border text-foreground",
    success: "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300",
    error: "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300",
    warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-300",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300",
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 max-w-sm w-full rounded-xl border-2 p-4 shadow-lg backdrop-blur-sm transition-all duration-300",
        variantClasses[variant],
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-1 space-y-1">
          {title && (
            <h4 className="text-sm font-semibold">{title}</h4>
          )}
          {description && (
            <p className="text-sm opacity-90">{description}</p>
          )}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm font-medium underline hover:no-underline"
          >
            {action.label}
          </button>
        )}
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Toast hook for easy usage
interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const useToast = () => {
  const [toasts, setToasts] = React.useState<Array<ToastProps & { id: string }>>([]);

  const toast = React.useCallback(
    (props: ToastProps & ToastOptions) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { ...props, id }]);
    },
    []
  );

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = React.useCallback(
    (title: string, description?: string, options?: ToastOptions) => {
      toast({ title, description, variant: "success", ...options });
    },
    [toast]
  );

  const error = React.useCallback(
    (title: string, description?: string, options?: ToastOptions) => {
      toast({ title, description, variant: "error", ...options });
    },
    [toast]
  );

  const warning = React.useCallback(
    (title: string, description?: string, options?: ToastOptions) => {
      toast({ title, description, variant: "warning", ...options });
    },
    [toast]
  );

  const info = React.useCallback(
    (title: string, description?: string, options?: ToastOptions) => {
      toast({ title, description, variant: "info", ...options });
    },
    [toast]
  );

  return {
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
  };
};

// Toast container component
const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onDismiss={() => dismiss(toast.id)}
        />
      ))}
    </div>
  );
};

export { Toast, useToast, ToastContainer, SonnerToaster };
