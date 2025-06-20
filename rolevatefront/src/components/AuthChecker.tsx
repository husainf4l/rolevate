"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  getCurrentUser,
  logout,
  getAccessToken,
} from "../services/auth.service";

/**
 * AuthChecker component that validates user authentication on mount/refresh
 * Automatically logs out and redirects if authentication is invalid
 */
export default function AuthChecker({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        console.log("[AuthChecker] Verifying authentication on page load...");

        // First check if we have a token
        const token = getAccessToken();
        if (!token) {
          console.log("[AuthChecker] No access token found");
          await handleAuthFailure();
          return;
        }

        // Try to get current user to verify token validity
        const user = await getCurrentUser();

        if (user) {
          console.log("[AuthChecker] Authentication valid:", user.email);
          setIsAuthenticated(true);
        } else {
          console.log("[AuthChecker] No user returned, authentication invalid");
          await handleAuthFailure();
        }
      } catch (error) {
        console.error("[AuthChecker] Authentication check failed:", error);
        await handleAuthFailure();
      } finally {
        setIsChecking(false);
      }
    };

    const handleAuthFailure = async () => {
      console.log("[AuthChecker] Authentication failed, logging out...");

      try {
        // Perform logout to clear any invalid tokens
        await logout();
        console.log("[AuthChecker] Logout completed");
      } catch (logoutError) {
        console.error("[AuthChecker] Error during logout:", logoutError);
        // Continue with redirect even if logout fails
      }

      // Redirect to login page with current path for redirect after login
      console.log("[AuthChecker] Redirecting to login page");
      const loginUrl = `/login?reason=session_expired&from=${encodeURIComponent(
        pathname
      )}`;
      router.replace(loginUrl);
    };

    // Only check authentication for protected routes
    if (pathname.startsWith("/dashboard")) {
      checkAuthentication();
    } else {
      setIsChecking(false);
      setIsAuthenticated(true); // Allow non-protected routes
    }
  }, [router, pathname]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C6AD] mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // Only render children if authentication is valid
  if (!isAuthenticated) {
    return null; // Will redirect to login via useEffect
  }

  return <>{children}</>;
}
