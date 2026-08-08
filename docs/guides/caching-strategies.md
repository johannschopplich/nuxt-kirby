# Caching Strategies

Three caches sit between a component and Kirby, each with a different lifetime.

## Overview

| Cache Type | Location | Scope | Persistence | Best For |
|------------|----------|-------|-------------|----------|
| [**Payload**](#payload-caching) | Nuxt payload | Per session | Until page reload | Frequent queries |
| [**Server-side**](#server-side-caching) | Nitro cache | Cross-request | Configurable TTL | Expensive operations |
| [**Build-time**](/guides/prefetching-kql-queries) | Static files | Permanent | Until rebuild | Stable content |

## Payload Caching

`useKql` and `useKirbyData` derive their async data key from the request, so two call sites asking for the same thing share one entry and one round trip:

```ts
// First call - fetches from Kirby
const { data: firstCall } = await useKql({
  query: 'site',
  select: ['title']
})

// Second call - resolves from the entry the first one filled
const { data: secondCall } = await useKql({
  query: 'site',
  select: ['title']
})
```

The key covers:

- Query content (for KQL)
- Path, method, query parameters and body (for direct API)
- Language setting

`$kql` and `$kirby` have no async data around them, so they keep a payload cache of their own. Set their `payloadCache` option to `false` for real-time data that changes frequently:

```ts
const site = await $kql(query, {
  payloadCache: false
})
```

The option governs repeated calls within one environment, not the handover between them. A response fetched during SSR always travels to the client in the payload, and the hydrating call reads it there – otherwise every query would cost a second round trip in the browser for no gain. Caching stops after that: the next call sends the query again.

### Custom Cache Management

`refresh` sends the query again and replaces the stored result, `clear` empties it without fetching:

```ts
const { data, refresh, clear } = await useKql(query)
```

## Server-Side Caching

The proxy can cache responses through [Nitro's cache API](https://nitro.build/guide/cache). They live in memory by default; any Nitro storage mountpoint persists them across restarts.

::: tip
All built-in storage mountpoints can be found in the [unstorage documentation](https://unstorage.unjs.io).
:::

Concurrent requests for the same query then cost one round trip to Kirby rather than one each.

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

The module will use the `cache` storage mountpoint by default. However, for better control over your cache, a custom storage mountpoint is best suited in production environments. For development purposes, you can use the built-in `fs` storage mountpoint.

::: info
For example, if you are deploying to Cloudflare, the Cloudflare KV storage would be a good choice.
:::

To define a custom storage mountpoint, set the `server.storage` option to the name of your custom mountpoint. Then, define the storage mountpoint in the `nitro.storage` section of your `nuxt.config.ts`:

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
