# `useKql`

Returns KQL query data. Uses an internal server route to proxy requests. `data`, `error`, `status`, `refresh` and `clear` work as for Nuxt's [`useAsyncData`](https://nuxt.com/docs/api/composables/use-async-data#return-values).

Query responses are cached by default between function calls for the same query based on a calculated hash. Two call sites asking for the same query share one entry and one round trip – see [Caching Strategies](/guides/caching-strategies#payload-caching).

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
  ReqT extends KirbyQueryRequest = KirbyQueryRequest
>(
  query: MaybeRefOrGetter<ReqT>,
  opts?: UseKqlOptions<ResT>
): AsyncData<ResT | undefined, NuxtError>
```

<<< @/../src/runtime/composables/useKql.ts#options

::: tip
`useKql` infers all of Nuxt's [`useAsyncData` options](https://nuxt.com/docs/api/composables/use-async-data#parameters).
:::
