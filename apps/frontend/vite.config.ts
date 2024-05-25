import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  //change port for production
  preview: {
    port: 80,
  },
  // for dev
  server: {
    port: 3000,
  },
  define: {
    'process.env': process.env
  }
});
