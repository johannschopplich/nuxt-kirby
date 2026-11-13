# `useKirbyData`

Returns raw data from a Kirby instance for the given path, as Nuxt's [`useFetch`](https://nuxt.com/docs/api/composables/use-fetch) does. `data`, `error`, `status`, `refresh` and `clear` work as for Nuxt's [`useAsyncData`](https://nuxt.com/docs/api/composables/use-async-data#return-values).

Nuxt keys each call site, and the language joins the key. A response fetched during SSR is read from the payload while the page hydrates; two call sites asking for the same path send two requests – see [Caching Strategies](/guides/caching-strategies#payload-caching).

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
function useKirbyData<
  ResT = any,
  ErrorT = unknown,
  DataT = ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined,
>(
  path: MaybeRefOrGetter<string>,
  opts?: UseKirbyDataOptions<ResT, DataT, PickKeys, DefaultT>
): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, NuxtError<ErrorT> | undefined>
```

<<< @/../src/runtime/composables/useKirbyData.ts#options

::: tip
`UseKirbyDataOptions` are Nuxt's [`useFetch` options](https://nuxt.com/docs/api/composables/use-fetch#parameters) without `baseURL`, `$fetch` and `params`, plus `language` – a string, a ref or a getter. `headers` reach Kirby in client mode only; the server proxy forwards none of them except `content-type`, `content-length` and `X-Language`. A write through the server proxy needs an [allowed route](/api/module-configuration#kirby-allowedroutes).
:::
