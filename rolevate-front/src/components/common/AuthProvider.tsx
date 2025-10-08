"use client";

import { useEffect, useState, useRef } from "react";
import { getCurrentUser } from "@/services/auth";
import { AuthContext, User } from "@/hooks/useAuth";

// Global state to coordinate between multiple AuthProvider instances
let globalFetchPromise: Promise<User | null> | null = null;
let globalFetchCompleted = false;

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
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

    loadUser();
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

