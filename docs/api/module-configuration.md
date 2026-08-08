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

**Default Value**: `process.env.KIRBY_BASE_URL`

## `kirby.auth`

How the module authenticates against Kirby.

- `'basic'` – Sends `credentials.username` and `credentials.password` as HTTP Basic authentication.
- `'bearer'` – Sends `token` as a bearer token, which is what [Kirby Headless](https://github.com/johannschopplich/kirby-headless) expects.
- `'none'` – Sends no credentials. Use it for a publicly readable instance.

**Default Value**: `'basic'`

## `kirby.token`

Bearer token for `auth: 'bearer'`. Ignored for the other methods.

**Default Value**: `process.env.KIRBY_API_TOKEN`

## `kirby.credentials`

Username and password pair for `auth: 'basic'`. Ignored for the other methods.

**Default Value**: `{ username: process.env.KIRBY_API_USERNAME, password: process.env.KIRBY_API_PASSWORD }`

## `kirby.kqlPath`

Path KQL queries are sent to, relative to `url`. Set it if your instance exposes KQL somewhere other than the default for your authentication method.

**Default Value**: `'api/kql'` for `auth: 'bearer'`, `'api/query'` otherwise

## `kirby.client`

Whether queries may be sent straight from the browser instead of through the server-side proxy.

Leaving this off is what keeps your token out of the client bundle. Turn it on only for an instance whose credentials may be public, or one that needs none.

If Nuxt SSR is disabled, this is enabled by default, because there is no server to proxy through.

**Default Value**: `false`

## `kirby.forwardCookies`

Whether the visitor's cookies travel on to Kirby.

A Kirby session lives in a cookie. The server-side proxy builds its own request to Kirby, so without this the session never arrives and a logged-in visitor keeps receiving the logged-out response.

Every request that carries a cookie skips the [server-side cache](/guides/caching-strategies), in both directions: it is never answered from the store, and its response is never written there. One cached entry is shared between all visitors, and the cache key cannot see the cookie – so caching a personalized response would hand it to the next person on the same key.

Override it per call on `useKql`, `useKirbyData`, `$kql` and `$kirby`, which is the safer way round: turn it on for the queries that need a session rather than for all of them.

```ts
const { data } = await useKql({ query: 'user' }, { forwardCookies: true })
```

With `kirby.client` enabled there is no proxy to forward anything, so the option sends `credentials: 'include'` instead and Kirby has to answer with the matching CORS headers. On the server-rendered pass of that same setup the option has no say: Nuxt's `useRequestFetch()` hands Kirby the visitor's whole header set, cookie included, whether you asked for it or not.

**Default Value**: `false`

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

**Default Value**: `{}`

## `kirby.server.cache`

Whether the proxy caches responses through Nitro's cache API. A cached response is reused for every visitor, so avoid it for anything visitor-specific.

**Default Value**: `false`

## `kirby.server.storage`

Nitro storage mountpoint the cache writes to. A leading slash is added if you leave it out.

**Default Value**: `'cache'`

## `kirby.server.swr`

Whether a stale response is served while a fresh one is fetched in the background.

**Default Value**: `false`

## `kirby.server.maxAge`

How many seconds a cached response stays fresh.

**Default Value**: `1`

## `kirby.server.verboseErrors`

Whether a failing query is logged in full.

::: warning
The log line contains the whole query, which may carry data you would rather not have in your server logs. Keep it off outside of debugging.
:::

**Default Value**: `false`

## Type Declarations

<<< @/../src/module.ts#options
