# Overview

Four composables for fetching from Kirby, two server-side counterparts, and a set of types for the queries and responses that travel between.

## Composables

::: info
All composables are [auto-imported](https://nuxt.com/docs/guide/concepts/auto-imports) by Nuxt and available globally in your project.
:::

### KQL

For content queries that follow relationships and filter:

- **[`useKql`](/api/use-kql)** – Reactive KQL queries with caching
- **[`$kql`](/api/kql)** – Direct KQL calls for programmatic use

### Kirby REST API

For plain requests, file handling and endpoints of your own:

- **[`useKirbyData`](/api/use-kirby-data)** – Reactive data fetching with caching
- **[`$kirby`](/api/kirby)** – Direct API calls for programmatic use

### Nitro

`$kql` and `$kirby` are auto-imported in server code as well, where they reach Kirby without the proxy. See **[Server Imports](/api/server-imports)**.

## Common Usage Patterns

```ts
// KQL query
const { data } = await useKql({
  query: 'page("about")',
  select: { title: true, text: 'page.text.kirbytext' }
})

// Direct API access
const { data: page } = await useKirbyData('api/pages/about')
```

## Type Safety

Three type families cover a query's round trip:

- [Query Types](/api/types-query) – To build type-safe KQL queries
- [Request Types](/api/types-request) – For typing request payloads
- [Response Types](/api/types-response) – For typing response data

Annotating the composable call carries the shape through to `data`:

```ts
import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-types'

interface BlogPost {
  title: string
  date: string
  author: { name: string }
}

const { data } = await useKql<KirbyQueryResponse<BlogPost[]>>({
  query: 'page("blog").children',
  select: {
    title: true,
    date: 'page.date.toDate("Y-m-d")',
    author: {
      query: 'page.author.toUser',
      select: ['name']
    }
  }
})
```
