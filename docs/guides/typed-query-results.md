# Typed Query Results

Pass [`KirbyQueryResponse`](/api/types-response#kirbyqueryresponse) with the shape of your query result as the type parameter of [`useKql`](/api/use-kql), and `data` carries that shape, which catches errors in your templates:

```vue
<script setup lang="ts">
import type { KirbyQueryResponse } from 'kirby-types'

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
    <h1>{{ data?.result?.title }}</h1>
  </div>
</template>
```
