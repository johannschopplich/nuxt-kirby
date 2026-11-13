# Caching Strategies

Three caches sit between a component and Kirby, each with a different lifetime.

## Overview

| Cache Type | Location | Scope | Persistence | Best For |
|------------|----------|-------|-------------|----------|
| [**Payload**](#payload-caching) | Nuxt payload | Per call site | Until the page has hydrated | Every server-rendered query |
| [**Server-side**](#server-side-caching) | Server cache | All visitors | Configurable TTL | Expensive operations |
| [**Build-time**](/guides/prefetching-kql-queries) | `#nuxt-prepare` state | Permanent | Until rebuild | Stable content |

## Payload Caching

`useKql` and `useKirbyData` key each response as Nuxt's `useFetch` does – by call site and request – and add the language to the key. A response fetched during SSR reaches the browser in the payload, and the hydrating call reads it there instead of sending the query again. Two call sites asking for the same query send two requests – with the [server cache](#server-side-caching) on, Kirby answers only the first.

`$kql` and `$kirby` are plain fetches. A call that ran during SSR runs again while the page hydrates, and dev mode warns about it. Wrap it in `useAsyncData` to read the server's response from the payload instead:

```ts
import type { KirbyQueryRequest } from 'kirby-types'

const siteQuery = {
  query: 'site',
  select: ['title']
} satisfies KirbyQueryRequest

const { data: site } = await useAsyncData('site', () => $kql(siteQuery))
```

### Refresh or Clear a Query

`refresh` sends the query again and replaces the stored result, `clear` empties it without fetching:

```ts
const { data, refresh, clear } = await useKql(query)
```

## Server-Side Caching

The server cache answers KQL queries and `GET` requests through [Nitro's cache API](https://v2.nitro.build/guide/cache), for every visitor alike. It keys a response by method, URL, language and body, and of the errors stores a 404 or 410 alone, so any other failed request reaches Kirby again next time, while a page Kirby no longer has stops being served once its entry expires. Responses live in memory by default; any Nitro storage mountpoint persists them across restarts. [`forwardCookies`](/api/module-configuration#kirby-forwardcookies) turns the server cache off.

::: tip
All built-in storage mountpoints can be found in the [unstorage documentation](https://unstorage.unjs.io).
:::

Concurrent requests for the same query then cost one request to Kirby rather than one each.

You can enable server-side caching by setting the `server.cache` module option to `true`. You can also set a custom expiration time in seconds by setting the `server.maxAge` option:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kirby'],

  kirby: {
    server: {
      // Enable server-side caching
      // @default false
      cache: true,
      // Number of seconds to cache the data response
      // @default 1
      maxAge: 60 * 60 * 24 * 7, // 7 days
    }
  }
})
```

In production, set the `server.storage` option to the name of a custom storage mountpoint, such as Cloudflare KV when deploying to Cloudflare, and define that mountpoint in the `nitro.storage` section of your `nuxt.config.ts`:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kirby'],

  kirby: {
    server: {
      // Enable server-side caching
      // @default false
      cache: true,
      // Storage mountpoint to use for caching
      // @default 'cache'
      storage: 'kirby',
      // Number of seconds to cache the data response
      // @default 1
      maxAge: 60 * 60 * 24 * 7, // 7 days
    }
  },

  nitro: {
    storage: {
      kirby: {
        // https://unstorage.unjs.io/drivers/cloudflare
        driver: 'cloudflareKVBinding',
        // Make sure to link the namespace in your worker settings
        binding: 'KV_BINDING'
      }
    },
    // Make sure to define a fallback storage mountpoint for local development,
    // since the Cloudflare KV binding is not available locally
    devStorage: {
      kirby: {
        driver: 'fs',
        base: '.data',
      },
    },
  }
})
```

In the example above, the `kirby` storage mountpoint will use the Cloudflare KV driver for production and the `fs` driver for local development.
