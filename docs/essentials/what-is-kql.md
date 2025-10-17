# What Is KQL?

::: info
You may visit the [KQL documentation](https://github.com/getkirby/kql) for a comprehensive introduction.
:::

Kirby's Query Language API combines the flexibility of Kirby's data structures, the power of GraphQL and the simplicity of REST.

The Kirby Query Language API takes POST requests with standard JSON objects and returns highly customized results that fit your application.

By default, the official KQL API endpoint is located at `/api/query`. An example request might look like this:

```json
{
  "query": "page('photography').children",
  "select": {
    "url": true,
    "title": true,
    "text": "page.text.markdown",
    "images": {
      "query": "page.images",
      "select": {
        "url": true
      }
    }
  },
  "pagination": {
    "limit": 10
  }
}
```

**Response**:

```json
{
  "code": 200,
  "status": "ok",
  "result": {
    "data": [
      {
        "url": "https://example.com/photography/trees",
        "title": "Trees",
        "text": "Lorem <strong>ipsum</strong> …",
        "images": [
          { "url": "https://example.com/media/pages/photography/trees/1353177920-1579007734/cheesy-autumn.jpg" },
          { "url": "https://example.com/media/pages/photography/trees/1940579124-1579007734/last-tree-standing.jpg" },
          { "url": "https://example.com/media/pages/photography/trees/3506294441-1579007734/monster-trees-in-the-fog.jpg" }
        ]
      },
      {
        "url": "https://example.com/photography/sky",
        "title": "Sky",
        "text": "<h1>Dolor sit amet</h1> …",
        "images": [
          { "url": "https://example.com/media/pages/photography/sky/183363500-1579007734/blood-moon.jpg" },
          { "url": "https://example.com/media/pages/photography/sky/3904851178-1579007734/coconut-milkyway.jpg" }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "pages": 1,
      "offset": 0,
      "limit": 10,
      "total": 2
    }
  }
}
```

::: tip
The [Kirby Headless plugin](https://kirby.tools/docs/headless/getting-started/) provides a custom KQL endpoint `/api/kql` that enables bearer token authentication. Nuxt Kirby works seamlessly with this endpoint. Check out the [Authentication guide](/essentials/authentication) for more information.
:::
