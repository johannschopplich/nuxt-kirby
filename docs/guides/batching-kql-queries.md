# Batching KQL Queries

Several queries can travel in one request, so a page that needs site, navigation and a listing costs one round trip rather than three. Nuxt Kirby supports batching multiple queries into a single request using the [`useKql`](/api/use-kql) composable.

To batch multiple queries, pass an object to the `select` property. Each key represents a separate query:

```ts
// Optional: DRY up your queries by defining them in a separate file
import { articlesQuery, navigationQuery, siteQuery } from '~/queries'

// Batch multiple KQL queries in a single request
const { data } = await useKql({
  query: 'site',
  select: {
    site: siteQuery,
    articles: articlesQuery,
    navigation: navigationQuery
  }
})

// Access the results of each query
const site = computed(() => data.value?.result.site)
const articles = computed(() => data.value?.result.articles)
const navigation = computed(() => data.value?.result.navigation)
```
