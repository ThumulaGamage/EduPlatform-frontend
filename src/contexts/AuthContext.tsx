// src/contexts/AuthContext.tsx

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: string;
  name: string;
  gmail: string;
  age: number;
  address: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    age: number,
    address: string,
    role: UserRole
  ) => Promise<void>;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // load auth on page load
  useEffect(() => {
    refreshAuth();
  }, []);

  // reuseable auth sync function
  const refreshAuth = () => {
    const token = authService.getToken();
    const savedUser = authService.getCurrentUser();

    if (token && savedUser) {
      setUser(savedUser);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }

    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const response = await authService.login({
        gmail: email, // backend expects gmail
        password,
      });

      setUser(response.user);
      setIsAuthenticated(true);

      toast({
        title: "Welcome back!",
        description: `Logged in as ${response.user.role}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    age: number,
    address: string,
    role: UserRole
  ) => {
    try {
      setLoading(true);

      const response = await authService.register({
        name,
        gmail: email,
        password,
        age,
        address,
        role,
      });

      setUser(response.user);
      setIsAuthenticated(true);

      toast({
        title: "Account created!",
        description: `Welcome to EduPlatform as a ${role}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.response?.data?.message || "Could not create account",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);

    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within AuthProvider");
  return context;
};
