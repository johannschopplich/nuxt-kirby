# Common Issues

Solutions to frequently encountered problems when using Nuxt Kirby.

## CORS Issues

### Can I Encounter CORS Issues?

**No** – with default configuration, Nuxt proxies all requests to Kirby through its server.

All composables ([`useKql`](/api/use-kql), [`useKirbyData`](/api/use-kirby-data), [`$kql`](/api/kql), and [`$kirby`](/api/kirby)) send requests to the internal Nuxt server route `/api/__kirby__`, which forwards them to your Kirby instance. Since requests are made server-side, CORS is not an issue.

### What if I Enable Client-Side Requests?

If you enable `client: true` in your configuration, requests go directly from the browser to Kirby, which may cause CORS issues depending on your Kirby setup.

**Solution** – Configure CORS headers in your Kirby installation:

```php
// site/config/config.php
return [
    'api' => [
        'basicAuth' => true,
        'allowInsecure' => true // for development only
    ],
    'hooks' => [
        'route:before' => function ($route, $path, $method) {
            if ($method === 'OPTIONS') {
                header('Access-Control-Allow-Origin: *');
                header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
                header('Access-Control-Allow-Headers: Content-Type, Authorization');
                exit;
            }
        }
    ]
];
```

## Authentication Issues

**Check your environment variables** – Ensure they're set correctly:

```bash
# For bearer token authentication
KIRBY_BASE_URL=https://your-kirby-site.com
KIRBY_API_TOKEN=your-secret-token

# For basic authentication
KIRBY_BASE_URL=https://your-kirby-site.com
KIRBY_API_USERNAME=your-username
KIRBY_API_PASSWORD=your-password
```

**Check your Kirby setup**:

For **bearer token** authentication:
- Ensure the [Kirby Headless plugin](https://kirby.tools/docs/headless/getting-started/) is installed
- Verify the token matches in both applications
- Confirm the endpoint is `api/kql`, not `api/query`

For **basic authentication**:
- Ensure `basicAuth` is enabled in Kirby's `config.php`
- Confirm the endpoint is `api/query`, not `api/kql`
- Verify username and password are correct
