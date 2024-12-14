import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/ethereal/", // Use this if your app is served from '/ethereal/'
  build: {
    outDir: "dist",
    rollupOptions: {
      input: "./index.html", // Ensure Rollup knows your entry point
    },
  },
  define: {
    "process.env.BACKEND_API": JSON.stringify(
      process.env.BACKEND_API ||
        "https://mern-ecommerce-backend-kappa.vercel.app/api"
    ),
  },
});
