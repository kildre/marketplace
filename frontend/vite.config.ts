import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 8080,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
  preview: {
    port: 8080,
    host: "0.0.0.0",
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true, // Enable source maps in production builds (optional)
  },
  css: {
    devSourcemap: true, // Enable CSS source maps in development
  },
  resolve: {
    alias: {
      // Try to alias the entire images directory
      "@advana/platform-ui/dist/images": "/assets/images",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test-setup.ts",
    css: true,
    coverage: {
      provider: "v8",
      exclude: [
        "node_modules/**",
        "dist/**",
        "**/*.config.{js,ts}",
        "**/*.test.{js,ts,tsx}",
        "**/*.spec.{js,ts,tsx}",
        "**/test-setup.ts",
        "**/test-utils.tsx",
        "**/vite-env.d.ts",
        "**/coverage/**",
        // Add specific files or directories you want to exclude
        "**/mock-*.ts", // Exclude all mock data files
        "**/data/mock-*.ts", // Specifically exclude mock data files
        "**/keycloak.ts", // Exclude keycloak config
        "**/main.tsx", // Exclude main entry point
        "**/interfaces/**", // Exclude interface definitions
        "**/types/**", // Exclude type definitions
        // Add more patterns as needed
        "**/src/components/RoleGuard.tsx", // Exclude RoleGuard component
        "**/src/components/debug/**", // Exclude debug-related components
        "**/src/components/ImageTest.tsx", // Exclude image test component
        "**/src/contexts/**", // Exclude context files
        "**/src/examples/**", // Exclude example files
        "**/src/hooks/**", // Exclude custom hooks
        "**/src/lib/**", // Exclude query library files
        "**/src/services/**", // Exclude service files
        "**/src/pages/auth-status/**", // Exclude auth status pages
        "**/src/utils/api-config.ts", // Exclude API config
        "**/src/data/**", // Exclude data files
      ],
      include: ["src/**/*.{js,ts,tsx}"],
    },
  },
});
