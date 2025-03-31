// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@pinia/nuxt',
  ],

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
    }
  },

  app: {
    head: {
      title: 'Ozon Price Updater',
      meta: [
        { name: 'description', content: 'Система для мониторинга и обновления цен товаров Ozon' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  compatibilityDate: '2025-03-29'
})