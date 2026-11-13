# Authentication

Nuxt Kirby authenticates with a bearer token through Kirby Headless for production, with basic authentication for development or an existing Kirby, or not at all for a public, read-only API.

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
NUXT_KIRBY_URL=https://kirby.example.com
NUXT_KIRBY_TOKEN=your-token
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
        'allowInsecure' => true // Allow basic authentication over plain HTTP, for local development only
    ]
];
```

:::

Nuxt Kirby will automatically read your environment variables. Create an `.env` file in your project (or edit the existing one) and add the following environment variables:

```ini
NUXT_KIRBY_URL=https://kirby.example.com
NUXT_KIRBY_CREDENTIALS_USERNAME=your-username
NUXT_KIRBY_CREDENTIALS_PASSWORD=your-password
```

::: tip
Nuxt Kirby uses basic authentication by default, so you do not need to set the `auth` option in your `nuxt.config.ts` file.
:::

## When Requests Are Rejected

**Check your environment variables** against the blocks above.

**A 403 that never reached Kirby** comes from the server proxy – see [Errors of the Server Proxy](/guides/error-handling#errors-of-the-server-proxy).

**Check your Kirby setup**:

For **bearer token** authentication:
- Ensure the [Kirby Headless plugin](https://kirby.tools/docs/headless/getting-started/) is installed
- Verify the token matches in both applications
- Confirm the endpoint is `api/kql`, not `api/query`

For **basic authentication**:
- Ensure `basicAuth` is enabled in Kirby's `config.php`
- Confirm the endpoint is `api/query`, not `api/kql`
- Verify username and password are correct
