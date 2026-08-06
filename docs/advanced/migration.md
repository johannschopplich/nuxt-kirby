# Migration

## v4.0.0

### `language` Travels as a Header, Not a Path Prefix

`useKirbyData` and `$kirby` used to prepend the language code to the path, so `useKirbyData('api/notes', { language: 'de' })` requested `de/api/notes`. Both now send the code as the `X-Language` header instead, which is what Kirby reads on API routes, and the path is left as written. `useKql` and `$kql` already sent the header and are unaffected.

Nothing changes for a multi-language Kirby that resolves the language from the header. Drop the workaround if you were stripping the prefix on the Kirby side.

If you fetch a page by its own path rather than through the API – with the `headless.globalRoutes` option of [Kirby Headless](https://github.com/johannschopplich/kirby-headless) – the header reaches the page from 8.1 on. On earlier versions the language belongs in the path you request:

```ts
const { data } = await useKirbyData(`${locale.value}/about`)
```

See [Multi-Language Sites](/guides/multi-language-sites) for both cases.

### `prefix` Removed in Favor of `kqlPath`

The `prefix` module option is gone; rename the key and keep the value:

```ts
export default defineNuxtConfig({
  kirby: {
    prefix: 'api/query', // [!code --]
    kqlPath: 'api/query', // [!code ++]
  },
})
```

It was deprecated in v3.0.1 and warned at build time. A `prefix` left in place is now ignored, so `kqlPath` falls back to `api/query` or `api/kql` depending on the authentication method – which surfaces as 404s at request time rather than as a build error.

### The `#nuxt-kql` Import Alias Is Gone

The back-compat alias kept through v3 has been removed. Import from `#nuxt-kirby`:

```ts
import type { KirbyQueryRequest } from '#nuxt-kirby' // [!code ++]
import type { KirbyQueryRequest } from '#nuxt-kql' // [!code --]
```

## v3.0.0

### Renamed from Nuxt KQL to Nuxt Kirby

[Matt Lenz](https://github.com/mattlenz) kindly provided the `nuxt-kirby` npm package name and has transferred the ownership of the package to me. Therefore, the module name has changed from `nuxt-kql` to `nuxt-kirby`. This better reflects the purpose of the module, which is to integrate [Kirby CMS](https://getkirby.com/) with Nuxt – not only for KQL queries.

Other than the module name change, there are no breaking changes in the module itself. However, you have to update the Nuxt module configuration key from `kql` to `kirby`.

Please follow these steps to migrate your existing Nuxt KQL v2 project to Nuxt Kirby v3:

1. Uninstall the `nuxt-kql` module and install the `nuxt-kirby` module instead:
   ```bash
   npm uninstall nuxt-kql && npm install -D nuxt-kirby

   # pnpm
   pnpm remove nuxt-kql && pnpm add -D nuxt-kirby

   # yarn
   yarn remove nuxt-kql && yarn add -D nuxt-kirby
   ```

2. Update your `nuxt.config.ts` file to replace all instances of `kql` with `kirby`. For example, change this:
   ```ts
   // `nuxt.config.ts`
   export default defineNuxtConfig({
     modules: ['nuxt-kql'], // [!code --]
     modules: ['nuxt-kirby'], // [!code ++]

     kql: { // [!code --]
       auth: 'bearer' // [!code --]
     }, // [!code --]
     kirby: { // [!code ++]
       auth: 'bearer' // [!code ++]
     }, // [!code ++]
   })
   ```

To keep breaking changes to a minimum, v3 kept the import alias `#nuxt-kql` alongside the new one. [v4 removed it](#the-nuxt-kql-import-alias-is-gone), so change it to `#nuxt-kirby`:

```ts
import type { KirbyQueryRequest } from '#nuxt-kirby' // [!code ++]
import type { KirbyQueryRequest } from '#nuxt-kql' // [!code --]

const query = ref<KirbyQueryRequest>({
  query: 'page("notes/across-the-ocean")',
  select: {
    id: true,
    title: true,
    text: 'page.text.toBlocks',
  },
})
```
