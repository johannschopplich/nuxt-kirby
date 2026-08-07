# Using Types

The types Nuxt Kirby ships for Kirby data and queries, and where each one applies.

::: info
These types belong to the [`kirby-types`](https://github.com/johannschopplich/kirby-types) package – import them from there. The `#nuxt-kirby` alias re-exports the same names next to your [prefetched queries](/guides/prefetching-kql-queries), so both paths resolve to the same types.

Nuxt Kirby depends on `kirby-types`, but a package manager that does not hoist – pnpm out of the box – keeps a dependency of a dependency out of your project's `node_modules`. Add it yourself so the import resolves:

```bash
pnpm add -D kirby-types
```
:::

```ts
import type {
  KirbyApiResponse,
  KirbyBlock,
  KirbyDefaultBlocks,
  KirbyDefaultBlockType,
  KirbyLayout,
  KirbyLayoutColumn,
  KirbyQuery,
  KirbyQueryChain,
  KirbyQueryModel,
  KirbyQueryRequest,
  KirbyQueryResponse,
  KirbyQuerySchema,
} from 'kirby-types'
```

Each type is documented on the page for its area:

- [Query Types](/api/types-query) – the shape of a query and the models it may address.
- [Request Types](/api/types-request) – what you hand to `useKql` and `$kql`.
- [Response Types](/api/types-response) – what comes back, including pagination.

To type the result of a query rather than the envelope around it, see [Typed Query Results](/guides/typed-query-results).
