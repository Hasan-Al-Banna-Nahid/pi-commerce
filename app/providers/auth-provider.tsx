"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
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

type UserRole = "customer" | "vendor" | "retailer" | "wholesaler" | "admin";

type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  [key: string]: unknown;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  getToken: () => string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);

  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const res = await api.get("/api/auth/validate", {
        headers: { Authorization: `Bearer ${token}` },
        _skipAuthCheck: true,
      });
      return res.data.valid;
    } catch (error) {
      return false;
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    const token = getToken();
    const storedUser = getUserFromStorage() as User | null;

    if (!token || !storedUser) {
      setIsAuthenticated(false);
      setRole(null);
      setIsLoading(false);
      return;
    }

    try {
      const isValid = await validateToken(token);
      if (isValid) {
        setUser(storedUser);
        setRole(storedUser.role);
        setIsAuthenticated(true);
      } else {
        await logout();
      }
    } catch (error) {
      console.error("Auth validation failed:", error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  }, [validateToken]);

  useEffect(() => {
    refreshAuth();

    const interval = setInterval(refreshAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshAuth]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      if (res.data.token && res.data.user) {
        const userData = res.data.user as User;
        setToken(res.data.token);
        setUser(userData);
        setRole(userData.role);
        setUserToStorage(userData);
        setIsAuthenticated(true);
      } else {
        throw new Error("Authentication failed");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  const register = async (userData: any) => {
    try {
      const res = await api.post("/api/auth/register", userData, {
        withCredentials: true,
      });

      if (res.data.token && res.data.user) {
        const userData = res.data.user as User;
        setToken(res.data.token);
        setUser(userData);
        setRole(userData.role);
        setUserToStorage(userData);
        setIsAuthenticated(true);
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message || "Registration failed"
      );
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {}, { _skipAuthCheck: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      removeToken();
      removeUser();
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        role,
        getToken,
        login,
        register,
        logout,
        refreshAuth,
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
