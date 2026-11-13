# Request Types

<!--@include: ./parts/_kirby-types-note.md-->

## `KirbyQueryRequest`

A KQL request: the main query, optional field selections, and pagination settings.

**Examples**

```ts
// Basic query
const basicRequest: KirbyQueryRequest = {
  query: 'site',
  select: {
    title: true,
    description: true
  }
}

// With nested selections
const nestedRequest: KirbyQueryRequest = {
  query: 'page("blog").children',
  select: {
    title: true,
    date: 'page.date.toDate("Y-m-d")',
    author: {
      query: 'page.author.toUser',
      select: ['name', 'email']
    }
  }
}

// With pagination
const paginatedRequest: KirbyQueryRequest = {
  query: 'page("blog").children.published',
  select: {
    title: true,
    excerpt: 'page.text.excerpt(200)'
  },
  pagination: {
    limit: 10,
    page: 1
  }
}

// Array selection
const arrayRequest: KirbyQueryRequest = {
  query: 'page("about")',
  select: ['title', 'text', 'images']
}
```

**Type Declarations**

```ts
export interface KirbyQuerySchema {
  /** Defaults to `site`. */
  query?: KirbyQuery
  select?:
    | string
    | string[]
    | Record<string, string | boolean | KirbyQueryNestedRequest>
}

export interface KirbyQueryRequest extends KirbyQuerySchema {
  queries?:
    | Record<string, KirbyQuery | KirbyQueryRequest>
    | (KirbyQuery | KirbyQueryRequest)[]
  pagination?: {
    /** Defaults to the `pagination.limit` option, or `20`. */
    limit?: number
    page?: number
  }
}
```
