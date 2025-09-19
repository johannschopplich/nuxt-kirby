[![Nuxt Kirby module](./docs/public/og.jpg)](https://nuxt-kirby.byjohann.dev)

# Nuxt Kirby

[Nuxt](https://nuxt.com) module for [Kirby's Query Language](https://github.com/getkirby/kql) API.

- [✨ &nbsp;Release Notes](https://github.com/johannschopplich/nuxt-kirby/releases)
- [📖 &nbsp;Read the documentation](https://nuxt-kirby.byjohann.dev)

## Features

- 🔒 Protected Kirby credentials when sending queries
- 🪢 Supports token-based authentication with the [Kirby Headless plugin](https://kirby.tools/docs/headless/getting-started/) (recommended)
- 🤹 No CORS issues!
- 🍱 Handle request just like with the [`useFetch`](https://nuxt.com/docs/getting-started/data-fetching/#usefetch) composable
- 🗃 Cached query responses
- 🦦 [Multiple starter kits](https://nuxt-kirby.byjohann.dev/essentials/starter-kits) available
- 🦾 Strongly typed

## Setup

> [!TIP]
> [📖 Read the documentation](https://nuxt-kirby.byjohann.dev)

```bash
npx nuxi@latest module add kirby
```

## Basic Usage

> [!TIP]
> [📖 Read the documentation](https://nuxt-kirby.byjohann.dev)

Add the Nuxt Kirby module to your Nuxt config:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kirby']
})
```

And send queries in your template:

```vue
<script setup lang="ts">
const { data, error, status } = await useKql({
  query: 'site'
})
</script>

<template>
  <div>
    <h1>{{ data?.result?.title }}</h1>
    <pre>{{ JSON.stringify(data?.result, undefined, 2) }}</pre>
  </div>
</template>
```

## 💻 Development

1. Clone this repository
2. Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
3. Install dependencies using `pnpm install`
4. Run `pnpm run dev:prepare`
5. Start development server using `pnpm run dev`

## License

[MIT](./LICENSE) License © 2022-PRESENT [Johann Schopplich](https://github.com/johannschopplich)
