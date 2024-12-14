import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as dotenv from "dotenv";

dotenv.config(); // Load .env variables

export default defineConfig({
  plugins: [react()],
  base: "/ethereal/", // Ensure the base path matches your deployment
  build: {
    outDir: "dist",
  },
  define: {
    "process.env.BACKEND_API": JSON.stringify(
      process.env.BACKEND_API ||
        "https://mern-ecommerce-backend-kappa.vercel.app/api"
    ),
  },
});
