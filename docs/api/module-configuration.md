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

The URL and the Kirby credentials are read from environment variables by default, so the common case needs no `kirby` block at all – see [Authentication](/essentials/authentication). Each variable also overrides its option at runtime; in client mode, its `NUXT_PUBLIC_` twin does, such as `NUXT_PUBLIC_KIRBY_URL`.

## `kirby.url`

Base URL of your Kirby installation, such as `https://kirby.example.com`. Everything the module requests is resolved against it.

Without a URL, the server proxy answers 500 and logs ``[nuxt-kirby] The Kirby URL is missing. Set `NUXT_KIRBY_URL` or the `url` option.``

**Default Value**: `process.env.NUXT_KIRBY_URL`

## `kirby.auth`

How the module authenticates against Kirby.

- `'basic'` – Sends `credentials.username` and `credentials.password` as HTTP Basic authentication.
- `'bearer'` – Sends `token` as a bearer token, which is what [Kirby Headless](https://github.com/johannschopplich/kirby-headless) expects.
- `'none'` – Sends no credentials. Use it for a publicly readable instance.

The default `kqlPath` follows it at build time, so don't override it with `NUXT_KIRBY_AUTH` at runtime.

**Default Value**: `'basic'`

## `kirby.token`

Bearer token for `auth: 'bearer'`. Ignored for the other methods.

**Default Value**: `process.env.NUXT_KIRBY_TOKEN`

## `kirby.credentials`

Username and password pair for `auth: 'basic'`. Ignored for the other methods.

**Default Value**: `{ username: process.env.NUXT_KIRBY_CREDENTIALS_USERNAME, password: process.env.NUXT_KIRBY_CREDENTIALS_PASSWORD }`

## `kirby.kqlPath`

Path KQL queries are sent to, relative to `url`. Set it if your instance exposes KQL somewhere other than the default for your authentication method. The default allowed routes and the composables take it from the build, so don't override it with `NUXT_KIRBY_KQL_PATH` at runtime.

**Default Value**: `'api/kql'` for `auth: 'bearer'`, `'api/query'` otherwise

## `kirby.client`

Whether every request goes straight to Kirby – from the browser and during SSR – instead of through the server proxy.

Leaving this off is what keeps your token out of the client bundle. Turn it on only for an instance whose credentials may be public, or one that needs none.

If Nuxt SSR is disabled, this is on unless you set it to `false` or set `forwardCookies`, `allowedRoutes` or `server.cache`, because a client-rendered app often has no server to proxy through. `client: true` together with one of these three fails the setup, since only the server proxy acts on them.

With it on, requests go directly from the browser to Kirby, which may cause CORS issues depending on your Kirby setup. Configure Kirby's `cors` option (Kirby 5.2 or later):

```php
// site/config/config.php
return [
    'cors' => [
        'allowOrigin' => 'https://your-nuxt-app.com',
        'allowHeaders' => ['Content-Type', 'Authorization', 'X-Language']
    ]
];
```

**Default Value**: `false`, or `true` if Nuxt SSR is disabled and none of `forwardCookies`, `allowedRoutes` and `server.cache` is set

## `kirby.forwardCookies`

Whether the visitor's cookie travels on to Kirby, and, on a request the browser sends, the cookies Kirby sets back to the visitor.

A Kirby session lives in a cookie. The server proxy builds its own request to Kirby, so without this the session never arrives and a logged-in visitor keeps receiving the logged-out response. With it, the proxy forwards the cookie during SSR too, passes Kirby's `set-cookie` on to a request the browser sends – a request sent during SSR returns only the body – and refuses a request the browser marks cross-site with 403.

Turning it on skips the [server cache](/guides/caching-strategies#server-side-caching), in both directions: the request is never answered from the store, and its response is never written there. That holds whether or not the visitor actually sent a cookie – the option is the gate, not the cookie. One cached entry is shared between all visitors, and the cache key cannot see the cookie, so caching a personalized response would hand it to the next person on the same key. Setting both logs a warning at setup.

With `client: true` there is no proxy to forward anything, and the option fails the setup. Pass `credentials: 'include'` to a request instead, for the browser to send its own cookie for the Kirby URL; Kirby then has to answer with the matching CORS headers.

**Default Value**: `false`

## `kirby.allowedRoutes`

Routes the server proxy forwards. Each route has a `path` below the Kirby URL, where `*` matches one segment and a trailing `**` any number of them, and optionally `methods`; a route without `methods` accepts every method. A request that matches no route gets 403 `Route is not allowed` without reaching Kirby. The routes do not limit what a KQL query asks for.

A list of your own replaces the default rather than adding to it, so it has to name the KQL path for KQL queries to pass. To allow creating pages besides the default routes, with `auth: 'bearer'`:

```ts
export default defineNuxtConfig({
  kirby: {
    allowedRoutes: [
      {
        path: '**',
        methods: ['GET', 'HEAD']
      },
      {
        path: 'api/kql',
        methods: ['POST']
      },
      {
        path: 'api/pages/*/children',
        methods: ['POST']
      }
    ]
  }
})
```

::: warning
The server proxy adds the Kirby credentials to every request it forwards, and every visitor of your app can send one. An allowed write route lets anyone write with the permissions of those credentials.
:::

With `client: true`, the option fails the setup: client mode publishes the Kirby credentials and skips the server proxy, so the routes would protect nothing.

**Default Value**: `[{ path: '**', methods: ['GET', 'HEAD'] }, { path: kqlPath, methods: ['POST'] }]`

## `kirby.server.cache`

Whether the server cache answers KQL queries and `GET` requests, through Nitro's cache API. A stored response is reused for every visitor, so avoid it for anything visitor-specific; `forwardCookies` turns it off. Of the errors, a 404 or 410 alone is stored – see [Caching Strategies](/guides/caching-strategies#server-side-caching).

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

## Type Declarations

<<< @/../src/module.ts#options
