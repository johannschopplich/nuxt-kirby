# Server Imports

`$kql` and `$kirby` exist a second time for Nitro. They are auto-imported everywhere your server code runs – API routes, middleware, server plugins, tasks – and reach Kirby directly:

```ts
// `server/api/site.get.ts`
export default defineEventHandler(async () => {
  const { result } = await $kql({ query: 'site', select: ['title'] })
  return result
})
```

The auto-import is the only way in – the module registers no path you could import them from by hand. The names match the browser-side composables, but the signatures do not, so which one a call reaches depends on whether the file runs in the app or in Nitro.

Authentication comes from the module options and travels the same way the proxy sends it, and `language` becomes the `X-Language` header as it does in the browser.

## What They Leave Out

Server code needs neither the proxy nor the payload, so these are plain `$fetch` calls against Kirby and nothing more:

- **No proxy.** The request goes straight to Kirby rather than through `/api/__kirby__/{key}`, which saves the hop that only exists to keep your token off the client.
- **No payload cache.** Two calls for the same query are two round trips. Reach for Nitro's [`cachedEventHandler`](https://nitro.build/guide/cache), or for the [`server.cache`](/guides/caching-strategies#server-side-caching) option, which covers the proxy rather than these.
- **Their own options.** `NitroKqlFetchOptions` and `NitroKirbyFetchOptions` carry the `ofetch` options plus `language`. Options that only mean something in the browser – `payloadCache` above all – are absent rather than ignored.
