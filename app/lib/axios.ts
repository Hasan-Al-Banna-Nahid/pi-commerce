import axios, { AxiosRequestConfig } from "axios";

// Extend AxiosRequestConfig to include _skipAuthCheck
declare module "axios" {
  export interface AxiosRequestConfig {
    _skipAuthCheck?: boolean;
  }
}
import { getToken, setToken, removeToken, removeUser } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Track if token refresh is in progress
let isRefreshing = false;
// Queue for failed requests during refresh
let failedRequestsQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token?: string) => {
  failedRequestsQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedRequestsQueue = [];
};

// Request interceptor to inject token
api.interceptors.request.use(
  (config) => {
    // Skip auth check for certain endpoints
    if (config._skipAuthCheck) return config;

    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip if already retried or marked to skip auth check
    if (originalRequest._retry || originalRequest._skipAuthCheck) {
      return Promise.reject(error);
    }

    // Only handle 401 errors
    if (error.response?.status === 401) {
      // If refresh already in progress, add to queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true, _skipAuthCheck: true }
        );

        if (refreshResponse.data.token) {
          // Store new token
          setToken(refreshResponse.data.token);
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${refreshResponse.data.token}`;

          // Retry queued requests with new token
          processQueue(null, refreshResponse.data.token);

          // Retry original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect
        processQueue(refreshError);
        removeToken();
        removeUser();

        if (typeof window !== "undefined") {
          window.location.href = "/login?session_expired=true";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
