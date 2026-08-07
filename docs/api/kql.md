# `$kql`

Returns raw KQL query data. Uses an internal server route to proxy requests.

Query responses are cached by default between function calls for the same query based on a calculated hash.

## Example

```vue
<script setup lang="ts">
const data = await $kql(
  {
    query: 'site',
    select: ['title', 'children']
  },
  {
    async onRequest({ request }) {
      console.log(request)
    },
    async onResponse({ response }) {
      console.log(response)
    },
    async onRequestError({ error }) {
      console.log(error)
    },
    async onResponseError({ error }) {
      console.log(error)
    }
  }
)
</script>

<template>
  <div>
    <h1>{{ data?.result?.title }}</h1>
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

Now, every `$kql` call reaches your Kirby instance directly, sent from the client:

```ts
const data = await $kql(query)
```

## Type Declarations

```ts
function $kql<T extends KirbyQueryResponse<any, boolean> = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  opts: KqlOptions = {}
): Promise<T>
```

<<< @/../src/runtime/composables/$kql.ts#options
