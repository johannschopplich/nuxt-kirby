# What is Nuxt Kirby?

Nuxt Kirby is a [Nuxt](https://nuxt.com) module for reading and writing Kirby CMS content. Requests travel through a Nuxt server route, so the Kirby credentials never reach the browser, and the same composables work server-side and client-side.

## Two Ways to Reach Kirby

**KQL**, [Kirby's Query Language](/essentials/what-is-kql), for content queries that follow relationships and filter:

```ts
const { data, error } = await useKql({
  query: 'site',
  select: ['title', 'children']
})
```

**The Kirby REST API**, for plain requests, file downloads and endpoints of your own:

```ts
const { data, error } = await useKirbyData('api/pages/blog')
```

Both cache their responses and surface errors the same way. [Data Fetching Methods](/essentials/data-fetching-methods) covers which to reach for.

## Kirby Headless Plugin

The [Kirby Headless plugin](https://kirby.tools/docs/headless/getting-started/) adds a KQL endpoint with token authentication and takes care of CORS. It is optional, but it is what this module is built against, and the recommended setup for a headless Kirby.

It brings:

- 🧩 Optional bearer token authentication for [KQL](https://kirby.tools/docs/headless/usage/kql) and custom API endpoints
- 🧱 Resolve fields in blocks: [UUIDs to file and page objects](https://kirby.tools/docs/headless/usage/field-methods) or [any other field](https://kirby.tools/docs/headless/usage/field-methods)
- ⚡️ Cached KQL queries
- 🌐 Multi-language support for KQL queries
- 😵 Built-in CORS handling
- 🍢 Express-esque [API builder](https://kirby.tools/docs/headless/advanced/api-builder) with middleware support
- 🗂 Return [JSON from templates](https://kirby.tools/docs/headless/usage/json-templates) instead of HTML

## Next Steps

- [Getting Started](/essentials/getting-started) – Install the module and send a first query.
- [Data Fetching Methods](/essentials/data-fetching-methods) – Choose between KQL and the REST API.
- [Authentication](/essentials/authentication) – Set up bearer or basic authentication.
- [Starter Kits](/essentials/starter-kits) – Ready-made templates to build on.
