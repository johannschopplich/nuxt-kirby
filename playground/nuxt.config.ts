import { defineNuxtConfig } from 'nuxt/config'
import NuxtKirby from '../src/module'

export default defineNuxtConfig({
  modules: [NuxtKirby],

  compatibilityDate: '2025-01-01',

  kirby: {
    auth: 'bearer',

    server: {
      cache: true,
    },
  },
})
