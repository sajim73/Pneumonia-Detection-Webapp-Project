import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://shiny-orbit-qjpv9v6v7wgf4wr5-5000.app.github.dev",
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pneumo_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
