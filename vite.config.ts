import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@tensorflow/tfjs-core',
      '@tensorflow/tfjs-converter',
      '@tensorflow/tfjs-backend-webgl',
      '@tensorflow/tfjs-backend-cpu',
      '@mediapipe/pose',
      '@mediapipe/face_detection',
      '@mediapipe/face_mesh'
    ],
    exclude: ['@tensorflow/tfjs-backend-webgpu']
  },
  build: {
    rollupOptions: {
      external: ['@tensorflow/tfjs-backend-webgpu']
    }
  },
  envDir: '.',
  server: {
    watch: {
      usePolling: true,
      interval: 100
    },
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      timeout: 5000
    }
  },
  preview: {
    port: 4173,
    host: true,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      external: ['@tensorflow/tfjs-backend-webgpu'],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  json: {
    stringify: true
  }
})