# Migration

## v5.0.0

A removed option, a renamed environment variable, an unknown `auth` value and an option that conflicts with client mode fail the setup with `Invalid Nuxt Kirby options:`, one line per problem, and a link to this page.

### Nuxt 4.6 Is the Floor and `kirby-types` a Peer Dependency

Nuxt Kirby 5 requires Nuxt 4.6 or a later Nuxt 4 release. `kirby-types` is a peer dependency now, so add it to your project – v1 for Kirby 4 and 5, v2 for Kirby 6, published under the `next` tag:

```bash
# Kirby 4 and 5
pnpm add -D kirby-types

# Kirby 6
pnpm add -D kirby-types@next
```

In kirby-types 2, `KirbyQueryModel` is renamed `KirbyQueryRoot`, the result of `ParseKirbyQuery` names its root `root` instead of `model`, and block toggles such as `crop` or `autoplay` are `boolean` instead of `'true' | 'false'`.

### The Environment Variables Are Renamed

| 4.x | 5.0 |
| --- | --- |
| `KIRBY_BASE_URL` | `NUXT_KIRBY_URL` |
| `KIRBY_API_TOKEN` | `NUXT_KIRBY_TOKEN` |
| `KIRBY_API_USERNAME` | `NUXT_KIRBY_CREDENTIALS_USERNAME` |
| `KIRBY_API_PASSWORD` | `NUXT_KIRBY_CREDENTIALS_PASSWORD` |

4.x read the old names at build time. 5.0 reads the new ones at build time as the option defaults, and Nuxt applies them to the runtime config at runtime – in client mode as `NUXT_PUBLIC_KIRBY_URL` and so on. Rename them in `.env` and wherever you deploy. An old variable still set while neither its successor nor the option is fails the setup:

```
The `KIRBY_API_TOKEN` environment variable is no longer read. Rename it to `NUXT_KIRBY_TOKEN`.
```

A missing URL, token or username and password no longer logs an error at setup. For a missing URL, the server proxy answers 500 instead and logs ``[nuxt-kirby] The Kirby URL is missing. Set `NUXT_KIRBY_URL` or the `url` option.``

### `prefetch` Is Removed

The option ran KQL queries at build time and exported their results from `#nuxt-kirby`. A [nuxt-prepare](https://nuxt-prepare.byjohann.dev) script does the same – see [Prefetching KQL Queries](/guides/prefetching-kql-queries) – and the imports move to `#nuxt-prepare`, which exports a PascalCase type per key as well:

```ts
import type { Site } from '#nuxt-kirby' // [!code --]
import type { Site } from '#nuxt-prepare' // [!code ++]
import { site } from '#nuxt-kirby' // [!code --]
import { site } from '#nuxt-prepare' // [!code ++]
```

Left in place, the option fails the setup with ``The `prefetch` option was removed. Fetch the query in a nuxt-prepare script instead.``

### `server.verboseErrors` Is Removed

The server proxy no longer logs a failed request, so there is nothing left to make verbose: it passes Kirby's answer on as it is. Delete the key, which fails the setup otherwise.

### Client Mode Rejects the Options of the Server Proxy

`client: true` together with `forwardCookies`, `allowedRoutes` or `server.cache` fails the setup, since client mode skips the server proxy that acts on them. Drop one or the other. In 4.x, `forwardCookies` in client mode sent `credentials: 'include'`; pass it to the request yourself for the browser to send its own cookie for the Kirby URL.

With `ssr: false`, client mode is the default only while none of the three is set, so setting one keeps requests on the server proxy.

### `forwardCookies` Is a Module Option Only

The per-call `forwardCookies` option of `useKql`, `useKirbyData`, `$kql` and `$kirby` is gone, which surfaces as a compile error. Set the [module option](/api/module-configuration#kirby-forwardcookies) instead, which applies to every request through the server proxy:

```ts
const { data } = await useKql({ query: 'user' }, { forwardCookies: true }) // [!code --]
const { data } = await useKql({ query: 'user' }) // [!code ++]
```

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  kirby: {
    forwardCookies: true
  }
})
```

With it, the proxy forwards the visitor's cookie during SSR too, passes Kirby's `set-cookie` on to a request the browser sends, refuses a cross-site request with 403, and turns the server cache off – setting both logs a warning at setup.

### `$kql` and `$kirby` Are Plain Fetches

Their `payloadCache` and `key` options are gone, which surfaces as a compile error. A call outside `useAsyncData` that ran during SSR runs again while the page hydrates, and dev mode warns about it:

```
[nuxt-kirby] `$kql` sent a request during hydration. If the server sent it as well while rendering the page, wrap the call in `useAsyncData` or use `useKql` to reuse the server's response.
```

Wrap the call in `useAsyncData`, or switch to `useKql` or `useKirbyData`:

```ts
const site = await $kql(siteQuery, { payloadCache: false }) // [!code --]
const { data: site } = await useAsyncData('site', () => $kql(siteQuery)) // [!code ++]
```

A call in an event handler runs after hydration and needs no change.

### `useKql` and `useKirbyData` Take `useFetch`'s Options

Both are built on Nuxt's `createUseFetch` now. They take [`useFetch`'s options](https://nuxt.com/docs/api/composables/use-fetch#parameters) – `transform`, `pick`, `default`, `lazy`, `server`, `immediate`, `watch`, `getCachedData`, `dedupe` and the rest – and are typed like `useFetch`, so `data` follows `transform`, `pick` and `default`. A type argument still names the response, as in `useKql<KirbyQueryResponse<KirbySite>>(query)`.

### Two Call Sites With the Same Query Send Two Requests

4.x keyed both composables by a hash of the request, so two call sites with the same query shared one request. Nuxt keys each call site now and adds the language, so each call site sends its own request. Where several components need one query, fetch it once and pass the result down, or turn on the [server cache](/guides/caching-strategies#server-side-caching), which answers the repeat without reaching Kirby.

### The Server Proxy Forwards Allowed Routes Only

4.x relayed any method to any path with the Kirby credentials. 5.0 forwards `GET` and `HEAD` on every path and `POST` on the KQL path, and answers every other request with 403 `Route is not allowed` without reaching Kirby. List the writes your app sends in [`allowedRoutes`](/api/module-configuration#kirby-allowedroutes). A list of your own replaces the default, so name the default routes again – here with `auth: 'bearer'`, whose KQL path is `api/kql`; with basic authentication it is `api/query`:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  kirby: {
    allowedRoutes: [ // [!code ++]
      { // [!code ++]
        path: '**', // [!code ++]
        methods: ['GET', 'HEAD'] // [!code ++]
      }, // [!code ++]
      { // [!code ++]
        path: 'api/kql', // [!code ++]
        methods: ['POST'] // [!code ++]
      }, // [!code ++]
      { // [!code ++]
        path: 'api/pages/*/children', // [!code ++]
        methods: ['POST'] // [!code ++]
      } // [!code ++]
    ] // [!code ++]
  }
})
```

### Only the Language and the Body Headers Reach Kirby

4.x forwarded the `headers` of a request through the server proxy. 5.0 forwards `X-Language`, `content-type` and `content-length` alone, so the `headers` option of `useKql`, `useKirbyData`, `$kql` and `$kirby` no longer reaches Kirby through the proxy. It still does in client mode and from the [server imports](/api/server-imports): send a request that needs a header of its own from an API route of yours. Client mode, which in 4.x passed the visitor's whole header set to Kirby during SSR, passes none of them either.

Kirby's `set-cookie` reaches the visitor only with `forwardCookies` now, where 4.x passed it on always, and only on a request the browser sends to the server proxy – not from one sent during SSR.

### The Server Proxy Forwards a Request as It Arrives

4.x sent every request as a `POST` to `/api/__kirby__/:key`, with method, path and body in a JSON envelope. 5.0 forwards method, path, query and body as they arrive at `<nitro.apiBaseURL>/__kirby__/**`: `GET /api/__kirby__/api/pages/notes` reaches Kirby as `GET <url>/api/pages/notes`, and a KQL query is a `POST` to the KQL path. Update a firewall, CDN or rate-limit rule that names the old route or matches on its `POST` requests.

### The Server Cache Stores KQL Queries and `GET` Requests Alone

4.x stored the response to every request through the server proxy, a write and an error included. 5.0 stores KQL queries and `GET` requests, keyed by method, URL, language and body, and of the errors a 404 or 410 alone. Drop a workaround that cleared the cache after a failed request.

### An Unreachable Kirby Is a 502

The server proxy answered 503 `Service Unavailable` when it could not reach Kirby. It answers 502 `Bad Gateway` now; check for 502 wherever you checked for 503.

## v4.0.0

### `cache` Is Now `payloadCache`

The option that controls whether a response is kept in the Nuxt payload is named for what it does, so `cache` is free for its `RequestInit` meaning:

```ts
const site = await $kql(query, {
  cache: false, // [!code --]
  payloadCache: false // [!code ++]
})
```

It is a compile error either way, so the rename surfaces on upgrade. The same rename applies to `$kirby`. `useKql` and `useKirbyData` lose the option altogether, see below.

### `useKql` and `useKirbyData` Have No `payloadCache` Option

Both composables cached a response under the same key Nuxt stores its own result under, which meant a refresh was answered with the previous result – and, where a `transform` was set, with a result that had already been transformed once. Nuxt's async data owns the entry now: the key still comes from the request, and `refresh()` sends the request again. Drop the option; `$kql` and `$kirby` keep it.

### `$kql` and `$kirby` Cache Under Their Own Key

Both used to read the entry `useKql` and `useKirbyData` fill, which holds whatever their `transform` returned – so the same query could come back in a shape the return type does not describe. They keep their own entry now. A query shared with a composable costs one more round trip in return.

### The Server Cache Is No Longer Switchable Per Call

A request used to carry its `cache` value to the proxy route, where it gated the Nitro cache alongside the [`server.cache`](/guides/caching-strategies#server-side-caching) module option. A caller could therefore bypass your server cache. The module option decides alone now, and `payloadCache` reaches no further than the Nuxt payload.

### `useKql` and `useKirbyData` Forward Every Async Data Option

`deep`, `dedupe`, `getCachedData`, `pick` and `transform` used to type-check and do nothing. They now reach `useAsyncData`.

### `language` Travels as a Header, Not a Path Prefix

`useKirbyData` and `$kirby` used to prepend the language code to the path, so `useKirbyData('api/notes', { language: 'de' })` requested `de/api/notes`. Both now send the code as the `X-Language` header instead, which is what Kirby reads on API routes, and the path is left as written. `useKql` and `$kql` already sent the header and are unaffected.

Nothing changes for a multi-language Kirby that resolves the language from the header. Drop the workaround if you were stripping the prefix on the Kirby side.

If you fetch a page by its own path rather than through the API – with the `headless.globalRoutes` option of [Kirby Headless](https://github.com/johannschopplich/kirby-headless) – the header reaches the page from 8.1 on. On earlier versions the language belongs in the path you request:

```ts
const { data } = await useKirbyData(`${locale.value}/about`)
```

See [Multi-Language Sites](/guides/multi-language-sites) for both cases.

### `prefix` Removed in Favor of `kqlPath`

The `prefix` module option is gone; rename the key and keep the value:

```ts
export default defineNuxtConfig({
  kirby: {
    prefix: 'api/query', // [!code --]
    kqlPath: 'api/query', // [!code ++]
  },
})
```

It was deprecated in v3.0.1 and warned at build time. A `prefix` left in place is now ignored, so `kqlPath` falls back to `api/query` or `api/kql` depending on the authentication method – which surfaces as 404s at request time rather than as a build error.

### The `#nuxt-kql` Import Alias Is Gone

The back-compat alias kept through v3 has been removed. Types come from [`kirby-types`](/api/types), a dependency of the module (under pnpm, add it to your project yourself):

```ts
import type { KirbyQueryRequest } from 'kirby-types' // [!code ++]
import type { KirbyQueryRequest } from '#nuxt-kql' // [!code --]
```

`#nuxt-kirby` is the alias for [prefetched queries](/guides/prefetching-kql-queries) and re-exports the same types, so it works here as well, without `kirby-types` in your project.

## v3.0.0

### Renamed From Nuxt KQL to Nuxt Kirby

[Matt Lenz](https://github.com/mattlenz) kindly provided the `nuxt-kirby` npm package name and has transferred the ownership of the package to me. Therefore, the module name has changed from `nuxt-kql` to `nuxt-kirby`.

Beyond the name, only the configuration key changes, from `kql` to `kirby`. To migrate a Nuxt KQL v2 project to Nuxt Kirby v3:

1. Uninstall the `nuxt-kql` module and install the `nuxt-kirby` module instead:
   ```bash
   npm uninstall nuxt-kql && npm install -D nuxt-kirby

   # pnpm
   pnpm remove nuxt-kql && pnpm add -D nuxt-kirby

   # yarn
   yarn remove nuxt-kql && yarn add -D nuxt-kirby
   ```

2. Replace `kql` with `kirby` in your `nuxt.config.ts`:
   ```ts
   // `nuxt.config.ts`
   export default defineNuxtConfig({
     modules: ['nuxt-kql'], // [!code --]
     modules: ['nuxt-kirby'], // [!code ++]

     kql: { // [!code --]
       auth: 'bearer' // [!code --]
     }, // [!code --]
     kirby: { // [!code ++]
       auth: 'bearer' // [!code ++]
     }, // [!code ++]
   })
   ```

v3 kept the import alias `#nuxt-kql` alongside the new one; [v4 removed it](#the-nuxt-kql-import-alias-is-gone).
