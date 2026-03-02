import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
// Register API: see api-server/src/routes/auth.routes.ts and auth.controller.ts (registerHandler)
export default defineConfig({
  plugins: [uni()],
  server: {
    port: 5174, // If 5174 is in use (e.g. another dev server), Vite will use 5175, 5176, etc.
    historyApiFallback: true,
    proxy: {
      "/api": { target: "http://localhost:4000", changeOrigin: true },
      "/health": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
});
