import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/ethereal/", // Set the base path to match your deployment subpath
  build: {
    outDir: "dist", // Ensure this matches your intended output directory
  },
  define: {
    'process.env.BACKEND_API': JSON.stringify(
      process.env.BACKEND_API || "https://mern-ecommerce-backend-kappa.vercel.app/api"
    ),
  },
});
