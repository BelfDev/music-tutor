import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-pdf-worker',
      buildStart() {
        // Copy the PDF.js worker to public directory
        try {
          copyFileSync(
            resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
            resolve(__dirname, 'public/pdf.worker.min.js')
          )
        } catch (error) {
          console.warn('Could not copy PDF.js worker:', error)
        }
      }
    }
  ],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  assetsInclude: ['**/*.pdf']
})