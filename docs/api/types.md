# Using Types

The types for Kirby data and queries, and where each one applies.

::: info
These types belong to the [`kirby-types`](https://github.com/johannschopplich/kirby-types) package – import them from there. The `#nuxt-kirby` alias exports the module's own option types: `AllowedRoute`, `KqlOptions`, `KirbyFetchOptions`, `UseKqlOptions`, `UseKirbyDataOptions`, `NitroKqlFetchOptions` and `NitroKirbyFetchOptions`.

`kirby-types` is a peer dependency of Nuxt Kirby. Add it to your project – v2 for Kirby 6, published under the `next` tag, or v1 for Kirby 4 and 5:

```bash
# Kirby 6
pnpm add -D kirby-types@next

# Kirby 4 and 5
pnpm add -D kirby-types
```
:::

These pages show kirby-types 2; in v1, `KirbyQueryRoot` is named `KirbyQueryModel`.

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
  KirbyQueryRequest,
  KirbyQueryResponse,
  KirbyQueryRoot,
  KirbyQuerySchema,
} from 'kirby-types'
```

Each type is documented on the page for its area:

- [Query Types](/api/types-query) – the shape of a query and the models it may address.
- [Request Types](/api/types-request) – what you hand to `useKql` and `$kql`.
- [Response Types](/api/types-response) – what comes back, including pagination.

The block and layout types (`KirbyBlock`, `KirbyLayout`, …) are covered by the [`kirby-types` README](https://github.com/johannschopplich/kirby-types#readme).

To type the result of a query rather than the envelope around it, see [Typed Query Results](/guides/typed-query-results).
