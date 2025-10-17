# Caching Strategies

Nuxt Kirby provides multiple caching layers to optimize performance.

## Overview

| Cache Type | Location | Scope | Persistence | Best For |
|------------|----------|-------|-------------|----------|
| [**Client-side**](#client-side-caching) | Browser memory | Per session | Until page reload | Frequent queries |
| [**Server-side**](#server-side-caching) | Nitro cache | Cross-request | Configurable TTL | Expensive operations |
| [**Build-time**](/guides/prefetching-kql-queries) | Static files | Permanent | Until rebuild | Stable content |

## Client-Side Caching

All composables (`useKql`, `useKirbyData`, `$kql`, `$kirby`) cache responses by default to avoid duplicate requests.

### Caching Behavior

```ts
// First call - fetches from Kirby
const { data: firstCall } = await useKql({
  query: 'site',
  select: ['title']
})

// Second call - returns cached data instantly
const { data: secondCall } = await useKql({
  query: 'site',
  select: ['title']
})
```

Nuxt Kirby generates unique cache keys for each query based on its parameters. This ensures that different queries are cached separately. The cache key includes:

- Query content (for KQL)
- Path and parameters (for direct API)
- Language setting
- Request headers

### Disabling Client-Side Caching

You can disable the client-side cache by setting the `cache` option to `false`. This is useful for real-time data that changes frequently.

```ts
// Disable caching for real-time data
const { data } = await useKql(query, {
  cache: false
})
```

### Custom Cache Management

In some cases, you might want to manually control when to refresh or clear the cache. You can use the `refresh` and `clear` methods provided by the composables.

```ts
// Custom cache management
const { data, refresh, clear } = await useKql(query)

async function updateData() {
  clear()
  await refresh()
}
```

## Server-Side Caching

With Nuxt Kirby, you can opt in to server-side caching of data responses. This is achieved by using the [cache API](https://nitro.build/guide/cache) of Nuxt's underlying server engine, [Nitro](https://nitro.build). By default, data responses are cached in memory, but you can use any storage mountpoint supported by Nitro to persist the response on the server for future requests from the client.

::: tip
All built-in storage mountpoints can be found in the [unstorage documentation](https://unstorage.unjs.io).
:::

For short, concurrent requests on your site, caching will significantly improve performance because the data response will be served from the server cache rather than being fetched from Kirby again.

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
