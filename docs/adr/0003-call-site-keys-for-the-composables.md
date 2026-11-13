# Nuxt's Call-Site Keys for the Composables

Until 4.x `useKql` and `useKirbyData` built their key from the content of the request, so two call sites with the same KQL query shared one request, and `$kql` and `$kirby` kept responses in a payload cache of their own. 5.0 builds both composables on Nuxt's `createUseFetch` and lets Nuxt key each call site, with the language added to that key; `$kql` and `$kirby` are plain fetches. The hand-built keys kept the composables' types apart from `useFetch`, the payload cache did for `$kql` and `$kirby` what `useAsyncData` does around them, and neither reference app issues one query from two call sites.

## Consequences

The same query from two call sites sends two requests. A `$kql` or `$kirby` call outside `useAsyncData` runs again while the page hydrates; dev mode warns about it. `useFetch` leaves headers out of its key, so adding the language to it needs the public `defineUseFetchAddon`, which sets the floor at Nuxt 4.6.
