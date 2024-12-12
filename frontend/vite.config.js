import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Default for Vite, but ensure it's clear
  },
  define: {
    'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL || ""), // Optional for client-side usage
  },
});
