// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // 👈 siempre usará este puerto
    strictPort: true // 👈 si está ocupado, lanza error (no cambia automáticamente)
  }
})

