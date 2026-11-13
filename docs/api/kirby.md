# `$kirby`

Returns a promise of the raw data at the given path. Unlike `useKirbyData`, it resolves to the response body itself rather than to an `AsyncData` object.

Each call sends a request – through the server proxy, or straight to Kirby in client mode. A call outside `useAsyncData` that ran during SSR runs again while the page hydrates, so wrap it in `useAsyncData` or use [`useKirbyData`](/api/use-kirby-data).

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

const { data } = await useAsyncData('sitemap', () =>
  $kirby<KirbyApiResponse<KirbySitemapItem[]>>('api/__sitemap__'))
</script>

<template>
  <div>
    <ul>
      <li v-for="item in data?.result" :key="item.url">
        <a :href="item.url">{{ item.url }}</a>
      </li>
    </ul>
  </div>
</template>
```

## Type Declarations

```ts
function $kirby<T = any>(
  path: string,
  opts: KirbyFetchOptions = {},
): Promise<T>
```

<<< @/../src/runtime/types.ts#kirby-fetch-options
