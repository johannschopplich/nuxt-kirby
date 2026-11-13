# Configuration Alone Decides What the Server Proxy Forwards

Until 4.x a request's body named the method, the path and whether the visitor's cookie went along, and the server proxy sent all of it with the Kirby credentials – a relay for any write the credentials permit. From 5.0 nothing in a request widens what the proxy does. It forwards allowed routes only, by default `GET` and `HEAD` plus `POST` on the KQL path. Of a request's headers it forwards the language and those that describe the body, so the `headers` option of a composable no longer reaches the Kirby instance through the proxy. Cookie forwarding is a module option, no longer a field of the request. What a KQL query asks for is not restricted.

## Consequences

The server cache is shared between visitors and keyed by a request's content alone, its language included, so it cannot tell two visitors apart. Cookie forwarding therefore turns the server cache off, and the proxy sends the Kirby instance no other header of the visitor – unlike Nuxt API Party's proxy, which passes `user-agent`, `accept-language` and `x-forwarded-for` on. Client mode, which in 4.x passed the visitor's whole header set during SSR, sends none of them there either.

A `set-cookie` of the Kirby instance reaches the visitor only with cookie forwarding, and with it the proxy refuses a cross-site request, as Nuxt API Party's does.
