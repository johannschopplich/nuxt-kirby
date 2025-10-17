# How It Works

::: info tl;dr
The `/api/__kirby__` server route proxies requests between your Nuxt app and Kirby. All requests are made server-side, avoiding CORS issues.
:::

All [composables](/api/) ([`useKql`](/api/use-kql), [`$kql`](/api/kql), etc.) send POST requests to the `/api/__kirby__` server route. The KQL query or request data goes in the request body.

This server route fetches data from your Kirby instance using your configuration (`KIRBY_BASE_URL`, `KIRBY_API_TOKEN`, etc.). The response is passed back to the client. This keeps credentials secure and avoids CORS issues.

During server-side rendering, calls to `/api/__kirby__` directly invoke the relevant function (no HTTP overhead), so only the Nuxt-to-Kirby request is made.

::: info
Responses are cached client-side by default. Subsequent calls will return cached responses, saving duplicated requests. Read more in the [Caching Strategies guide](/guides/caching-strategies).
:::

::: tip
The proxy layer will not only pass through your API's response body to the client, but also HTTP status code, HTTP status message and headers. This way, you can handle errors just like you would when directly querying the Kirby API.
:::
