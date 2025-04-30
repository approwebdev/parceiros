import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: process.env.PORT || 3000,
  },
  preview: {
    host: true,
    port: process.env.PORT || 3000,
    allowedHosts: ['distribuidores.appro.com.br']
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
}) 