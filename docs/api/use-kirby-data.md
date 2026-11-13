# `useKirbyData`

Returns raw data from a Kirby instance for the given path. `data`, `error`, `status`, `refresh` and `clear` work as for Nuxt's [`useAsyncData`](https://nuxt.com/docs/api/composables/use-async-data#return-values).

Responses are cached by default between function calls for the same path based on a calculated hash of the path and fetch options. Two call sites asking for the same path share one entry and one round trip – see [Caching Strategies](/guides/caching-strategies#payload-caching).

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

## Type Declarations

```ts
export function useKirbyData<T = any>(
  path: MaybeRefOrGetter<string>,
  opts: UseKirbyDataOptions<T> = {},
): AsyncData<T | undefined, NuxtError>
```

<<< @/../src/runtime/composables/useKirbyData.ts#options

::: tip
`useKirbyData` infers all of Nuxt's [`useAsyncData` options](https://nuxt.com/docs/api/composables/use-async-data#parameters).
:::
