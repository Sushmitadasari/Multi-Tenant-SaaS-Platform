import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Needed for Docker to expose the server
    port: 3000, // MANDATORY: Force port 3000 to match Docker mapping
    watch: {
      usePolling: true // Fixes hot reload issues in Docker on Windows
    }
  }
})