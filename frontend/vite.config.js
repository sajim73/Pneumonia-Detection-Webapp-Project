import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = env.VITE_API_BASE_URL || "http://localhost:5000";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // Forward /uploads/* and /heatmaps/* to the Flask backend.
        // The browser fetches these as same-origin (port 5173) requests,
        // so CORS is never triggered — Vite silently relays them to port 5000.
        "/uploads": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        "/heatmaps": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
