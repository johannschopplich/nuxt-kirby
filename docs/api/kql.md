# `$kql`

Sends a KQL query and returns the response. Each call sends a request – through the server proxy, or straight to Kirby in client mode. A call outside `useAsyncData` that ran during SSR runs again while the page hydrates, so wrap it in `useAsyncData` or use [`useKql`](/api/use-kql).

## Example

```vue
<script setup lang="ts">
const { data } = await useAsyncData('site', () => $kql(
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
))
</script>

<template>
  <div>
    <h1>{{ data?.result?.title }}</h1>
  </div>
</template>
```

## Type Declarations

```ts
function $kql<T extends KirbyQueryResponse<any, boolean> = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  opts: KqlOptions = {}
): Promise<T>
```

<<< @/../src/runtime/types.ts#kql-options
