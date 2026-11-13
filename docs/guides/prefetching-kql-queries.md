# Prefetching KQL Queries

Prefetch custom queries **at build time** and serve static content with no request at runtime. Query results and their TypeScript types can be imported from `#nuxt-kirby`.

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

The query runs once per dev or build command, and its result is written to disk:

```
ℹ Prefetched KQL query "site" in 170ms
```

Import the result and its type:

```ts
// Import the type for the query result
import type { Site } from '#nuxt-kirby'

// Import the actual prefetched data
import { site } from '#nuxt-kirby'
```

The type takes the key in PascalCase: `site` becomes `Site`, `blogPosts` becomes `BlogPosts`.

## Multi-Language Queries

For a [multi-language](/guides/multi-language-sites) Kirby instance, set the language per query: nest the query in a `query` object and add `language` next to it. To prefetch the `site` query in German:

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
