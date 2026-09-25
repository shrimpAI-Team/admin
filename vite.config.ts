import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    host: true,
    proxy: {
      "/admin": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
      },
      "/users": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
      },
      "/shrimp-analysis": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
      },
      "/chat": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: "es2020",
    sourcemap: false,
  },
});
