"use client";

import { useEffect, useState, useRef } from "react";
import { getCurrentUser } from "@/services/auth";
import { AuthContext, User } from "@/hooks/useAuth";

// Global state to coordinate between multiple AuthProvider instances
let globalFetchPromise: Promise<User | null> | null = null;
let globalFetchCompleted = false;

// Function to reset global state (called when auth token is stored)
function resetGlobalAuthState() {
  console.log('[AuthProvider] Resetting global auth state for token refetch');
  globalFetchPromise = null;
  globalFetchCompleted = false;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const isMounted = useRef(true);

  const loadUser = async () => {
    const timestamp = Date.now();
    console.log(`[AuthProvider-${timestamp}] Component mounted, globalFetchCompleted:`, globalFetchCompleted);

    // If a fetch is already in progress, wait for it
    if (globalFetchPromise) {
      console.log("[AuthProvider] Waiting for existing fetch...");
      try {
        const userData = await globalFetchPromise;
        if (isMounted.current) {
          setUser(userData);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted.current) {
          setUser(null);
          setIsLoading(false);
        }
      }
      return;
    }

    // If fetch already completed globally, don't fetch again
    if (globalFetchCompleted) {
      console.log("[AuthProvider] Fetch already completed globally, skipping");
      if (isMounted.current) {
        setIsLoading(false);
      }
      return;
    }

    // Start the fetch
    console.log("[AuthProvider] Starting new fetch...");
    globalFetchPromise = (async () => {
      try {
        const userData = await getCurrentUser();
        console.log("[AuthProvider] User loaded successfully:", userData?.email || 'No email');
        console.log("[AuthProvider] User company:", userData?.company);
        return userData;
      } catch (error) {
        console.log("[AuthProvider] User not authenticated (normal for public pages)");
        return null;
      }
    })();

    try {
      const userData = await globalFetchPromise;
      globalFetchCompleted = true;
      if (isMounted.current) {
        setUser(userData);
      }
    } catch (error) {
      globalFetchCompleted = true;
      if (isMounted.current) {
        setUser(null);
      }
    } finally {
      globalFetchPromise = null;
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const refreshUser = async () => {
    console.log("[AuthProvider] Refreshing user data...");
    try {
      const userData = await getCurrentUser();
      if (isMounted.current) {
        setUser(userData);
      }
    } catch (error) {
      console.log("[AuthProvider] Failed to refresh user");
      if (isMounted.current) {
        setUser(null);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    loadUser();

    // Listen for token storage events (from application form)
    const handleTokenStored = () => {
      console.log('[AuthProvider] Token stored event received - resetting auth state');
      resetGlobalAuthState();
      // Force reload user data after a short delay
      setTimeout(() => {
        if (isMounted.current) {
          loadUser();
        }
      }, 100);
    };

    window.addEventListener('auth-token-stored', handleTokenStored);

    // Set up periodic check for token validity (every 5 minutes)
    const intervalId = setInterval(() => {
      if (isMounted.current && user) {
        // Check if token still exists
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        if (!token) {
          console.log('[AuthProvider] Token expired or removed - clearing user data');
          setUser(null);
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
      window.removeEventListener('auth-token-stored', handleTokenStored);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
