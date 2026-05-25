import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },

  vite: {
    build: {
      outDir: "dist/client",
    },

    server: {
      host: true,
      port: 8080,
      allowedHosts: [
        "dreamily-cling-brussels.ngrok-free.dev"
      ],
    },
  },
});