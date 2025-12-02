import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  // Excluir code.html del escaneo de dependencias
  optimizeDeps: {
    exclude: ['code.html']
  },
  server: {
    port: 5173,
    strictPort: true,
    open: false,
  }
})
