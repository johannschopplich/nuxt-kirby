# `useKql`

Sends a KQL query – through the server proxy, or straight to Kirby in client mode – and returns its response as Nuxt's [`useFetch`](https://nuxt.com/docs/api/composables/use-fetch) does. `data`, `error`, `status`, `refresh` and `clear` work as for Nuxt's [`useAsyncData`](https://nuxt.com/docs/api/composables/use-async-data#return-values).

A response fetched during SSR is read from the payload while the page hydrates, and two call sites asking for the same query send two requests – see [Caching Strategies](/guides/caching-strategies#payload-caching).

## Example

```vue
<script setup lang="ts">
const { data, refresh, error, status, clear } = await useKql({
  query: 'site',
  select: ['title', 'children']
})
</script>

<template>
  <div>
    <h1>{{ data?.result?.title }}</h1>
    <button @click="refresh()">
      Refresh
    </button>
  </div>
</template>
```

## Type Declarations

```ts
function useKql<
  ResT extends KirbyQueryResponse<any, boolean> = KirbyQueryResponse,
  ReqT extends KirbyQueryRequest = KirbyQueryRequest,
  ErrorT = unknown,
  DataT = ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined,
>(
  query: MaybeRefOrGetter<ReqT>,
  opts?: UseKqlOptions<ResT, DataT, PickKeys, DefaultT>
): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, NuxtError<ErrorT> | undefined>
```

<<< @/../src/runtime/composables/useKql.ts#options

::: tip
`UseKqlOptions` are Nuxt's [`useFetch` options](https://nuxt.com/docs/api/composables/use-fetch#parameters) without `baseURL`, `$fetch`, `method`, `query`, `params` and `body`, plus `language` – a string, a ref or a getter. `headers` reach Kirby in client mode only; the server proxy forwards none of them except `content-type`, `content-length` and `X-Language`.
:::
