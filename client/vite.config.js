import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true }, // host: true = listen on 0.0.0.0, required to reach it from outside the container
});
