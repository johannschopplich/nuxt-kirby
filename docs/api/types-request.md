# Request Types

::: info
Types are re-exported from the [`kirby-types`](https://github.com/johannschopplich/kirby-types) package and available globally in your Nuxt project via the `#nuxt-kirby` path alias.
:::

## `KirbyQueryRequest`

Represents a structured request to the Kirby API using the Kirby Query Language (KQL). It includes the main query, optional field selections, and pagination settings.

**Examples:**

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

**Type Declaration:**

```ts
export interface KirbyQuerySchema {
  query: KirbyQuery
  select?:
    | string[]
    | Record<string, string | number | boolean | KirbyQuerySchema>
}

export interface KirbyQueryRequest extends KirbyQuerySchema {
  pagination?: {
    /** @default 100 */
    limit?: number
    page?: number
  }
}
```
