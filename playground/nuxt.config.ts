import { defineNuxtConfig } from 'nuxt/config'
import NuxtKql from '../src/module'

export default defineNuxtConfig({
  modules: [NuxtKql],

  compatibilityDate: '2025-01-01',

  kirby: {
    auth: 'bearer',

    prefetch: {
      site: {
        query: 'site',
        select: {
          title: true,
          children: {
            query: 'site.children',
            select: {
              id: true,
              title: true,
              isListed: true,
            },
          },
        },
      },
    },

    server: {
      cache: true,
    },
  },
})
