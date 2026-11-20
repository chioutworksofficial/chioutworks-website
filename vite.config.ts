import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// Phone testing with the microphone: browsers only allow the mic on https (or localhost). `npm run dev:https`
// runs the normal http://localhost:3000 AND https://<computer-ip>:3443 (self-signed certificate, accept the warning once on the phone).
const HTTPS = process.env.DEV_HTTPS === '1'

export default defineConfig({
  worker: { format: 'es' },
  plugins: [
    react(),
    tailwindcss(),
    ...(HTTPS ? [basicSsl()] : []),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return 'vendor-react'
          if (/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(id)) return 'vendor-motion'
          if (id.includes('/gsap/')) return 'vendor-gsap'
          if (/node_modules\/(recharts|d3-[a-z-]+|victory-vendor)\//.test(id)) return 'vendor-charts'
          return undefined
        },
      },
    },
  },
  server: {
    port: 3000,
    // Reachable from devices on the same Wi-Fi (phone testing): http://<computer-ip>:3000. Dev only; the build is unaffected.
    host: true,
    // Server-side data files (demo leads) must not trigger a page reload
    // Only the server-side store at <root>/data (not src/data!) — writing leads there must not reload the page
    // Non-app folders (Obsidian vault writes its config constantly, archive, docs, graph) must not reload the page either
    watch: {
      ignored: ['data', 'obsidian', '_yedek', 'graphify-out', 'context', 'agents', 'tanitim', 'scripts', 'public/kaynaklar'].map(
        (dir) => `${fileURLToPath(new URL(`./${dir}`, import.meta.url))}/**`,
      ),
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
