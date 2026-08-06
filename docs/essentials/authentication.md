# Authentication

Nuxt Kirby supports multiple authentication methods. Choose the one that fits your Kirby setup.

::: tip
For new projects, reach for **token-based authentication** with the [Kirby Headless plugin](https://kirby.tools/docs/headless/getting-started/). It brings a KQL endpoint at `api/kql` that accepts a bearer token, on any Kirby installation.
:::

## Overview

| Method | Use Case | Security | Setup Complexity |
|--------|----------|----------|------------------|
| **Bearer Token** | Production, Kirby Headless | High ✅ | Easy |
| **Basic Auth** | Development, existing Kirby | Medium ⚠️ | Medium |
| **None** | Public APIs, read-only | Low ❌ | Minimal |

## Token-Based Authentication

A bearer token needs the [Kirby Headless plugin](https://kirby.tools/docs/headless/getting-started/), whose KQL endpoint accepts one. Kirby's own API requires basic authentication instead.

Enable token-based authentication in your Nuxt project's `nuxt.config.ts` file:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-kirby'],

  kirby: {
    // Enable token-based authentication for the Kirby Headless plugin,
    // which includes a custom KQL endpoint `api/kql`
    auth: 'bearer'
  }
})
```

Set the following environment variables in your project's `.env` file:

```ini
KIRBY_BASE_URL=https://kirby.example.com
KIRBY_API_TOKEN=your-token
```

::: info
Ensure that you set the same token as the `KIRBY_HEADLESS_API_TOKEN` environment variable in the `.env` file of your headless Kirby project.
:::

## Basic Authentication

If you do not want to use the [Kirby Headless plugin](https://kirby.tools/docs/headless/getting-started/), you can use basic authentication with the default KQL endpoint. While this works, it's less secure because credentials are transmitted with every request (even though they're base64-encoded, not encrypted). Token-based authentication is preferred for production.

::: tip
The default KQL endpoint `/api/query` [requires authentication](https://getkirby.com/docs/guide/api/authentication). You have to enable HTTP basic authentication in your Kirby project's `config.php` file:

```php
// `site/config/config.php`
return [
    'api' => [
        'basicAuth' => true,
        'allowInsecure' => true // For local development, you may want to disable SSL verification
    ]
];
```

:::

Nuxt Kirby will automatically read your environment variables. Create an `.env` file in your project (or edit the existing one) and add the following environment variables:

```ini
KIRBY_BASE_URL=https://kirby.example.com
KIRBY_API_USERNAME=your-username
KIRBY_API_PASSWORD=your-password
```

::: tip
Nuxt Kirby uses basic authentication by default, so you do not need to set the `auth` option in your `nuxt.config.ts` file.
:::
