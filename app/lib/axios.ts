import axios from "axios";
import { getToken, removeToken, removeUser } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors
    if (error.response?.status === 401) {
      // Skip if this is a retry attempt or logout request
      if (
        originalRequest._retry ||
        originalRequest.url?.includes("/auth/logout")
      ) {
        return Promise.reject(error);
      }

      // Skip if we're already on login page
      if (
        typeof window !== "undefined" &&
        window.location.pathname === "/login"
      ) {
        return Promise.reject(error);
      }

      // Mark this request to prevent infinite loops
      originalRequest._retry = true;

      try {
        // Attempt to re-authenticate with current token
        const token = getToken();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (retryError) {
        console.error("Retry failed:", retryError);
      }

      // Final cleanup if retry failed
      removeToken();
      removeUser();
      if (typeof window !== "undefined") {
        window.location.href = "/login?session_expired=true";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
