import { defineNuxtConfig } from 'nuxt/config'
import NuxtKirby from '../src/module'

export default defineNuxtConfig({
  modules: [NuxtKirby],

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
