import { defineNuxtConfig } from 'nuxt/config'
import NuxtKirby from '../../src/module'

export default defineNuxtConfig({
  modules: [NuxtKirby],

  compatibilityDate: '2025-01-01',

  kirby: {
    url: 'https://kirby-headless-starter.byjohann.dev',
    token: 'test',
    auth: 'bearer',
  },
})
