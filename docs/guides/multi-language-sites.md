# Multi-Language Sites

A multi-language Kirby pairs with [Nuxt i18n](https://i18n.nuxtjs.org): the locale i18n resolves is the language you pass to a query.

## Prerequisites

Install the official [Nuxt i18n](https://i18n.nuxtjs.org) module before proceeding:

```bash
npx nuxt module add i18n
```

## Basic Usage

To fetch language-specific content, pass the `language` option with your query request. You can get the current locale code from the `useI18n` composable:

```ts
const { locale } = useI18n()

// Get the German translation of the about page
const { data } = await useKql(
  { query: 'page("about")' },
  { language: locale.value }
)
```

The `language` option travels as the `X-Language` header, which Kirby reads on every API route. `useKirbyData` and `$kirby` accept it too:

```ts
const { data } = await useKirbyData('api/__sitemap__', {
  language: locale.value
})
```

## Fetching Content Outside the API

Kirby itself reads `X-Language` only for requests below `/api`. [Kirby Headless](https://github.com/johannschopplich/kirby-headless) 8.1 extends it to the `headless.globalRoutes` catch-all, so a page fetched by its own path honors `language` too – as long as the path carries no language prefix of its own:

```ts
const { data } = await useKirbyData('about', {
  language: locale.value
})
```

Everywhere else the language belongs in the path, and `language` has nothing to act on:

```ts
// Resolves to `/de/about` on the Kirby side
const { data } = await useKirbyData(`${locale.value}/about`)
```

## Handling Dynamic Routes

For dynamic routes like `pages/[...slug].vue`, you will need to handle both the language code and the page slug. With prefixed routes (e.g., `/en/about`, `/de/about`), the locale code is part of the URL.

To trim the leading locale code from the slug, create a utility function in `app/utils/locale.ts` to build the non-localized slug:

```ts
export function getNonLocalizedSlug(
  param: string | string[],
  locales: string[] = []
) {
  if (Array.isArray(param)) {
    param = param.filter(Boolean)

    // Remove locale prefix if present
    if (param.length > 0 && locales.includes(param[0]!)) {
      param = param.slice(1)
    }

    return param.join('/')
  }

  return param
}
```

Then, use this function in your page component to fetch the content based on the current route path and locale:

```vue
<script setup lang="ts">
const { locale, localeCodes } = useI18n()
const route = useRoute()

// Extract the non-localized slug
const pageUri = getNonLocalizedSlug(route.params.slug, localeCodes.value)

// Fetch page data for current language
const { data: pageData, error: pageError } = await useKql(
  {
    query: `page("${pageUri || 'home'}")`,
    select: { title: true }
  },
  { language: locale.value }
)
</script>
```

## Error Handling & Redirects

When working with translated content, you may want to handle pages that do not exist in the requested language or do not exist at all. You can check if the query returned a valid result and handle it accordingly.

```ts
// Handle missing content
if (!pageData.value?.result) {
  // Load error page in current language
  const { data } = await useKql(
    { query: 'page("error")' },
    { language: locale.value }
  )

  const event = useRequestEvent()
  if (event)
    setResponseStatus(event, 404)

  // Now, use `data` to render the error page
}
```
