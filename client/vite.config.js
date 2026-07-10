import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite Configuration
 *
 * The server.proxy setting proxies all /api requests to the backend
 * during development. This means:
 *  - Frontend calls /api/v1/auth/login
 *  - Vite forwards it to http://localhost:5000/api/v1/auth/login
 *  - No CORS issues in development
 *  - No hardcoded backend URLs in frontend code
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
