/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.VITE_API_BASE_URL || "https://api.ahabashy.com";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: 5173,
      // Dev-only proxy: the app calls same-origin "/api/*" (see apiClient), and
      // Vite forwards to the real backend server-side — avoids browser CORS,
      // since localhost is not in the backend's AUTH__ALLOWED_ORIGINS. SSE
      // streaming passes through unbuffered. Production uses VITE_API_BASE_URL
      // directly (its deployed origin must be whitelisted on the backend).
      proxy: {
        "/api": {
          target: backend,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    build: {
      outDir: "dist",
    },
    test: {
      environment: "jsdom",
      globals: true,
      include: ["tests/**/*.{test,spec}.{ts,tsx}", "src/**/*.{test,spec}.{ts,tsx}"],
    },
  };
});
