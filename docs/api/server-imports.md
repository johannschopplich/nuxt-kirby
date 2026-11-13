# Server Imports

`$kql` and `$kirby` exist a second time for Nitro. They are auto-imported everywhere your server code runs – API routes, middleware, server plugins, tasks – and reach Kirby directly:

```ts
// `server/api/site.get.ts`
export default defineEventHandler(async () => {
  const { result } = await $kql({
    query: 'site',
    select: ['title']
  })
  return result
})
```

Where auto-imports are off, import them from `#imports`. The names and signatures match the app's `$kql` and `$kirby`, so which one a call reaches depends on whether the file runs in the app or in Nitro. Their options, `NitroKqlFetchOptions` and `NitroKirbyFetchOptions`, carry the `ofetch` options plus `language`.

Authentication comes from the module options and travels the same way the proxy sends it, and `language` becomes the `X-Language` header as it does in the browser.

## What They Leave Out

These are plain `$fetch` calls against Kirby and nothing more:

- **No server proxy.** The request goes straight to Kirby, so [`allowedRoutes`](/api/module-configuration#kirby-allowedroutes) do not apply and `headers` reach Kirby as given.
- **No server cache.** Two calls for the same query are two requests. Reach for Nitro's [`cachedEventHandler`](https://v2.nitro.build/guide/cache); the [`server.cache`](/guides/caching-strategies#server-side-caching) option covers the server proxy rather than these.
