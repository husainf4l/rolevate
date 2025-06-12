import { useState, useEffect } from 'react';
import { getCurrentUser, User } from '../services/auth.service';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [needsCompanySetup, setNeedsCompanySetup] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Only call getCurrentUser() once - it will return null if not authenticated
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          setAuthenticated(true);
          
          // Check if user needs company setup
          const needsSetup = !currentUser.companyId || !currentUser.company;
          setNeedsCompanySetup(needsSetup);
        } else {
          setUser(null);
          setAuthenticated(false);
          setNeedsCompanySetup(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthenticated(false);
        setUser(null);
        setNeedsCompanySetup(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, loading, authenticated, needsCompanySetup };
}
