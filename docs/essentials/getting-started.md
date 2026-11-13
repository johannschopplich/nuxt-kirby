# Getting Started

Nuxt Kirby is a [Nuxt](https://nuxt.com) module for reading and writing the content of a Kirby instance. Requests travel through the server proxy of your Nuxt app, so the Kirby credentials never reach the browser, and the same composables work server-side and client-side. To skip the setup, start from one of the [Starter Kits](/essentials/starter-kits).

## Install Nuxt Kirby

The command installs the package and adds `nuxt-kirby` to the modules in your `nuxt.config.ts`:

```bash
npx nuxt module add kirby
```

The types of your queries come from `kirby-types`, a peer dependency – v1 for Kirby 4 and 5, v2 for Kirby 6 – see [Using Types](/api/types).

## Connect Kirby

Nuxt Kirby needs a Kirby instance to connect to. It is built against the [Kirby Headless plugin](https://kirby.tools/docs/headless/getting-started/), which adds a KQL endpoint with token authentication – the recommended setup for a headless Kirby. Install it in your Kirby project, or start from the [Kirby Headless Starter](https://github.com/johannschopplich/kirby-headless-starter), which comes with it. Then enable token authentication in Nuxt:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kirby'],

  kirby: {
    auth: 'bearer' // Enable token-based authentication
  }
})
```

Set your environment variables in `.env`:

```ini
# Your Kirby instance URL
NUXT_KIRBY_URL=https://your-kirby-site.com
NUXT_KIRBY_TOKEN=your-secret-token
```

Without the plugin, install the official [Kirby KQL plugin](https://github.com/getkirby/kql) and use basic authentication instead – see [Authentication](/essentials/authentication).

## Send Your First Query

`useKql` sends a KQL query; [Data Fetching Methods](/essentials/data-fetching-methods) covers the REST API as the alternative.

```vue
<script setup lang="ts">
const { data } = await useKql({
  query: 'site',
  select: {
    title: true,
    children: {
      query: 'site.children',
      select: ['title', 'url']
    }
  }
})
</script>

<template>
  <div>
    <h1>{{ data?.result?.title }}</h1>
    <nav>
      <a
        v-for="page in data?.result?.children"
        :key="page.url"
        :href="page.url"
      >
        {{ page.title }}
      </a>
    </nav>
  </div>
</template>
```

From here, fetch content per locale with [Multi-Language Sites](/guides/multi-language-sites), type a query's result with [Typed Query Results](/guides/typed-query-results), or look up every composable and type in the [API Reference](/api/).
