import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // if you're using cookies/session auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: request interceptor
api.interceptors.request.use(
  (config) => {
    // Add token if exists
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Optional: response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle expired token, errors, etc.
    if (error.response?.status === 401) {
      console.log("Unauthorized. Redirecting to login...");
    }
    return Promise.reject(error);
  },
);

export default api;
