# Prefetching KQL Queries

Run custom queries **at build time** and serve static content with no request at runtime. A [Nuxt Prepare](https://nuxt-prepare.byjohann.dev) script sends the query once per dev, build or prepare command, and your app imports the result and its TypeScript type from `#nuxt-prepare`.

## Install Nuxt Prepare

```bash
npx nuxt module add prepare
```

## Fetch the Query in a Prepare Script

The script runs before Nuxt builds your app, so it sends the query itself, with the same environment variables Nuxt Kirby reads. Create `server.prepare.ts` in your project root and return each result under `state`:

```ts
// `server.prepare.ts`
import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-types'
import process from 'node:process'
import { defineNuxtPrepareHandler } from 'nuxt-prepare/config'

const siteQuery = {
  query: 'site',
  select: ['title']
} satisfies KirbyQueryRequest

export default defineNuxtPrepareHandler(async () => {
  const site = await fetchQuery(siteQuery)

  return {
    state: {
      site: site.result
    }
  }
})

async function fetchQuery(query: KirbyQueryRequest) {
  const response = await fetch(`${process.env.NUXT_KIRBY_URL}/api/kql`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NUXT_KIRBY_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(query)
  })

  if (!response.ok)
    throw new Error(`KQL query failed with status ${response.status}`)

  return await response.json() as KirbyQueryResponse
}
```

The script sends a bearer token to the KQL endpoint of [Kirby Headless](https://kirby.tools/docs/headless/getting-started/). For basic authentication, send the query to `api/query` with a `Basic` authorization header instead – see [Authentication](/essentials/authentication). A failed query throws, which stops the build – Nuxt Prepare's [Error Handling](https://nuxt-prepare.byjohann.dev/guide/error-handling) shows a fallback instead.

## Import the Result

Each state key is a named export of `#nuxt-prepare`, along with a type that takes the key in PascalCase: `site` becomes `Site`, `blogPosts` becomes `BlogPosts`.

```ts
// Import the type for the query result
import type { Site } from '#nuxt-prepare'

// Import the actual prefetched data
import { site } from '#nuxt-prepare'
```

## Multi-Language Queries

For a [multi-language](/guides/multi-language-sites) Kirby instance, add the language as an `X-Language` header in `fetchQuery`, such as `'X-Language': 'de'` for German.
