# Error Handling

Nuxt Kirby provides comprehensive error handling that preserves Kirby API error details while keeping credentials secure through the [server proxy](/advanced/how-does-it-work).

## Error Types

### Composables – `useKql` and `useKirbyData`

The `use*` composables (`useKql`, `useKirbyData`) integrate with Nuxt's error handling and will expose errors through the `error` property, following Nuxt's [`useAsyncData`](https://nuxt.com/docs/api/composables/use-async-data) pattern:

```vue
<script setup lang="ts">
const { data, error } = await useKql({
  query: 'page("nonexistent")',
  select: { title: true }
})

if (error.value) {
  console.error('Query failed:', error.value.statusMessage)
  console.error('Status code:', error.value.statusCode)
  console.error('Response data:', error.value.data)
}
</script>

<template>
  <div>
    <div v-if="error">
      <h3>Error: {{ error.statusMessage }}</h3>
      <p>{{ error.data?.message || 'Something went wrong' }}</p>
    </div>

    <div v-else-if="data?.result">
      <!-- Query result -->
    </div>
  </div>
</template>
```

### Functions – `$kql` and `$kirby`

The `$*` functions (`$kql`, `$kirby`) throw `FetchError` objects directly since they are designed for programmatic use (like form submissions or one-time actions):

```vue
<script setup lang="ts">
import type { FetchError } from 'ofetch'

async function fetchSite() {
  try {
    const result = await $kql({
      query: 'site',
      select: { children: true }
    })

    console.log('Site data:', result)
  }
  catch (error) {
    const _error = error as FetchError

    console.error('Request failed:', _error.statusMessage)
    console.error('Status code:', _error.statusCode)
    console.error('Response data:', _error.data)
  }
}
</script>
```

## Error Information

Both error types preserve essential information from the Kirby API response:

- **Response Body** – Full error details from Kirby
- **HTTP Status Code** – Standard HTTP status codes (401, 404, 500, etc.)
- **HTTP Status Message** – Human-readable status text
- **Headers** – Response headers from Kirby

## Type Definitions

### `FetchError` Interface

The `FetchError` type from [ofetch](https://github.com/unjs/ofetch) is used for errors thrown by `$kql` and `$kirby`:

```ts
interface FetchError<T = any> extends Error {
  request?: FetchRequest
  options?: FetchOptions
  response?: FetchResponse<T>
  data?: T
  status?: number
  statusText?: string
  statusCode?: number
  statusMessage?: string
}
```

### `NuxtError` Interface

The `NuxtError` type is used for errors returned by `useKql` and `useKirbyData`:

```ts
interface NuxtError<DataT = unknown> extends H3Error<DataT> {
  error?: true
}

declare class H3Error<DataT = unknown> extends Error {
  static __h3_error__: boolean
  statusCode: number
  fatal: boolean
  unhandled: boolean
  statusMessage?: string
  data?: DataT
  cause?: unknown
  constructor(message: string, opts?: {
    cause?: unknown
  })
  toJSON(): Pick<H3Error<DataT>, 'message' | 'statusCode' | 'statusMessage' | 'data'>
}
```
