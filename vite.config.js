import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "^/source\\.json$": { target: "https://app.lumastack.ru", changeOrigin: true },
      "^/android/(latest|history)\\.json$": { target: "https://app.lumastack.ru", changeOrigin: true },
    },
  },
  build: {
    copyPublicDir: false,
    target: "es2020",
    sourcemap: true,
    // Three ships as one tree-shaken ESM module; other vendors are split below.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/gsap")) return "motion";
          if (id.includes("node_modules/react") || id.includes("node_modules/scheduler")) return "react";
          if (id.includes("node_modules/@react-three")) return "react-three";
          if (id.includes("node_modules/three")) return "three";
          return undefined;
        },
      },
    },
  },
});
