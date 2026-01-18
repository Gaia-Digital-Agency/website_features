import { defineConfig } from 'vite'

export default defineConfig({
  root: 'frontend',
  build: {
    outDir: '../dist',
  },
  server: {
    open: false,
    port: 5174,
    strictPort: true,
  },
})
