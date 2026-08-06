# Response Types

::: info
Types are re-exported from the [`kirby-types`](https://github.com/johannschopplich/kirby-types) package and available globally in your Nuxt project via the `#nuxt-kirby` path alias.
:::

## `KirbyApiResponse`

Represents the standard structure of a response from the Kirby API. It includes the HTTP status code, a status message, and an optional result payload.

**Examples:**

```ts
// Success response
const success: KirbyApiResponse<{ title: string }> = {
  code: 200,
  status: 'ok',
  result: {
    title: 'Homepage'
  }
}

// Error response
const error: KirbyApiResponse = {
  code: 404,
  status: 'error'
  // result is undefined for errors
}
```

**Type Declaration:**

```ts
export interface KirbyApiResponse<T = any> {
  code: number
  status: string
  result?: T
}
```

## `KirbyQueryResponse`

Represents the response structure for queries made using Kirby Query Language (KQL). It extends `KirbyApiResponse` and can optionally include pagination information.

**Examples:**

```ts
import type { KirbyQueryResponse } from '#nuxt-kirby'

// Define the expected response structure
export interface KirbySite {
  title: string
  children: {
    id: string
    title: string
    isListed: boolean
  }[]
}

// `data` will be of type `KirbyQueryResponse<KirbySite>`
const { data } = await useKql<KirbyQueryResponse<KirbySite>>({
  query: 'site',
  select: {
    title: true,
    children: {
      query: 'site.children',
      select: {
        id: true,
        title: true,
        isListed: true
      }
    }
  }
})
```

**Type Declaration:**

```ts
export type KirbyQueryResponse<
  T = any,
  Pagination extends boolean = false,
> = KirbyApiResponse<
  Pagination extends true
    ? {
        data: T
        pagination: {
          page: number
          pages: number
          offset: number
          limit: number
          total: number
        }
      }
    : T
>
```
