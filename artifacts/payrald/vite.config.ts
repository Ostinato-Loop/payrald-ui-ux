import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: parseInt(process.env.PORT ?? "5174"),
    host: "0.0.0.0",
    allowedHosts: "all",
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.API_PORT ?? "3000"}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
  },
  define: {
    "import.meta.env.VITE_API_BASE": JSON.stringify(
      process.env.VITE_API_BASE ?? ""
    ),
  },
});
