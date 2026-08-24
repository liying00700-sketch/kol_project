import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // GitHub Pages project sites are served from /<repository>/.
  // Keep the local development server available at http://localhost:5173/.
  base: command === 'build' ? '/kol_project/' : '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api/comment-analysis': {
        target: process.env.YUJIAN_CONTENT_INSIGHT_ORIGIN || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
}))
