# An HTTP-Native Server Proxy, Copied From Nuxt API Party

Until 4.x the server proxy was one `POST` route that carried the real request as JSON: method and path came from the body, and a key chosen by the client told a KQL query from a REST request. 5.0 forwards method, path, query and body as they arrive, which removes the envelope with its types and checks, gives allowed routes real methods to match, and lets a body be something other than JSON. A KQL query stays a `POST`, so the change buys it no HTTP caching.

The proxy is copied from Nuxt API Party. `path.ts` and `stream.ts`, the path checks and the stream helper, are identical in both repos, so a fix is the same patch in each. `proxy.ts`, the handler, differs on purpose.

## Considered Options

- **Nuxt API Party installed as a module, with Kirby as one endpoint.** A prototype ran every feature this way, and it leaked: the `apiParty` config key and module types, the `/api/__api_party/kirby/**` route, API Party's error and log wording, a second family of environment variables, and a silent merge with an endpoint named `kirby` in the app's own config. The server cache had to hook the proxy's internal URL shape, and the Kirby credentials had to be rewritten per request in a hook.
- **A public subpath export of Nuxt API Party.** Every app with nuxt-kirby would install API Party with its dependencies, and API Party's version would carry the proxy's.
- **A package of its own for the two identical files.** Put off, not ruled out: what the two files export is the interface such a package would take over.

## Consequences

The handler calls no Nitro hooks, the server cache sits in a handler of its own in front of it, and it forwards less of a visitor's request – see [ADR 0002](./0002-configuration-decides-what-the-server-proxy-forwards.md).
