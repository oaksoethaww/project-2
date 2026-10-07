import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // Let the API handle CORS and preflight requests through the dev proxy.
    cors: false,
    proxy: { "/backend": "http://localhost:3000" },
  },
});
