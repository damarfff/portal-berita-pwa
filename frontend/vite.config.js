import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Portal Berita PWA',
        short_name: 'Portal Berita',
        description: 'Portal berita dengan fitur aksesibilitas',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'id-ID',
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/articles'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'articles-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/categories'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'categories-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  server: {
  host: '0.0.0.0',
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false
    },
    '/uploads': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false
    }
  }
},
preview: {
  host: '0.0.0.0',
  port: 4173,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false
    },
    '/uploads': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false
    }
  }
}
})