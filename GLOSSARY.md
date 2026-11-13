# Nuxt Kirby

A Nuxt module that reaches a Kirby instance through composables, keeping the Kirby credentials on the server.

## Language

### Kirby

**Kirby instance**:
The Kirby installation the app is configured to call: one URL and, unless it needs none, one set of Kirby credentials.
_Avoid_: Kirby site, backend, CMS, Kirby API

**Kirby credentials**:
The bearer token, or the username and password, added to every request to the Kirby instance.
_Avoid_: API key, secrets, auth

**KQL query**:
A request for content written in Kirby's query language and sent to the KQL path of the Kirby instance.
_Avoid_: query request, KQL request

**REST request**:
Any other request to the Kirby instance, addressed by its path below the instance's URL.
_Avoid_: API request, Kirby request

**Language**:
The Kirby language a request asks its content in.
_Avoid_: locale, translation

### Reaching Kirby

**Server proxy**:
The public route of the app that forwards a KQL query or a REST request to the Kirby instance, adding the Kirby credentials on the way.
_Avoid_: server route, server handler, proxy mode

**Allowed route**:
A path pattern, optionally limited to methods, naming the requests the server proxy may forward; it refuses every request that matches none.
_Avoid_: allowlist, whitelist

**Client mode**:
The setup that publishes the URL and the Kirby credentials to the browser, so every request goes straight to the Kirby instance – during SSR too – and never through the server proxy.
_Avoid_: client request, direct mode

**Server import**:
A function that server code calls to reach the Kirby instance with the Kirby credentials, without the server proxy.
_Avoid_: server composable, server-side `$kql`

**Server cache**:
The store on the app's server that holds responses of the Kirby instance for every visitor alike.
_Avoid_: Nitro cache

**Cookie forwarding**:
The server proxy passing the cookie a visitor's browser sent to the app on to the Kirby instance, and the cookies the Kirby instance sets back to the visitor.
_Avoid_: credential forwarding
