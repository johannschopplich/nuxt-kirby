# API Reference

Four composables for fetching from Kirby, two server-side counterparts, and a set of types for the queries and responses that travel between. All composables are [auto-imported](https://nuxt.com/docs/guide/concepts/auto-imports) by Nuxt and available globally in your project.

| Page | What it covers |
|---|---|
| [Module Configuration](/api/module-configuration) | The options of the `kirby` key in your `nuxt.config.ts`. |
| [`useKql`](/api/use-kql) | Reactive KQL queries with caching, for content queries that follow relationships and filter. |
| [`$kql`](/api/kql) | Direct KQL calls for programmatic use. |
| [`useKirbyData`](/api/use-kirby-data) | Reactive data fetching from the REST API with caching, for plain requests, file handling and endpoints of your own. |
| [`$kirby`](/api/kirby) | Direct REST API calls for programmatic use. |
| [Server Imports](/api/server-imports) | `$kql` and `$kirby` in server code, where they reach Kirby without the proxy. |
| [Using Types](/api/types) | The types for Kirby data and queries, and where each one applies. |
| [Query Types](/api/types-query) | The shape of a query and the models it may address. |
| [Request Types](/api/types-request) | What you hand to `useKql` and `$kql`. |
| [Response Types](/api/types-response) | What comes back, including pagination. |
