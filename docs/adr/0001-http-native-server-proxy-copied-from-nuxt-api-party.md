# An HTTP-Native Server Proxy, Copied From Nuxt API Party

The server proxy forwards method, path, query and body as they arrive. The alternative is one `POST` route that carries the real request as JSON, with method and path in the body and a key chosen by the client to tell a KQL query from a REST request. Without that envelope there are no types and checks for it, allowed routes have real methods to match, and a body can be something other than JSON. A KQL query stays a `POST`, so it gains no HTTP caching.

The proxy is copied from Nuxt API Party. `path.ts` and `stream.ts`, the path checks and the stream helper, are identical in both repos, so a fix is the same patch in each. `path.ts` imports no framework, because client mode's `$kirby` loads it into the Vue app as well: its checks return a result rather than throw, and each caller throws its own error. `proxy.ts`, the handler, differs on purpose: nuxt-kirby's runs on Nuxt's portable `nuxt/server`, while Nuxt API Party's stays on h3 and Nitro, whose runtime hooks it calls, and supports Nuxt below 4.6.

## Considered Options

- **Nuxt API Party installed as a module, with Kirby as one endpoint.** A prototype ran every feature this way, and it leaked: the `apiParty` config key and module types, the `/api/__api_party/kirby/**` route, API Party's error and log wording, a second family of environment variables, and a silent merge with an endpoint named `kirby` in the app's own config. The server cache had to hook the proxy's internal URL shape, and the Kirby credentials had to be rewritten per request in a hook.
- **A public subpath export of Nuxt API Party.** Every app with nuxt-kirby would install API Party with its dependencies, and API Party's version would carry the proxy's.
- **A package of its own for the two identical files.** Put off, not ruled out: what the two files export is the interface such a package would take over.

## Consequences

The handler calls no Nitro hooks, the server cache sits in a handler of its own in front of it and runs on `ocache` rather than Nitro's cache, and the handler forwards less of a visitor's request – see [ADR 0002](./0002-configuration-decides-what-the-server-proxy-forwards.md).
