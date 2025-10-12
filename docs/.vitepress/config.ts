import type { DefaultTheme } from 'vitepress'
import { defineConfig } from 'vitepress'
import { description, version } from '../../package.json'
import {
  github,
  name,
  ogImage,
  ogUrl,
  releases,
} from './meta'

export default defineConfig({
  lang: 'en-US',
  title: name,
  description,
  head: [
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'author', content: 'Johann Schopplich' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'og:title', content: name }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { name: 'twitter:title', content: name }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: ogImage }],
    ['meta', { name: 'twitter:site', content: '@jschopplich' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ],

  lastUpdated: true,
  appearance: 'dark',

  themeConfig: {
    logo: '/logo.svg',

    editLink: {
      pattern: 'https://github.com/johannschopplich/nuxt-kirby/edit/main/docs/:path',
      text: 'Suggest changes to this page',
    },

    nav: nav(),

    sidebar: {
      '/essentials/': sidebarMain(),
      '/guides/': sidebarMain(),
      '/advanced/': sidebarMain(),
      '/api/': sidebarApi(),
    },

    socialLinks: [
      { icon: 'github', link: github },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2022-PRESENT Johann Schopplich',
    },

    search: {
      provider: 'local',
    },
  },
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'Essentials',
      activeMatch: '^/essentials/',
      items: [
        { text: 'What is Nuxt Kirby?', link: '/essentials/what-is-nuxt-kirby' },
        { text: 'Getting Started', link: '/essentials/getting-started' },
        { text: 'Data Fetching Methods', link: '/essentials/data-fetching-methods' },
        { text: 'Authentication', link: '/essentials/authentication' },
        { text: 'Starter Kits', link: '/essentials/starter-kits' },
      ],
    },
    {
      text: 'Guides',
      activeMatch: '^/guides/',
      items: [
        { text: 'Multi-Language Sites', link: '/guides/multi-language-sites' },
        { text: 'Caching Strategies', link: '/guides/caching-strategies' },
        { text: 'Error Handling', link: '/guides/error-handling' },
        { text: 'Prefetching KQL Queries', link: '/guides/prefetching-kql-queries' },
        { text: 'Batching KQL Queries', link: '/guides/batching-kql-queries' },
      ],
    },
    {
      text: 'API',
      activeMatch: '^/api/',
      items: [
        { text: 'Overview', link: '/api/' },
        { text: 'Module Configuration', link: '/api/module-configuration' },
        { text: 'Types', link: '/api/types' },
        {
          text: 'KQL Queries',
          items: [
            { text: 'useKql', link: '/api/use-kql' },
            { text: '$kql', link: '/api/kql' },
          ],
        },
        {
          text: 'Kirby API',
          items: [
            { text: 'useKirbyData', link: '/api/use-kirby-data' },
            { text: '$kirby', link: '/api/kirby' },
          ],
        },
      ],
    },
    {
      text: `v${version}`,
      items: [
        { text: 'Release Notes ', link: releases },
        { text: 'Migration Guide', link: '/advanced/migration' },
      ],
    },
  ]
}

function sidebarMain(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Essentials',
      items: [
        { text: 'What is Nuxt Kirby?', link: '/essentials/what-is-nuxt-kirby' },
        { text: 'Getting Started', link: '/essentials/getting-started' },
        { text: 'Data Fetching Methods', link: '/essentials/data-fetching-methods' },
        { text: 'Authentication', link: '/essentials/authentication' },
        { text: 'Starter Kits', link: '/essentials/starter-kits' },
      ],
    },
    {
      text: 'Guides',
      items: [
        { text: 'Multi-Language Sites', link: '/guides/multi-language-sites' },
        { text: 'Caching Strategies', link: '/guides/caching-strategies' },
        { text: 'Error Handling', link: '/guides/error-handling' },
        { text: 'Prefetching KQL Queries', link: '/guides/prefetching-kql-queries' },
        { text: 'Batching KQL Queries', link: '/guides/batching-kql-queries' },
      ],
    },
    {
      text: 'Digging Deeper',
      items: [
        { text: 'CORS Issues', link: '/advanced/cors-issues' },
        { text: 'What Is KQL?', link: '/advanced/what-is-kql' },
        { text: 'How Does It Work?', link: '/advanced/how-does-it-work' },
      ],
    },
    { text: 'Migration', link: '/advanced/migration' },
  ]
}

function sidebarApi(): DefaultTheme.SidebarItem[] {
  return [
    { text: 'Overview', link: '/api/' },
    { text: 'Module Configuration', link: '/api/module-configuration' },
    {
      text: 'KQL Queries',
      items: [
        { text: 'useKql', link: '/api/use-kql' },
        { text: '$kql', link: '/api/kql' },
      ],
    },
    {
      text: 'Kirby API',
      items: [
        { text: 'useKirbyData', link: '/api/use-kirby-data' },
        { text: '$kirby', link: '/api/kirby' },
      ],
    },
    {
      text: 'Types',
      items: [
        { text: 'Using Types', link: '/api/types' },
        { text: 'Query Types', link: '/api/types-query' },
        { text: 'Request Types', link: '/api/types-request' },
        { text: 'Response Types', link: '/api/types-response' },
      ],
    },
  ]
}
