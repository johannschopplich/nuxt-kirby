# Response Types

<!--@include: ./parts/_kirby-types-note.md-->

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

**Type Declarations**

```ts
export interface KirbyApiResponse<T = any> {
  code: number
  status: string
  result?: T
}
```

## `KirbyQueryResponse`

Represents the response structure for queries made using Kirby Query Language (KQL). It extends `KirbyApiResponse` and can optionally include pagination information.

See [Typed Query Results](/guides/typed-query-results) for a worked example.

**Type Declarations**

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
