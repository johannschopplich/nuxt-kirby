# Nuxt's Call-Site Keys for the Composables

`useKql` and `useKirbyData` are built on Nuxt's `createUseFetch`, whose key joins the call site to the request, and add the language to that key; `$kql` and `$kirby` are plain fetches. A key built from the request's content alone would let two call sites with the same KQL query share one request, but would keep the composables' types apart from `useFetch`, and neither reference app issues one query from two call sites. A payload cache in `$kql` and `$kirby` would do what `useAsyncData` does around them.

## Consequences

The same query from two call sites sends two requests. A `$kql` or `$kirby` call outside `useAsyncData` runs again while the page hydrates; dev mode warns about it. `useFetch` leaves headers out of its key, so adding the language to it needs `defineUseFetchAddon`, public since Nuxt 4.6.
