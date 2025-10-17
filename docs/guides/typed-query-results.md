# Typed Query Results

For better TypeScript support, define custom response types for [`useKql`](/api/use-kql) to catch errors in your templates.

The [`KirbyQueryResponse<T = any, Pagination extends boolean = false>`](/api/types) accepts a generic type parameter `T` for the query result.

```ts
// Extend the default response type with the result we expect from the query response
await useKql<KirbyQueryResponse<{ title: string }>>({
  query: 'site',
  select: ['title'],
})
```

## Example

By creating a custom `KirbySite` type for the expected response result and passed to the `KirbyQueryResponse` as its first type parameter, the `data` reactive variable will be provided with typings:

```vue
<script setup lang="ts">
import type { KirbyQueryResponse } from '#nuxt-kirby'

// Create an interface for the query result, respectively the data returned by the API
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
    <!-- The IDE will provide auto completion and error checking for nested keys -->
    <h1>{{ data?.result.title }}</h1>
  </div>
</template>
```
