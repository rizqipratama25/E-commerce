import axios, { type AxiosInstance } from "axios";
import { getToken, clearAuth } from "../utils/authStorage";

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 500000,
});

api.interceptors.request.use((config) => {
  const token = getToken?.();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const msg = err?.response?.data?.message;

    if (status === 401 || msg === "Unauthenticated") {
      clearAuth?.();
      // optional: kalau mau auto redirect login, lebih bagus via route guard / component
      // window.location.href = "/auth/login";
    }

    return Promise.reject(err);
  }
);

export default api;