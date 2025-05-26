// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: "/countdown-app/",        // ← esto permite que GitHub Pages cargue bien los assets
  plugins: [react()],
 
})

