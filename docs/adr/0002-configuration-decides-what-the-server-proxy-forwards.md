# Configuration Alone Decides What the Server Proxy Forwards

Nothing in a request widens what the server proxy does, so it cannot become a relay for any write the Kirby credentials permit. It forwards allowed routes only, by default `GET` and `HEAD` plus `POST` on the KQL path. Of a request's headers it forwards the language and those that describe the body, so the `headers` option of a composable stops at the proxy. Cookie forwarding is a module option, not a field of the request. What a KQL query asks for is not restricted.

## Consequences

The server cache is shared between visitors and keyed by a request's content alone, its language included, so it cannot tell two visitors apart. Cookie forwarding therefore turns the server cache off, and the proxy sends the Kirby instance no other header of the visitor – unlike Nuxt API Party's proxy, which passes every other header on and adds `x-forwarded-for`. Client mode sends none of the visitor's headers during SSR either.

A `set-cookie` of the Kirby instance reaches the visitor only with cookie forwarding, and with it the proxy refuses a cross-site request, as Nuxt API Party's does.
