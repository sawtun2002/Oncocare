import axios from "axios";

const TOKEN_KEY = "cancer-hms-token";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api").replace(/\/$/, "");

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => (response.status === 204 ? undefined : response.data),
  (error) => {
    const body = error.response?.data;
    const message = typeof body?.error === "string"
      ? body.error
      : Array.isArray(body) && body.length > 0
        ? body[0]
        : error.message || "Unable to complete the request.";
    return Promise.reject(new Error(message));
  }
);

export function bearer(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
