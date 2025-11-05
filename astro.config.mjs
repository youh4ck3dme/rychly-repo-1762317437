import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import sentry from '@sentry/astro';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    speedInsights: {
      enabled: true,
    },
  }),
  output: 'server',
  vite: {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'PAPI Hair Design',
          short_name: 'PAPI Hair',
          description: 'Profesionálny kadernícky salón v Košiciach',
          theme_color: '#2563eb',
          background_color: '#f8fafc',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/icons/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icons/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ]
  },
  integrations: [
    tailwind(),
    preact({
      include: ['**/preact/*', '**/screens/*', '**/ui/*']
    }),
    sentry({
      dsn: process.env.SENTRY_DSN || "https://your-sentry-dsn@sentry.io/project-id",
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      integrations: [],
      beforeSend(event, hint) {
        // Filter out development errors in production
        if (process.env.NODE_ENV === 'production' && event.exception) {
          const error = hint.originalException;
          if (error && typeof error === 'object' && 'message' in error) {
            const message = error.message;
            // Filter out common non-critical errors
            if (
              message.includes('Network request failed') ||
              message.includes('Loading chunk') ||
              message.includes('Script error')
            ) {
              return null;
            }
          }
        }
        return event;
      },
    })
  ],
  build: {
    assets: 'assets'
  }
});
