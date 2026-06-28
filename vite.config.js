import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'figure/*.jpeg'],
      manifest: {
        name: 'やまぐち海釣りナビ',
        short_name: '海釣りナビ',
        description: '山口県の海釣り初心者向けナビゲーションアプリ',
        start_url: '/',
        display: 'standalone',
        background_color: '#0C2D48',
        theme_color: '#0C2D48',
        lang: 'ja',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // localStorageはService Workerと無関係なので影響なし
        // キャッシュ戦略: HTML/JS/CSS→NetworkFirst（常に最新を取得）
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
})
