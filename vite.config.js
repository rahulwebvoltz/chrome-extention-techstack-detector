import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Builds the popup (index.html) and the background service worker.
// The content script is built separately as an IIFE — see scripts/build.mjs.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(import.meta.dirname, "index.html"),
        background: resolve(import.meta.dirname, "src/background/serviceWorker.js")
      },
      output: {
        // manifest.json references background.js by a fixed name
        entryFileNames: (chunk) =>
          chunk.name === "background" ? "background.js" : "assets/[name]-[hash].js"
      }
    }
  }
});
