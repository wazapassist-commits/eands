import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// SITE_BASE=/eands/ pour GitHub Pages, / (défaut) pour Hostinger (racine).
export default defineConfig({
  base: process.env.SITE_BASE || '/',
  plugins: [react()],
})
