import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react-map-gl": path.resolve(__dirname, "./node_modules/react-map-gl/dist/maplibre.js"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate maplibre-gl into its own chunk
          'maplibre': ['maplibre-gl'],
          // Separate react-map-gl into its own chunk
          'react-map-gl': ['react-map-gl'],
          // Separate recharts (charting library)
          'recharts': ['recharts'],
        },
      },
    },
  },
}));
