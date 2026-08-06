# Using Types

The types Nuxt Kirby ships for Kirby data and queries, and where each one applies.

::: info
Types are re-exported from the [`kirby-types`](https://github.com/johannschopplich/kirby-types) package and available globally in your Nuxt project via the `#nuxt-kirby` path alias.
:::

```ts
import type {
  KirbyApiResponse,
  KirbyBlock,
  KirbyDefaultBlocks,
  KirbyDefaultBlockType,
  KirbyLayout,
  KirbyLayoutColumn,
  KirbyQuery,
  KirbyQueryChain,
  KirbyQueryModel,
  KirbyQueryRequest,
  KirbyQueryResponse,
  KirbyQuerySchema,
} from '#nuxt-kirby'
```

## Typed Query Results

For the best TypeScript experience, define the expected result type of your queries to get full type safety and IDE support.

The [`KirbyQueryResponse`](/api/types-response#kirbyqueryresponse) accepts the generic type parameter `T` used for the query result type.

```ts
// Extend the default response type with the result we expect from the query response
await useKql<KirbyQueryResponse<{ title: string }>>({
  query: 'site',
  select: ['title'],
})
```

**Example:**

First, create an `KirbySite` interface that matches the expected structure of the query result.

Then, pass it as a generic type parameter to `useKql`. The `data` object will now be strongly typed, and your IDE will provide autocompletion and type checking.

```vue
<script setup lang="ts">
import type { KirbyQueryResponse } from '#nuxt-kirby'

// Define the expected response structure
export interface KirbySite {
  title: string
  children: {
    id: string
    title: string
    isListed: boolean
  }[]
}

// `data` will be of type `KirbyQueryResponse<KirbySite>`
const { data } = await useKql<KirbyQueryResponse<KirbySite>>({
  query: 'site',
  select: {
    title: true,
    children: {
      query: 'site.children',
      select: {
        id: true,
        title: true,
        isListed: true
      }
    }
  }
})
</script>

<template>
  <div>
    <h1>{{ data?.result.title }}</h1>
  </div>
</template>
```
