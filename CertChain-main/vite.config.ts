import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'client', 'src'),
      '@shared': path.resolve(import.meta.dirname, 'shared'),
      '@assets': path.resolve(import.meta.dirname, 'attached_assets'),
    },
  },

  root: path.resolve(import.meta.dirname, 'client'),

  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-radix': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'vendor-tanstack': ['@tanstack/react-query'],
          'vendor-tensorflow': ['@tensorflow/tfjs', '@tensorflow/tfjs-backend-webgl'],
        },
      },
    },
  },

  server: {
    hmr: {
      overlay: false,
    },
    fs: {
      strict: false,
      allow: ['.'],
    },
  },
})
