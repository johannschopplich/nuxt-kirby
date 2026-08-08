# `useKirbyData`

Returns raw data from a Kirby instance for the given path.

Responses are cached by default between function calls for the same path based on a calculated hash of the path and fetch options.

<!--@include: ./parts/_async-data-return-values.md-->

## Caching

Two call sites asking for the same path share one entry and one round trip – see [Caching Strategies](/guides/caching-strategies#payload-caching).

Clear the cache for a specific path by calling the `clear` function. This will remove the cached data for the path and allow the next request to fetch the data from the server:

```ts
const { data, refresh, clear } = await useKirbyData('api/my-path')

async function invalidateAndRefresh() {
  clear()
  await refresh()
}
```

## Example

```vue
<script setup lang="ts">
import type { KirbyApiResponse } from 'kirby-types'

interface KirbySitemapItem {
  url: string
  modified: string
  links: {
    lang: string
    url: string
  }[]
}

const { data, refresh, error, status, clear } = await useKirbyData<KirbyApiResponse<KirbySitemapItem[]>>('api/__sitemap__')
</script>

<template>
  <div>
    <ul>
      <li v-for="item in data?.result" :key="item.url">
        <a :href="item.url">{{ item.url }}</a>
      </li>
    </ul>

    <button @click="refresh()">
      Refresh
    </button>
  </div>
</template>
```

## Allow Client Requests

<!--@include: ./parts/_client-requests.md-->

Now, every `useKirbyData` call reaches your Kirby instance directly, sent from the client:

```ts
const { data } = await useKirbyData('api/my-path')
```

## Type Declarations

```ts
export function useKirbyData<T = any>(
  path: MaybeRefOrGetter<string>,
  opts: UseKirbyDataOptions<T> = {},
): AsyncData<T | undefined, NuxtError>
```

<<< @/../src/runtime/composables/useKirbyData.ts#options

::: tip
`useKirbyData` infers all of Nuxt's [`useAsyncData` options](https://nuxt.com/docs/api/composables/use-async-data#params).
:::
