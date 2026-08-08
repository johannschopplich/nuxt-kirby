import { join } from 'node:path'
import { $fetch, createPage, fetch, setup } from '@nuxt/test-utils/e2e'
import { destr } from 'destr'
import { describe, expect, it } from 'vitest'

describe('nuxt-kirby', async () => {
  await setup({
    server: true,
    browser: true,
    rootDir: join(import.meta.dirname, 'fixture'),
  })

  describe('$kql', () => {
    it('returns the query result alongside its status code', async () => {
      const result = await fetchTestResult('/tests/$kql')

      expect(result).toMatchObject({
        code: 200,
        status: 'OK',
        result: {
          title: expect.any(String),
          children: expect.any(Array),
        },
      })
    })

    it('serves a repeated query from the payload', async () => {
      const result = await fetchTestResult<{ firstHits: number, secondHits: number }>('/tests/$kql/payload-cache')

      expect(result.firstHits).toBeGreaterThan(0)
      expect(result.secondHits).toBe(result.firstHits)
    })

    it('sends the query again with payloadCache: false', async () => {
      const result = await fetchTestResult<{ firstHits: number, uncachedHits: number }>('/tests/$kql/payload-cache')

      expect(result.uncachedHits).toBe(result.firstHits + 1)
    })

    it('answers with the raw response after useKql transformed the same query', async () => {
      const result = await fetchTestResult<{ rawHits: number }>('/tests/$kql/raw-after-transform')

      expect(result.rawHits).toBeGreaterThan(0)
    })

    it('hydrates from the payload with payloadCache: false', async () => {
      const page = await createPage('/tests/$kql/hydration')

      await expect.poll(() => page.getByTestId('client-hits').textContent())
        .toBe(await page.getByTestId('server-hits').textContent())
      await page.close()
    })

    it('keys a query by forwardCookies, so an opted-out call is not served the opted-in response', async () => {
      const result = await fetchTestResult('/tests/$kql/forward-cookies-key')

      expect(result).toEqual({ forwarded: true, withheld: false })
    })

    it('keys a query by its headers, so a differing header set is fetched again', async () => {
      const result = await fetchTestResult('/tests/$kql/headers-key')

      expect(result).toEqual({ first: 'first', second: 'second' })
    })
  })

  describe('$kirby (composable)', () => {
    it('returns the response body of a REST path', async () => {
      const result = await fetchTestResult('/tests/$kirby')

      expect(result.result).toHaveProperty('title')
    })

    it('keys a path by forwardCookies, so an opted-out call is not served the opted-in response', async () => {
      const result = await fetchTestResult('/tests/$kirby/forward-cookies-key')

      expect(result).toEqual({ forwarded: true, withheld: false })
    })

    it('keys a path by its headers, so a differing header set is fetched again', async () => {
      const result = await fetchTestResult('/tests/$kirby/headers-key')

      expect(result).toEqual({ first: 'first', second: 'second' })
    })
  })

  describe('$kirby (server import)', () => {
    it('sends the language option as X-Language', async () => {
      const { requestedLanguage } = await $fetch<{ requestedLanguage: string }>('/tests/server-imports/language')

      expect(requestedLanguage).toBe('en')
    })

    it('leaves the path unprefixed for a language option', async () => {
      const { requestedPath } = await $fetch<{ requestedPath: string }>('/tests/server-imports/language')

      expect(requestedPath).toBe('api/__template__/__site__')
    })
  })

  describe('useKql', () => {
    it('resolves the query result and reports status success', async () => {
      const result = await fetchTestResult('/tests/use-kql/basic')

      expect(result.status).toBe('success')
      expect(result.data).toMatchObject({
        result: {
          title: expect.any(String),
          children: expect.any(Array),
        },
      })
    })

    it('sends the language option as X-Language', async () => {
      const result = await fetchTestResult('/tests/use-kql/language')

      expect(result.status).toBe('success')
      expect(result.receivedLanguage).toBe('en')
    })

    it('reports status error and the upstream status code for an empty query', async () => {
      const result = await fetchTestResult('/tests/use-kql/error')

      expect(result.status).toBe('error')
      expect(result.data).toBeUndefined()
      expect(result.statusCode).toBe(400)
    })

    it('sends a single request for two call sites with the same query', async () => {
      const result = await fetchTestResult('/tests/use-kql/shared-request')

      expect(result.firstHits).toBeGreaterThan(0)
      expect(result.secondHits).toBe(result.firstHits)
    })

    it('transforms each response exactly once', async () => {
      const result = await fetchTestResult('/tests/use-kql/refresh')

      expect(result.initialCount).toBe(1)
      expect(result.refreshedCount).toBe(1)
    })

    it('resolves from getCachedData instead of sending the query', async () => {
      const result = await fetchTestResult('/tests/use-kql/get-cached-data')

      expect(result.status).toBe('success')
      expect(result.title).toBe('from getCachedData')
    })

    it('exposes data and status with lazy: true', async () => {
      const result = await fetchTestResult('/tests/use-kql/lazy')

      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('status')
    })

    it('leaves data undefined with server: false', async () => {
      const result = await fetchTestResult('/tests/use-kql/server-false')

      expect(result.data).toBeUndefined()
    })

    it('defers the request until execute with immediate: false', async () => {
      const result = await fetchTestResult('/tests/use-kql/immediate-false')

      expect(result.beforeExecute.status).toBe('idle')
      expect(result.beforeExecute.data).toBeUndefined()
      expect(result.afterExecute.status).toBe('success')
      expect(result.afterExecute.data).toBeDefined()
    })

    it('keys a query by forwardCookies, so an opted-out call is not served the opted-in response', async () => {
      const result = await fetchTestResult('/tests/use-kql/forward-cookies-key')

      expect(result).toEqual({ forwarded: true, withheld: false })
    })

    it('keys a query by its headers, so a differing header set is fetched again', async () => {
      const result = await fetchTestResult('/tests/use-kql/headers-key')

      expect(result).toEqual({ first: 'first', second: 'second' })
    })
  })

  describe('useKirbyData', () => {
    it('resolves the response body and reports status success', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/basic')

      expect(result.status).toBe('success')
      expect(result.data?.result).toHaveProperty('title')
    })

    it('sends the headers option upstream', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/with-headers')

      expect(result.status).toBe('success')
      expect(result.receivedHeader).toBe('test-value')
    })

    it('sends the query option upstream', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/with-query')

      expect(result.status).toBe('success')
      expect(result.receivedQuery).toEqual({ select: 'title' })
    })

    it('sends the body option with method POST', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/with-body')

      expect(result.status).toBe('success')
      expect(result.receivedMethod).toBe('POST')
      expect(result.receivedBody).toEqual({ test: 'data' })
    })

    it('sends the language option as X-Language', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/language')

      expect(result.status).toBe('success')
      expect(result.receivedLanguage).toBe('en')
    })

    it('exposes data and status with lazy: true', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/lazy')

      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('status')
    })

    it('leaves data undefined with server: false', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/server-false')

      expect(result.data).toBeUndefined()
    })

    it('defers the request until execute with immediate: false', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/immediate-false')

      expect(result.beforeExecute.status).toBe('idle')
      expect(result.beforeExecute.data).toBeUndefined()
      expect(result.afterExecute.status).toBe('success')
      expect(result.afterExecute.data).toBeDefined()
    })

    it('reports status error and the upstream status code for an unknown path', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/error')

      expect(result.status).toBe('error')
      expect(result.data).toBeUndefined()
      expect(result.statusCode).toBe(404)
    })

    it('keys a path by forwardCookies, so an opted-out call is not served the opted-in response', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/forward-cookies-key')

      expect(result).toEqual({ forwarded: true, withheld: false })
    })

    it('keys a path by its headers, so a differing header set is fetched again', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/headers-key')

      expect(result).toEqual({ first: 'first', second: 'second' })
    })
  })

  describe('proxy handler', () => {
    it('rejects a KQL request without a query with 400', async () => {
      const response = await postToProxy('$kql-test', { query: {} })

      expect(response.status).toBe(400)
      expect(await response.json()).toMatchObject({ statusMessage: 'KQL query is empty' })
    })

    it('rejects an absolute path with 400', async () => {
      const response = await postToProxy('$kirby-test', { path: 'https://example.com/api/site' })

      expect(response.status).toBe(400)
      expect(await response.json()).toMatchObject({ statusMessage: 'Absolute URLs are not allowed' })
    })
  })

  describe('prefetch', () => {
    it('resolves a prefetched query from the payload', async () => {
      const result = await fetchTestResult('/tests/prefetch')

      expect(result.status).toBe('success')
      expect(result.data).toMatchObject({
        result: {
          title: expect.any(String),
          children: expect.any(Array),
        },
      })
    })
  })
})

async function fetchTestResult<T = any>(path: string): Promise<T> {
  const html = await $fetch<string>(path)
  const content = html.match(/<script\s+type="text\/test-result">(.*?)<\/script>/s)?.[1]
  return destr(content)
}

/** Addresses the proxy route directly, since a composable would swallow the status code. */
function postToProxy(key: string, body: Record<string, unknown>): Promise<Response> {
  return fetch(`/api/__kirby__/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}
