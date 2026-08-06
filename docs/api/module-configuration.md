# Module Configuration

Nuxt Kirby is configured through the `kirby` property in your `nuxt.config.ts`.

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kirby'],

  kirby: {
    // ... Your options here
  }
})
```

Credentials are read from environment variables by default, so the common case needs no `kirby` block at all – see [Authentication](/essentials/authentication).

## `kirby.url`

Base URL of your Kirby installation, such as `https://kirby.example.com`. Everything the module requests is resolved against it.

**Default value**: `process.env.KIRBY_BASE_URL`

## `kirby.auth`

How the module authenticates against Kirby.

- `'basic'` – Sends `credentials.username` and `credentials.password` as HTTP Basic authentication.
- `'bearer'` – Sends `token` as a bearer token, which is what [Kirby Headless](https://github.com/johannschopplich/kirby-headless) expects.
- `'none'` – Sends no credentials. Use it for a publicly readable instance.

**Default value**: `'basic'`

## `kirby.token`

Bearer token for `auth: 'bearer'`. Ignored for the other methods.

**Default value**: `process.env.KIRBY_API_TOKEN`

## `kirby.credentials`

Username and password pair for `auth: 'basic'`. Ignored for the other methods.

**Default value**: `{ username: process.env.KIRBY_API_USERNAME, password: process.env.KIRBY_API_PASSWORD }`

## `kirby.kqlPath`

Path KQL queries are sent to, relative to `url`. Set it if your instance exposes KQL somewhere other than the default for your authentication method.

**Default value**: `'api/query'` for `auth: 'basic'`, `'api/kql'` for `auth: 'bearer'`

## `kirby.client`

Whether queries may be sent straight from the browser instead of through the server-side proxy.

Leaving this off is what keeps your token out of the client bundle. Turn it on only for an instance whose credentials may be public, or one that needs none.

If Nuxt SSR is disabled, this is enabled by default, because there is no server to proxy through.

**Default value**: `false`

## `kirby.prefetch`

Queries to run once at build time. Each result is written into the module's virtual file and importable from `#nuxt-kirby` under its key, fully typed and with no request at runtime.

```ts
export default defineNuxtConfig({
  kirby: {
    prefetch: {
      site: { query: 'site', select: ['title'] }
    }
  }
})
```

See [Prefetching KQL Queries](/guides/prefetching-kql-queries).

**Default value**: `{}`

## `kirby.server.cache`

Whether the proxy caches responses through Nitro's cache API. A cached response is reused for every visitor, so avoid it for anything visitor-specific.

**Default value**: `false`

## `kirby.server.storage`

Nitro storage mountpoint the cache writes to. A leading slash is added if you leave it out.

**Default value**: `'cache'`

## `kirby.server.swr`

Whether a stale response is served while a fresh one is fetched in the background.

**Default value**: `false`

## `kirby.server.maxAge`

How many seconds a cached response stays fresh.

**Default value**: `1`

## `kirby.server.verboseErrors`

Whether a failing query is logged in full.

::: warning
The log line contains the whole query, which may carry data you would rather not have in your server logs. Keep it off outside of debugging.
:::

**Default value**: `false`

## Type Declarations

<<< @/../src/module.ts#options
