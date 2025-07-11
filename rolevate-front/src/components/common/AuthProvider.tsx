"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/auth";
import { AuthContext, User } from "@/hooks/useAuth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log("Loading user for AuthProvider...");
        const userData = await getCurrentUser();
        console.log("User loaded:", userData);
        setUser(userData);
      } catch (error) {
        // User not authenticated, which is fine for public pages
        console.log(
          "User not authenticated (this is normal for public pages):",
          error
        );
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
