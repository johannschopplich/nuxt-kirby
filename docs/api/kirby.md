# `$kirby`

Returns raw data from a Kirby instance for the given path.

Responses are cached by default between function calls for the same path based on a calculated hash of the path and fetch options.

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

const data = await $kirby<KirbyApiResponse<KirbySitemapItem[]>>('api/__sitemap__')

if (!data?.result) {
  throw new Error('Could not fetch sitemap data')
}
</script>

<template>
  <div>
    <ul>
      <li v-for="item in data.result" :key="item.url">
        <a :href="item.url">{{ item.url }}</a>
      </li>
    </ul>
  </div>
</template>
```

## Allow Client Requests

<!--@include: ./parts/_client-requests.md-->

Now, every `$kirby` call reaches your Kirby instance directly, sent from the client:

```ts
const data = await $kirby('api/my-path')
```

## Type Declarations

```ts
function $kirby<T = any>(
  path: string,
  opts: KirbyFetchOptions = {},
): Promise<T>
```

<<< @/../src/runtime/composables/$kirby.ts#options
