// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  
  // Add Google Fonts using Nuxt's app config
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'
        }
      ]
    }
  },

  // Runtime config for environment variables
  runtimeConfig: {
    // Private keys that are exposed to the server-side only
    // apiSecret: process.env.NUXT_API_SECRET,
    
    // Public keys that are exposed to the client-side
    public: {
      tmdbApiToken: process.env.NUXT_PUBLIC_TMDB_API_TOKEN,
      tmdbApiBaseUrl: process.env.NUXT_PUBLIC_TMDB_API_BASE_URL || 'https://api.themoviedb.org/3',
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    }
  }
})
