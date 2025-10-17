# Prefetching KQL Queries

Prefetch custom queries **at build-time** to improve performance for static content. Query results and their TypeScript types can be imported from `#nuxt-kirby`.

Add a `prefetch` object to your `kirby` configuration in `nuxt.config.ts`. Each key represents a query to prefetch.

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kirby'],

  kirby: {
    // Prefetch queries at build-time
    prefetch: {
      site: {
        query: 'site',
        select: ['title']
      }
    }
  }
})
```

When you run your dev or build command, the result of the `site` query is fetched, stored locally, and the time spent on the query(s) is logged.

```
ℹ Prefetched site KQL query in 170ms
```

Now you can import the query result and its TypeScript type in your application:

```ts
// Import the type for the query result
import type { Site } from '#nuxt-kirby'

// Import the actual prefetched data
import { site } from '#nuxt-kirby'
```

::: info
The inferred **type** for the key will be pascal-cased, e.g. `site` becomes `Site`. If you have a query key with multiple words, e.g. `blogPosts`, the type will be `BlogPosts`.
:::

## Multi-Language Queries

If you have a [multi-language](/guides/multi-language-sites) Kirby instance, you can specify the language for each query individually.

To only prefetch the `site` query in German, set the `language` property for the query:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kirby'],

  kirby: {
    prefetch: {
      site: {
        // Define the KQL query and fields to select
        query: {
          query: 'site',
          select: ['title']
        },
        // Specify the language for this query
        language: 'de'
      }
    }
  }
})
```

::: info
In multi-language prefetching, note that the query to be fetched is nested inside a `query` object, while `language` is a sibling property.
:::
