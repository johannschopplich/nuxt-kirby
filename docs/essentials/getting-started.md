# Getting Started

This guide will walk you through the steps to get started with Nuxt Kirby.

::: tip
Want to jump right in? Choose one of the [Starter Kits](/essentials/starter-kits) to get started with Nuxt Kirby in no time instead of starting from scratch.
:::

## Step 1: Install Nuxt Kirby

```bash
npx nuxt module add kirby
```

## Step 2: Add the Module

Add `nuxt-kirby` to your Nuxt config:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kirby']
})
```

## Step 3: Set up Your Kirby Backend

Nuxt Kirby needs a Kirby instance to connect to. You have two options:

### Option A: Kirby Headless Starter (Recommended)
Use the [Kirby Headless Starter](https://github.com/johannschopplich/kirby-headless-starter) which includes token authentication and optimizations for headless usage.

### Option B: Standard Kirby + KQL Plugin
Install the official [Kirby KQL plugin](https://github.com/getkirby/kql) on your existing Kirby instance.

## Step 4: Configure Authentication

For the **Kirby Headless Starter**, enable token authentication:

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
KIRBY_BASE_URL=https://your-kirby-site.com
KIRBY_API_TOKEN=your-secret-token
```

If you prefer a **standard Kirby + KQL** setup, you have to use basic authentication instead.

::: tip
See the [Authentication guide](/essentials/authentication) for more details on authentication methods and configuration options.
:::

## Step 5: Choose Your Data Fetching Method

Now you can start fetching data! Nuxt Kirby offers two approaches:

### For Complex Content Queries (KQL)
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

### For Simple Data Fetching (Direct API)
```vue
<script setup lang="ts">
const { data } = await useKirbyData('api/pages/blog')
</script>

<template>
  <div>
    <h1>{{ data?.result?.title }}</h1>
    <div v-html="data?.result?.text" />
  </div>
</template>
```

## Next Steps

- **Understand the differences:** Read about [Data Fetching Methods](/essentials/data-fetching-methods) to choose the best approach for your project..
- **Explore examples:** Browse the [API documentation](/api/) and [Starter Kits](/essentials/starter-kits).

Enjoy your journey with Nuxt Kirby. 🎬
