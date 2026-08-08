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

<!--@include: ./parts/_client-requests.md-->

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
