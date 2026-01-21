import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(async () => {
  // Only load Replit-specific plugins when running on Replit
  const replitPlugins = [];

  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    try {
      const { cartographer } = await import("@replit/vite-plugin-cartographer");
      replitPlugins.push(cartographer());

      const { devBanner } = await import("@replit/vite-plugin-dev-banner");
      replitPlugins.push(devBanner());
    } catch (err) {
      console.warn("Replit plugins failed to load:", err);
      // Continue without them – better than crashing
    }
  }

  return {
    plugins: [
      react(),
      ...replitPlugins,
      // Do NOT include runtimeErrorOverlay() → it's the source of your error
      // If you really want a runtime error UI later, use vite-plugin-error-overlay or similar stable alternatives
    ],

    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },

    root: path.resolve(import.meta.dirname, "client"),

    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },

    server: {
      hmr: {
        overlay: false,           // Already set – keeps Vite's red screen off
      },
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});