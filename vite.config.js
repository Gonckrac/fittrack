import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  // Los JS van en /public/ y Vite los sirve como archivos estáticos
  // sin procesarlos con esbuild — exactamente como el monolito original
  publicDir: 'public',
  build: {
    outDir: 'dist',
    // Solo procesa index.html y los CSS de src/styles/
    // Los JS en public/ se copian tal cual al build
    rollupOptions: {
      input: 'index.html'
    }
  },
  server: {
    port: 5173,
    open: true,
  }
})
