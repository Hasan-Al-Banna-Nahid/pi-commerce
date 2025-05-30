"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { AxiosError } from "axios";
import {
  getToken,
  setToken,
  removeToken,
  setUser as setUserToStorage,
  getUser as getUserFromStorage,
  removeUser,
} from "@/app/lib/auth";
import api from "@/app/lib/axios";

type User = {
  id: string;
  email: string;
  name: string;
  role: "customer" | "vendor" | "retailer" | "wholesaler";
  [key: string]: unknown;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
  role: User["role"];
  businessName?: string;
  phone: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === "undefined") return;

      const token = getToken();
      const storedUser = getUserFromStorage();

      if (!token && !storedUser) {
        setIsLoading(false);
        return logout();
      }

      if (storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
        setRole(storedUser.role);
      }

      if (token) {
        try {
          const res = await api.get("/api/auth/me", { withCredentials: true });
          const userData = res.data.user;
          setUser(userData);
          setUserToStorage(userData);
          setIsAuthenticated(true);
          setRole(userData.role);
        } catch (err) {
          console.warn("Failed to refresh user from API", err);
          if (!storedUser) logout();
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      if (res.data.success && res.data.user) {
        if (res.data.token) {
          setToken(res.data.token);
        }

        setUser(res.data.user);
        setUserToStorage(res.data.user);
        setIsAuthenticated(true);
        setRole(res.data.user.role);
      } else {
        throw new Error(res.data.message || "Authentication failed");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const res = await api.post("/api/auth/register", userData, {
        withCredentials: true,
      });

      if (!res.data.token) {
        throw new Error("No token received");
      }

      setToken(res.data.token);
      setUser(res.data.user);
      setUserToStorage(res.data.user);
      setIsAuthenticated(true);
      setRole(res.data.user.role);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message || "Registration failed"
      );
    }
  };

  const logout = () => {
    removeToken();
    removeUser();
    setUser(null);
    setIsAuthenticated(false);
    setRole(null);
    api.post("/api/auth/logout").catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        role,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
