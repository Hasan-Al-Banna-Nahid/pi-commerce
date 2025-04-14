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

let isInitialCheck = true;

api.interceptors.response.use(
  (response) => {
    isInitialCheck = false;
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && !isInitialCheck) {
      removeToken();
      removeUser();
      window.location.href = "/login";
    }
    isInitialCheck = false;
    return Promise.reject(error);
  }
);

export default api;
