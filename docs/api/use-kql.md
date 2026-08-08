# `useKql`

Returns KQL query data. Uses an internal server route to proxy requests.

Query responses are cached by default between function calls for the same query based on a calculated hash.

<!--@include: ./parts/_async-data-return-values.md-->

## Caching

Two call sites asking for the same query share one entry and one round trip – see [Caching Strategies](/guides/caching-strategies#payload-caching).

Clear the cache for a specific query by calling the `clear` function. This will remove the cached data for the query and allow the next request to fetch the data from the server:

```ts
const { data, refresh, clear } = await useKql({ query: 'site' })

async function invalidateAndRefresh() {
  clear()
  await refresh()
}
```

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

## Allow Client Requests

<!--@include: ./parts/_client-requests.md-->

Now, every `useKql` call reaches your Kirby instance directly, sent from the client:

```ts
const { data } = await useKql(query)
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
`useKql` infers all of Nuxt's [`useAsyncData` options](https://nuxt.com/docs/api/composables/use-async-data#params).
:::
