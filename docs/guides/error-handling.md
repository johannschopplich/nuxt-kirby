# Error Handling

The [server proxy](/essentials/how-it-works) passes Kirby's error through untouched, so status code, message and body all reach your app while the credentials stay behind.

## Returned and Thrown Errors

### `useKql` and `useKirbyData` Return the Error

Both composables surface errors through the `error` property, as Nuxt's own [`useAsyncData`](https://nuxt.com/docs/api/composables/use-async-data) does; the error is a [`NuxtError`](https://nuxt.com/docs/api/utils/create-error). A page Kirby cannot find is not an error: it comes back as `result: null`.

```vue
<script setup lang="ts">
const { data, error } = await useKql({
  query: 'page("about")',
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
      <p>{{ (error.data as { message?: string } | undefined)?.message || 'Something went wrong' }}</p>
    </div>

    <div v-else-if="data?.result">
      <!-- Query result -->
    </div>
  </div>
</template>
```

### `$kql` and `$kirby` Reject

The `$*` functions (`$kql`, `$kirby`) reject instead, since they are designed for programmatic use (like form submissions or one-time actions). The error is usually a `FetchError`; in client mode, `$kirby` rejects a path that leaves the Kirby URL with a 400 `H3Error`:

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
