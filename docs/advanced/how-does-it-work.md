# How It Works

::: info tl;dr
The `/api/__kirby__` server route proxies requests between your Nuxt app and Kirby. All requests are made server-side, avoiding CORS issues.
:::

All [composables](/api/) ([`useKql`](/api/use-kql), [`$kql`](/api/kql), etc.) send POST requests to the `/api/__kirby__` server route. The KQL query or request data goes in the request body.

This server route fetches data from your Kirby instance using your configuration (`KIRBY_BASE_URL`, `KIRBY_API_TOKEN`, etc.) and passes the response back to the client.

During server-side rendering, calls to `/api/__kirby__` directly invoke the relevant function (no HTTP overhead), so only the Nuxt-to-Kirby request is made.

::: info
A repeated request usually costs nothing: `useKql` and `useKirbyData` derive their async data key from the request, so two call sites asking for the same thing share one entry, and `$kql` and `$kirby` keep a payload cache of their own. Read more in the [Caching Strategies guide](/guides/caching-strategies).
:::

::: tip
The proxy layer will not only pass through your API's response body to the client, but also HTTP status code, HTTP status message and headers. This way, you can handle errors just like you would when directly querying the Kirby API.
:::
