// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { authService } from "@/services/authService";

interface AuthUser {
  id: string;
  name: string;
  gmail: string;
  age: number;
  address: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const authenticated = authService.isAuthenticated();
    const currentUser = authService.getCurrentUser();
    
    setIsAuthenticated(authenticated);
    setUser(currentUser);
    setLoading(false);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    loading,
    logout,
    refreshAuth: checkAuth
  };
};