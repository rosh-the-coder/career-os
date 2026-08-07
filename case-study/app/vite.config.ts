import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: path.resolve(__dirname, "../public"),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@diagrams": path.resolve(__dirname, "../DIAGRAM_DATA"),
      "@manifest": path.resolve(__dirname, "../ASSET_MANIFEST.json"),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
