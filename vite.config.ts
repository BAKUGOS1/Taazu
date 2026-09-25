import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'logo.svg'],
      manifest: {
        id: '/',
        name: 'Taazu HQ — Supplier & Pilot Tracker',
        short_name: 'Taazu HQ',
        description: 'Call suppliers, log every conversation, compare quotes and track the Ahmedabad electrolyte pilot.',
        start_url: '/?source=pwa',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F8FAFC',
        theme_color: '#EA580C',
        lang: 'en-IN',
        categories: ['business', 'productivity'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Suppliers', short_name: 'Suppliers', url: '/?tab=Suppliers', icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }] },
          { name: 'Today', short_name: 'Today', url: '/?tab=Today', icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: '/index.html',
        // Never cache Supabase/API traffic: team data must always be live.
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          xlsx: ['xlsx'],
          lucide: ['lucide-react']
        }
      }
    }
  },
  server: {
    port: 5173,
    open: false
  }
});
