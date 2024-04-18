# `KirbyQueryRequest`

Importable from `#nuxt-kql`.

```ts
import type { KirbyQueryRequest } from '#nuxt-kql'
```

## Type Declarations

::: info
Types are re-exported from the [`kirby-types`](https://github.com/johannschopplich/kirby-types) package.
:::

```ts
type KirbyQueryModel<CustomModel extends string = never> =
  | 'collection'
  | 'kirby'
  | 'site'
  | 'page'
  | 'user'
  | 'file'
  | 'content'
  | 'item'
  | 'arrayItem'
  | 'structureItem'
  | 'block'
  | CustomModel

// For simple dot-based queries like `site.title`, `page.images`, etc.
type DotNotationQuery<M extends string = never> =
  `${KirbyQueryModel<M>}.${string}`

// For function-based queries like `page("id")`, `user("name")`, etc.
type FunctionNotationQuery<M extends string = never> =
  `${KirbyQueryModel<M>}(${string})${string}`

// Combines the two types above to allow for either dot or function notation
type KirbyQueryChain<M extends string = never> =
  | DotNotationQuery<M>
  | FunctionNotationQuery<M>

type KirbyQuery<CustomModel extends string = never> =
  | KirbyQueryModel<CustomModel>
  // Ensures that it must match the pattern exactly, but not more broadly
  | (string extends KirbyQueryChain<CustomModel>
    ? never
    : KirbyQueryChain<CustomModel>)

interface KirbyQuerySchema {
  query: KirbyQuery;
  select?:
    | string[]
    | Record<string, string | number | boolean | KirbyQuerySchema>;
}

interface KirbyQueryRequest extends KirbyQuerySchema {
  pagination?: {
    /** @default 100 */
    limit?: number
    page?: number
  }
}
```
