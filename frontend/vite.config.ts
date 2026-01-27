import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Keep the same port as CRA
    open: true
  },
  build: {
    outDir: 'build', // Match CRA output directory
    sourcemap: true
  },
  define: {
    // Support process.env for compatibility with existing code
    'process.env': {}
  }
})
