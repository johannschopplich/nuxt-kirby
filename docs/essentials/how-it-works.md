# How It Works

The server proxy at `/api/__kirby__/**` forwards requests between your Nuxt app and Kirby. Unless client mode is on, all requests to Kirby are made server-side, avoiding CORS issues. The route sits below `nitro.apiBaseURL`, which defaults to `/api`.

Outside client mode, all [composables](/api/) ([`useKql`](/api/use-kql), [`$kql`](/api/kql), etc.) send their requests to the server proxy, which forwards method, path, query and body as they arrive and adds the Kirby credentials: `GET /api/__kirby__/api/pages/notes` reaches Kirby as `GET <url>/api/pages/notes`. A KQL query is a `POST` to the [KQL path](/api/module-configuration#kirby-kqlpath), with the query as the body.

The server proxy forwards [allowed routes](/api/module-configuration#kirby-allowedroutes) only – by default `GET` and `HEAD` on every path plus `POST` on the KQL path – and refuses every other request with 403. Of the visitor's headers it forwards the language (`X-Language`), `content-type` and `content-length`, and the cookie only with [`forwardCookies`](/api/module-configuration#kirby-forwardcookies).

Kirby's response comes back with its HTTP status code, status message and headers, so you [handle errors](/guides/error-handling) just like you would when querying the Kirby instance directly. The proxy withholds `server` and `x-powered-by`, and `set-cookie` unless `forwardCookies` is on.

During server-side rendering, calls to the server proxy directly invoke its handler (no HTTP overhead), so only the Nuxt-to-Kirby request is made. A response fetched by `useKql` or `useKirbyData` reaches the browser in the payload, so hydration does not send it again – see [Caching Strategies](/guides/caching-strategies).
