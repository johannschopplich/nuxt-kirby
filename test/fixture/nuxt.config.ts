import { defineNuxtConfig } from 'nuxt/config'
import NuxtKirby from '../../src/module'

export default defineNuxtConfig({
  modules: [NuxtKirby],

  compatibilityDate: '2025-01-01',

  kirby: {
    // Every test file points the module at a Kirby stand-in of its own.
    auth: 'bearer',
    token: 'test',
  },
})
