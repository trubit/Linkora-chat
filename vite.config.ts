import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/v1\/.*/,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 10 },
          },
        ],
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: 'Linkora',
        short_name: 'Linkora',
        description: 'Connect, chat, and share with Linkora',
        theme_color: '#25D366',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
        categories: ['social', 'communication'],
        shortcuts: [
          {
            name: 'New Chat',
            short_name: 'Chat',
            description: 'Start a new conversation',
            url: '/chat',
            icons: [{ src: '/favicon.svg', sizes: 'any' }],
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/client'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@types': path.resolve(__dirname, 'src/types'),
    },
  },
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router'))
            return 'vendor';
          if (id.includes('@mui') || id.includes('@emotion')) return 'ui';
          if (id.includes('@tanstack/react-query')) return 'query';
          if (id.includes('socket.io-client')) return 'socket';
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy) => {
          // Send a 503 JSON response instead of dropping the TCP connection.
          // This prevents the `- - ms - -` morgan entries and the client-side
          // ECONNRESET that causes the refresh token response to be lost.
          proxy.on('error', (_err, _req, res) => {
            const r = res as import('http').ServerResponse;
            if (r && !r.headersSent) {
              r.writeHead(503, { 'Content-Type': 'application/json' });
              r.end(JSON.stringify({ success: false, message: 'Service temporarily unavailable' }));
            }
          });
        },
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
        configure: (proxy) => {
          // Suppress ECONNREFUSED noise during server startup — socket.io client
          // handles reconnection automatically.
          proxy.on('error', () => {});
        },
      },
    },
  },
  preview: { port: 4173 },
});
