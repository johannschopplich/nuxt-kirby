# What is Nuxt Kirby?

Nuxt Kirby is a [Nuxt](https://nuxt.com) module for seamless Kirby CMS integration. Fetch content with **KQL (Kirby Query Language)** for complex queries or **direct API access** for simple requests. Credentials stay protected, everything works server-side and client-side.

## Two Ways to Fetch Data

Nuxt Kirby offers flexibility in how you access your Kirby content:

### 1. KQL (Kirby Query Language)
Perfect for complex content queries with relationships and filtering:

```ts
const { data, error } = await useKql({
  query: 'site',
  select: ['title', 'children']
})
```

### 2. Direct Kirby API Access
Ideal for simple data fetching, file downloads, and custom endpoints:

```ts
const { data, error } = await useKirbyData('api/pages/blog')
```

Both methods provide caching, error handling, and credential protection out of the box.

## Kirby Headless Plugin

The [Kirby Headless plugin](https://kirby.tools/docs/headless/getting-started/) simplifies headless Kirby setup. It provides a custom KQL endpoint with token authentication and handles common pitfalls like CORS. While optional, it's the recommended approach for headless Kirby. This module is designed to work seamlessly with it.

Features:

- 🧩 Optional bearer token authentication for [KQL](https://kirby.tools/docs/headless/usage/kql) and custom API endpoints
- 🧱 Resolve fields in blocks: [UUIDs to file and page objects](https://kirby.tools/docs/headless/usage/field-methods) or [any other field](https://kirby.tools/docs/headless/usage/field-methods)
- ⚡️ Cached KQL queries
- 🌐 Multi-language support for KQL queries
- 😵 Built-in CORS handling
- 🍢 Express-esque [API builder](https://kirby.tools/docs/headless/advanced/api-builder) with middleware support
- 🗂 Return [JSON from templates](https://kirby.tools/docs/headless/usage/json-templates) instead of HTML

## Next Steps

- **New to Nuxt Kirby?** Start with the [Getting Started](/essentials/getting-started) guide.
- **Choose your approach:** Learn about [Data Fetching Methods](/essentials/data-fetching-methods).
- **Quick start:** Browse the [Starter Kits](/essentials/starter-kits) for ready-made templates.
