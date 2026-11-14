import { request } from 'node:http'
import { join } from 'node:path'
import { $fetch, createPage, fetch, setup, url } from '@nuxt/test-utils/e2e'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchTestResult } from './helpers/fixture'
import { KIRBY_GZIP_BODY, KIRBY_REDIRECT_LOCATION, startKirbyStandIn } from './helpers/kirby'

describe('nuxt-kirby', async () => {
  const kirby = await startKirbyStandIn()
  beforeEach(() => {
    kirby.requests.length = 0
  })
  afterAll(() => kirby.close())

  await setup({
    server: true,
    browser: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      kirby: { url: kirby.url },
    },
  })

  describe('server proxy', () => {
    it('forwards a GET request below the Kirby URL with its query and the Kirby credentials', async () => {
      await fetch('/api/__kirby__/api/pages/notes?select=title')

      const [received] = kirby.requests
      expect(received!.url).toBe('/base/api/pages/notes?select=title')
      expect(received!.headers.authorization).toBe('Bearer test')
    })

    it('forwards a KQL query as the body it arrived with', async () => {
      const body = JSON.stringify({
        query: 'site',
        select: ['title'],
      })

      await fetch('/api/__kirby__/api/kql', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      })

      const [received] = kirby.requests
      expect(received!.body).toBe(body)
      expect(received!.headers['content-type']).toBe('application/json')
    })

    it('forwards x-language and withholds every other header of the visitor', async () => {
      await fetch('/api/__kirby__/api/site', {
        headers: {
          'x-language': 'de',
          'cookie': 'kirby_session=visitor',
          'authorization': 'Bearer visitor',
          'accept-language': 'fr',
          'x-custom': '1',
        },
      })

      const { headers } = kirby.requests[0]!
      expect(headers['x-language']).toBe('de')
      expect(headers.authorization).toBe('Bearer test')
      expect(headers).not.toHaveProperty('cookie')
      // `fetch` sends an `accept-language` of its own.
      expect(headers['accept-language']).not.toBe('fr')
      expect(headers).not.toHaveProperty('x-custom')
    })

    it('forwards the path with its percent-encoding and trailing slash', async () => {
      await fetch('/api/__kirby__/api/pages/a%2Fb/')

      expect(kirby.requests[0]!.url).toBe('/base/api/pages/a%2Fb/')
    })

    it('forwards the content-type of a form body sent during SSR', async () => {
      await fetchTestResult('/tests/kirby-form')

      expect(kirby.requests[0]!.headers['content-type']).toMatch(/^application\/x-www-form-urlencoded/)
    })

    it.each([
      ['POST', 'api/pages/notes'],
      ['PATCH', 'api/kql'],
    ])('refuses %s %s without contacting Kirby', async (method, path) => {
      const response = await fetch(`/api/__kirby__/${path}`, { method })

      expect(response.status).toBe(403)
      expect(kirby.requests).toEqual([])
    })

    it('rejects a path that names a host of its own without contacting it', async () => {
      const response = await fetch(`/api/__kirby__/http:%2F%2F${kirby.host}/stolen`)

      expect(response.status).toBe(400)
      expect(kirby.requests).toEqual([])
    })

    it('rejects a path that climbs above the proxy route with backslashes without contacting Kirby', async () => {
      const status = await requestRaw('/api/__kirby__/api\\..\\..\\..\\x')

      expect(status).toBe(400)
      expect(kirby.requests).toEqual([])
    })

    it('resolves %2e%2e below the proxy route before forwarding', async () => {
      await requestRaw('/api/__kirby__/api/pages/%2e%2e/site')

      expect(kirby.requests[0]!.url).toBe('/base/api/site')
    })

    it('stops the request to Kirby when the client disconnects', async () => {
      const controller = new AbortController()
      const response = await fetch('/api/__kirby__/api/stream', { signal: controller.signal })
      await response.body!.getReader().read()
      controller.abort()

      await vi.waitFor(() => expect(kirby.requests[0]!.closedEarly).toBe(true))
    })

    it('stops the request to Kirby when the client disconnects during the upload', async () => {
      const controller = new AbortController()
      const body = new ReadableStream({
        start: streamController => streamController.enqueue(new TextEncoder().encode('{"query":')),
      })
      const pending = fetch('/api/__kirby__/api/kql', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
        duplex: 'half',
        signal: controller.signal,
      } as RequestInit).catch(() => {})

      await vi.waitFor(() => expect(kirby.requests).toHaveLength(1))
      controller.abort()
      await pending

      await vi.waitFor(() => expect(kirby.requests[0]!.closedEarly).toBe(true))
    })

    it('passes the status and the body of a failed request on', async () => {
      const response = await fetch('/api/__kirby__/api/pages/missing')

      expect(response.status).toBe(404)
      expect(await response.json()).toMatchObject({ message: 'Not found' })
    })

    it('passes cache-control from Kirby on to the client', async () => {
      const response = await fetch('/api/__kirby__/api/site')

      expect(response.headers.get('cache-control')).toBe('max-age=60')
    })

    it('passes a redirect on instead of following it', async () => {
      const response = await fetch('/api/__kirby__/api/redirect', { redirect: 'manual' })

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe(KIRBY_REDIRECT_LOCATION)
      expect(kirby.requests).toHaveLength(1)
    })

    it('withholds set-cookie and x-powered-by from the response', async () => {
      const response = await fetch('/api/__kirby__/api/site')

      expect(response.headers.has('set-cookie')).toBe(false)
      expect(response.headers.has('x-powered-by')).toBe(false)
    })

    it('passes a compressed response back decoded', async () => {
      const response = await fetch('/api/__kirby__/api/gzip')

      expect(await response.text()).toBe(KIRBY_GZIP_BODY)
    })

    it('answers 502 where Kirby closes the connection', async () => {
      const response = await fetch('/api/__kirby__/api/reset')

      expect(response.status).toBe(502)
    })
  })

  describe('$kql', () => {
    it('returns the response of a query sent in the language option', async () => {
      const result = await fetchTestResult('/tests/kql', {
        query: { language: 'de' },
      })

      expect(result).toMatchObject({
        code: 200,
        result: { query: 'site', language: 'de' },
      })
    })
  })

  describe('$kirby', () => {
    it('returns the response of a path below the Kirby URL', async () => {
      const result = await fetchTestResult('/tests/kirby', {
        query: { path: 'api/pages/notes' },
      })

      expect(result.response).toMatchObject({ url: '/base/api/pages/notes', method: 'GET' })
    })
  })

  describe('$kql (server import)', () => {
    it('returns the response of a query sent in the language option', async () => {
      const response = await $fetch('/tests/server-kql')

      expect(response).toMatchObject({
        code: 200,
        result: { query: 'site', language: 'de' },
      })
      expect(kirby.requests[0]!.headers.authorization).toBe('Bearer test')
    })
  })

  describe('$kirby (server import)', () => {
    it('returns the response of a path below the Kirby URL', async () => {
      const { response } = await $fetch<any>('/tests/server-kirby', {
        query: { path: 'api/pages/notes' },
      })

      expect(response).toMatchObject({ url: '/base/api/pages/notes', method: 'GET' })
    })

    it('rejects a path that names a host of its own without contacting it', async () => {
      const { statusCode } = await $fetch<any>('/tests/server-kirby', {
        query: { path: `http://${kirby.host}/stolen` },
      })

      expect(statusCode).toBe(400)
      expect(kirby.requests).toEqual([])
    })
  })

  describe('useKql', () => {
    it('resolves the response of a query and reports status success', async () => {
      const result = await fetchTestResult('/tests/use-kql')

      expect(result).toMatchObject({
        status: 'success',
        data: {
          code: 200,
          result: { query: 'site' },
        },
      })
    })

    it('reports status error and the status code Kirby answered with', async () => {
      const result = await fetchTestResult('/tests/use-kql', {
        query: { query: 'fail' },
      })

      expect(result).toMatchObject({ status: 'error', statusCode: 500 })
    })

    it('sends one request per call site for the same query', async () => {
      const result = await fetchTestResult('/tests/use-kql-twice')

      expect(result.requestNumbers).toEqual([1, 2])
    })

    it('keeps the responses of one call site apart by language', async () => {
      const result = await fetchTestResult('/tests/use-kql-languages')

      expect(result.languages).toEqual(['en', 'de'])
    })

    it('withholds the cookie of the page request and a header from the headers option', async () => {
      await fetchTestResult('/tests/use-kql', {
        headers: { cookie: 'kirby_session=visitor' },
      })

      expect(kirby.requests[0]!.headers).not.toHaveProperty('cookie')
      expect(kirby.requests[0]!.headers).not.toHaveProperty('x-composable')
    })

    it('hydrates from the payload and sends the query again for a new language', async () => {
      const page = await createPage('/tests/use-kql')
      await page.waitForLoadState('networkidle')
      expect(kirby.requests).toHaveLength(1)

      await page.getByTestId('switch-language').click()

      await expect.poll(() => page.getByTestId('language').textContent()).toBe('de')
      expect(kirby.requests).toHaveLength(2)
      await page.close()
    })
  })

  describe('useKirbyData', () => {
    it('resolves the response of a path sent with the query and the language option', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data', {
        query: { path: 'api/pages/notes', language: 'de' },
      })

      expect(result).toMatchObject({
        status: 'success',
        data: { url: '/base/api/pages/notes?select=title', language: 'de' },
      })
    })

    it('reports status error and the status code Kirby answered with', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data', {
        query: { path: 'api/pages/missing' },
      })

      expect(result).toMatchObject({ status: 'error', statusCode: 404 })
    })
  })
})

/** Sends `path` unparsed, since `fetch` and a URL string would resolve its dot segments and backslashes first. */
function requestRaw(path: string) {
  const { hostname, port } = new URL(url('/'))

  return new Promise<number | undefined>((resolve, reject) => {
    request({ hostname, port, path }, (response) => {
      response.resume()
      resolve(response.statusCode)
    }).on('error', reject).end()
  })
}
