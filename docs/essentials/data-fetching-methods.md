# Data Fetching Methods

Nuxt Kirby offers two approaches to fetch data from your Kirby CMS. Choose the right method for your use case.

::: tip
In most cases, KQL queries with `useKql` and `$kql` are preferred for their flexibility and type safety. However, `useKirbyData` and `$kirby` are excellent for simple data fetching and direct API access.
:::

## Methods Comparison

Access your Kirby CMS data using either KQL or direct API access:

| Method | Composables | Description |
|--------|-------------|-------------|
| KQL | `useKql`, `$kql` | Kirby Query Language for content queries for simple and complex data structures and relationships. |
| Direct Kirby API Access | `useKirbyData`, `$kirby` | Direct access to Kirby's REST API for custom endpoints. |

## Composables Comparison

In your Vue components, you can choose between reactive data fetching with `useKirbyData` / `useKql` or programmatic one-time actions with `$kirby` / `$kql`.

| Feature | **`useKirbyData` / `useKql`** | **`$kirby` / `$kql`** |
|---------|---------------------------|-------------------|
| **Use case** | Components, reactive data | One-time actions |
| **Return type** | [`AsyncData`](https://nuxt.com/docs/api/composables/use-async-data#return-values) interface | Direct Promise |
| **Error handling** | Reactive error property | Try/catch with `FetchError` |
| **Best for** | Simple data, files, custom endpoints | Complex queries, relationships |

## Method 1: KQL (Kirby Query Language)

Use `useKql` and `$kql` as your daily driver for fetching content from Kirby. KQL is designed to handle complex queries and relationships efficiently.

Commonly, use `useKql` in your Vue components to fetch and reactively update data. For example, fetching a page's title and text:

```vue
<script setup lang="ts">
const { data } = await useKql({
  query: 'page("home")',
  select: {
    title: true,
    text: 'page.text.kirbytext',
  }
})
</script>

<template>
  <div>
    <h1>{{ data?.result?.title }}</h1>
    <div v-html="data?.result?.text" />
  </div>
</template>
```

## Method 2: Direct Kirby API Access

Use `useKirbyData` and `$kirby` to access Kirby's REST API directly. This method is ideal when you need to fetch simple data, download files, or interact with custom endpoints.

A common example is a Nuxt plugin that fetches site-wide settings once and stores them in a global state for easy access across your application:

```ts
import type { FetchError } from 'ofetch'

export default defineNuxtPlugin(async (nuxtApp) => {
  const site = useState('site', () => ({}))

  // Fetch site data once from a custom API endpoint
  if (import.meta.server) {
    try {
      const data = await $kirby('api/site')
      site.value = data?.result || {}
    }
    catch (e) {
      console.error('Failed to fetch site data:', (e as FetchError).message)
    }
  }
})
```

## Batching KQL Queries

Fetching multiple KQL queries in a single request can significantly improve performance by reducing the number of HTTP requests made to the server. Nuxt Kirby supports batching multiple queries into a single request using the [`useKql`](/api/use-kql) composable.

To batch multiple queries, pass an object to the `select` property. Each key represents a separate query:

```ts
// Optional: DRY up your queries by defining them in a separate file
import { articlesQuery, navigationQuery, siteQuery } from '~/queries'

// Batch multiple KQL queries in a single request
const { data } = await useKql({
  query: 'site',
  select: {
    site: siteQuery,
    articles: articlesQuery,
    navigation: navigationQuery
  }
})

// Access the results of each query
const site = computed(() => data.value?.result.site)
const articles = computed(() => data.value?.result.articles)
const navigation = computed(() => data.value?.result.navigation)
```
