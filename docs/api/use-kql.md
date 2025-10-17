# `useKql`

Returns KQL query data. Uses an internal server route to proxy requests.

Query responses are cached by default between function calls for the same query based on a calculated hash.

## Return Values

- **`data`**: the result of the asynchronous function that is passed in.
- **`refresh`/`execute`**: a function that can be used to refresh the data returned by the handler function.
- **`error`**: an error object if the data fetching failed.
- **`status`**: a string indicating the status of the data request:
  - `idle`: when the request has not started, such as:
    - when `execute` has not yet been called and `{ immediate: false }` is set
    - when rendering HTML on the server and `{ server: false }` is set
  - `pending`: the request is in progress
  - `success`: the request has completed successfully
  - `error`: the request has failed
- **`clear`**: a function that can be used to set `data` to `undefined` (or the value of `options.default()` if provided), set `error` to `undefined`, set `status` to `idle`, and mark any currently pending requests as cancelled.

By default, Nuxt waits until a `refresh` is finished before it can be executed again.

## Caching

By default, a [unique key is generated](/guides/caching-strategies) based in input parameters for each request to ensure that data fetching can be properly de-duplicated across requests. To disable caching, set the `cache` option to `false`:

```ts
const { data } = await useKql({ query: 'site' }, {
  cache: false
})
```

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

::: warning
Authorization credentials will be publicly visible. Also, possible CORS issues ahead if the backend is not configured properly.
:::

To fetch data directly from your Kirby instance without the Nuxt proxy, set the module option `client` to `true`:

```ts{6}
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kirby'],

  kirby: {
    client: true
  }
})
```

Now, every `useKql` call will directly use the Kirby instance by sending requests from the client:

```ts{3}
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
