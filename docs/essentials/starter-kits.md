# Starter Kits

Instead of starting from scratch, use one of the following starter kits to get up and running with Nuxt and Kirby.

## 🍫 Cacao Kit

The [🍫 Cacao Kit](https://github.com/johannschopplich/cacao-kit-frontend) is a minimal Nuxt starter kit. It fetches content from the [🍫 Cacao Kit backend](https://github.com/johannschopplich/cacao-kit-backend), a headless Kirby instance. It is the evolved version of the Kirby Nuxt Starterkit (see below) and my best practice solution for building a Nuxt-based frontend on top of Kirby CMS.

Render it on the server, or pre-render the content with [Nuxt's static generation](https://nuxt.com/docs/getting-started/deployment#static-hosting).

Kirby's page structure is the source of truth for routing – you do not need to replicate the page structure in Nuxt. This makes it easy to add new pages in Kirby without touching the frontend. All pages are rendered by the [catch-all route](https://github.com/johannschopplich/cacao-kit-frontend/blob/main/app/pages/%5B...slug%5D.vue).

A key design decision is: **Everything is a block**. All Kirby templates are designed to be block-based. This allows you to create complex pages in Kirby with a simple drag-and-drop interface. The frontend then renders these blocks in a flexible way.

If this does not appeal to you, or if you need custom Kirby page templates with custom fields, you can always create Nuxt pages and query the content using KQL. See the [`pages/about.vue`](https://github.com/johannschopplich/cacao-kit-frontend/blob/main/app/pages/about.vue) page for an example.

## Kirby Nuxt Starter Kit

The [Kirby Nuxt Starter Kit](https://github.com/johannschopplich/kirby-nuxt-starterkit) is a rewrite of the official Kirby Starter Kit with Nuxt and Nuxt Kirby. It is configured to use **token-based authentication**, but can be used with **basic authentication** as well.

::: warning
This starter kit is for educational purposes, to show how the official Kirby starter kit you know translates to the headless world. For production use, please use the [Cacao Kit](https://github.com/johannschopplich/cacao-kit-frontend) instead.
:::

## Playground

The module's [playground](https://github.com/johannschopplich/nuxt-kirby/tree/main/playground) is not a starter but a Nuxt project that shows and tests every feature of the module – a good place to start if you want to look at the code.

::: tip
Run the playground locally:

1. Duplicate the `playground/.env.example` file as `playground/.env`.
2. Run `pnpm install` and `pnpm dev` to start the development server.
:::
