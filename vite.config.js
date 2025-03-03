import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensure relative paths for GitHub Pages
  build: {
    outDir: 'dist', // Output directory for the build
  },
  server: {
    open: true, // Automatically open the app in the browser
  },
});