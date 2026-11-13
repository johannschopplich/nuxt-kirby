# How It Works

The `/api/__kirby__` server route proxies requests between your Nuxt app and Kirby. All requests are made server-side, avoiding CORS issues.

All [composables](/api/) ([`useKql`](/api/use-kql), [`$kql`](/api/kql), etc.) send POST requests to the `/api/__kirby__` server route. The KQL query or request data goes in the request body.

This server route fetches data from your Kirby instance using your configuration (`KIRBY_BASE_URL`, `KIRBY_API_TOKEN`, etc.) and passes the response back to the client – not only the response body, but also HTTP status code, HTTP status message and headers, so you [handle errors](/guides/error-handling) just like you would when directly querying the Kirby API.

During server-side rendering, calls to `/api/__kirby__` directly invoke the relevant function (no HTTP overhead), so only the Nuxt-to-Kirby request is made. A repeated request usually costs nothing – see [Caching Strategies](/guides/caching-strategies).
