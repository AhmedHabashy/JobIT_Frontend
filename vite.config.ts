/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const ABSOLUTE_URL = /^https?:\/\//i;

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.VITE_API_BASE_URL;
  const isDevServer = command === "serve";

  // Counter-measure #1: a PRODUCTION build must target an absolute backend URL.
  // Fail the build outright if it isn't set — this makes it impossible to ship a
  // production artifact that would otherwise fall back to the dev-only same-origin
  // "/api" path (which has no proxy in production and would resolve to index.html
  // via the SPA redirect, silently corrupting every response).
  if (command === "build" && (!backend || !ABSOLUTE_URL.test(backend))) {
    throw new Error(
      "VITE_API_BASE_URL must be set to an absolute http(s) URL for production builds " +
        "(the dev proxy does not exist in production). See .env.example.",
    );
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: 5173,
      // Counter-measure #2: the CORS-bypass proxy is attached ONLY to the dev
      // server (command === "serve"). `server.proxy` is inherently dev-only, and
      // gating it explicitly guarantees it can never be part of a build artifact.
      // The app calls same-origin "/api/*" in dev (see apiClient) and Vite forwards
      // to the backend server-side, avoiding browser CORS (localhost is not in the
      // backend's AUTH__ALLOWED_ORIGINS). SSE passes through unbuffered.
      proxy: isDevServer
        ? {
            "/api": {
              target: backend || "https://api.ahabashy.com",
              changeOrigin: true,
              secure: true,
            },
          }
        : undefined,
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
