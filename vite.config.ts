import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Stroke Rate - Rowing Heart Rates',
        short_name: 'StrokeRate',
        description: 'Real-time heart rate monitoring data for coxswains',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/stroke-rate/',
        start_url: '/stroke-rate/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              // cacheKeyWillBeUsed: async ({ request }) => {
              //   return `${request.url}?v=1`
              // }
            }
          }
        ]
      }
    })
  ],
  base: '/stroke-rate/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React and React DOM
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          // Chart library (recharts is quite large)
          if (id.includes('recharts')) {
            return 'charts';
          }
          // UI libraries
          if (id.includes('@headlessui') || id.includes('@heroicons')) {
            return 'ui-vendor';
          }
          // State management and utilities
          if (id.includes('zustand') || id.includes('idb')) {
            return 'utils';
          }
          // D3 dependencies (used by recharts)
          if (id.includes('d3-')) {
            return 'd3-vendor';
          }
          // Node modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    // Increase chunk size warning limit to 1000kb for now
    chunkSizeWarningLimit: 1000,
    // Use esbuild for minification (more reliable than terser)
    minify: 'esbuild',
    // Source maps for debugging (disable in production for smaller builds)
    sourcemap: false,
    // Target modern browsers for smaller bundles
    target: 'esnext',
    // Enable CSS code splitting
    cssCodeSplit: true
  }
})
