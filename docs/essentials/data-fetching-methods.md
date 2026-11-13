# Data Fetching Methods

KQL for content queries that follow relationships and filter; the REST API for plain requests, file handling and endpoints of your own.

## KQL or the REST API?

| Method | Composables | Description |
|--------|-------------|-------------|
| KQL | `useKql`, `$kql` | Kirby Query Language, for content queries that follow relationships and filter. |
| REST API | `useKirbyData`, `$kirby` | Direct access to Kirby's REST API for custom endpoints. |

In most cases, KQL queries with `useKql` and `$kql` are preferred for their flexibility and type safety. Use `useKql` in your Vue components to fetch and reactively update content, for example a page's title and text:

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

Several queries can share one request – see [Batching KQL Queries](/guides/batching-kql-queries).

Use `useKirbyData` and `$kirby` to access Kirby's REST API directly when you need to fetch simple data, download files, or interact with custom endpoints. A common example is a Nuxt plugin that fetches site-wide settings once and stores them in a global state for easy access across your application:

```ts
import type { FetchError } from 'ofetch'

export default defineNuxtPlugin(async (nuxtApp) => {
  const site = useState('site', () => ({}))

  // Fetch site data once from Kirby's API
  if (import.meta.server) {
    try {
      const data = await $kirby('api/site')
      site.value = data?.data || {}
    }
    catch (e) {
      console.error('Failed to fetch site data:', (e as FetchError).message)
    }
  }
})
```

## Composable or `$` Function?

In your Vue components, you can choose between reactive data fetching with `useKirbyData` / `useKql` or programmatic one-time actions with `$kirby` / `$kql`.

| Feature | **`useKirbyData` / `useKql`** | **`$kirby` / `$kql`** |
|---------|---------------------------|-------------------|
| **Use case** | Components, reactive data | One-time actions |
| **Return type** | [`AsyncData`](https://nuxt.com/docs/api/composables/use-async-data#return-values) interface | Direct Promise |
| **Error handling** | Reactive error property | Try/catch with `FetchError` |
