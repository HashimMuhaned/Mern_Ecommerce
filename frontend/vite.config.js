import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    proxy: {
      "/api": {
        target:
          process.env.BACKEND_API ||
          "https://mern-ecommerce-backend-nine.vercel.app/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  define: {
    "process.env.BACKEND_API": JSON.stringify(
      process.env.BACKEND_API ||
        "https://mern-ecommerce-backend-nine.vercel.app/api"
    ),
  },
});
