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
| **Error handling** | Reactive error property | Try/catch, usually a `FetchError` |
| **During hydration** | Reuses the response from SSR | Sends the request again, unless wrapped in `useAsyncData` |

## Write to Kirby

The server proxy forwards `GET` and `HEAD` on every path and `POST` on the KQL path, and refuses any other request with 403. To send a write, such as creating a page, add its route to [`allowedRoutes`](/api/module-configuration#kirby-allowedroutes). The list replaces the default, so name the default routes again – here with `auth: 'bearer'`, whose KQL path is `api/kql`:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  kirby: {
    allowedRoutes: [
      {
        path: '**',
        methods: ['GET', 'HEAD']
      },
      {
        path: 'api/kql',
        methods: ['POST']
      },
      {
        path: 'api/pages/*/children',
        methods: ['POST']
      }
    ]
  }
})
```

Then send it with `$kirby`:

```ts
await $kirby('api/pages/notes/children', {
  method: 'POST',
  body: {
    slug: 'new-note',
    template: 'note',
    content: { title: 'New Note' }
  }
})
```

The server proxy adds the Kirby credentials to the write, so every visitor of your app can send it, with the permissions of those credentials.

