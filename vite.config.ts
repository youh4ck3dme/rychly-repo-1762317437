import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}"],
      },
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Papi Hair Design",
        short_name: "Papi Hair",
        description: "Profesionálny kadernícky salón v Košiciach",
        theme_color: "#2563eb",
        background_color: "#f8fafc",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      // Only proxy API requests if VERCEL_DEV_PROXY is explicitly set
      ...(process.env.VERCEL_DEV_PROXY && {
        "/api": {
          target: process.env.VERCEL_DEV_PROXY,
          changeOrigin: true,
          secure: true,
          configure: (proxy) => {
            proxy.on("error", (err) => {
              console.error("[proxy:error]", err.message);
            });
          },
        },
      }),
    },
  },
});
