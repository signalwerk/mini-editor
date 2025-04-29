import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Special config for the demo build (GitHub Pages)
export default defineConfig({
  plugins: [react()],
  // Use base path for GitHub Pages
  base: process.env.NODE_ENV === "production" ? "/mini-editor/" : "/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
});
