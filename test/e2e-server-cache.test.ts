import { join } from 'node:path'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { startKirbyStandIn } from './helpers/kirby'

describe('server cache', async () => {
  // The delay holds a request open long enough for a second one to arrive while the first is in flight.
  const kirby = await startKirbyStandIn({ delay: 100 })
  // The cache outlives the test that filled it, so each test below queries something of its own.
  beforeEach(() => {
    kirby.requests.length = 0
  })
  afterAll(() => kirby.close())

  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      kirby: {
        url: kirby.url,
        server: {
          cache: true,
          // Long enough that a repeated request within one test cannot expire.
          maxAge: 60,
        },
      },
    },
  })

  function postQuery(query: string, headers?: Record<string, string>) {
    return fetch('/api/__kirby__/api/kql', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify({ query }),
    })
  }

  it('answers a repeated KQL query without reaching Kirby again', async () => {
    const first = await postQuery('repeated')
    const second = await postQuery('repeated')

    expect(await second.json()).toEqual(await first.json())
    expect(kirby.requests).toHaveLength(1)
  })

  it('answers a repeated GET request without reaching Kirby again', async () => {
    await fetch('/api/__kirby__/api/pages/repeated')
    await fetch('/api/__kirby__/api/pages/repeated')

    expect(kirby.requests).toHaveLength(1)
  })

  it('answers a query reformatted with whitespace from the cache', async () => {
    for (const body of ['{"query":"spelled"}', '{ "query": "spelled" }']) {
      await fetch('/api/__kirby__/api/kql', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      })
    }

    expect(kirby.requests).toHaveLength(1)
  })

  it('answers a repeated KQL query to the KQL path with a trailing slash from the cache', async () => {
    for (let index = 0; index < 2; index++) {
      await fetch('/api/__kirby__/api/kql/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: 'slashed' }),
      })
    }

    expect(kirby.requests).toHaveLength(1)
  })

  it('answers concurrent identical queries with one request to Kirby', async () => {
    await Promise.all([
      postQuery('concurrent'),
      postQuery('concurrent'),
    ])

    expect(kirby.requests).toHaveLength(1)
  })

  it('reaches Kirby again for the same query in another language', async () => {
    await postQuery('translated', { 'x-language': 'en' })
    const response = await postQuery('translated', { 'x-language': 'de' })

    expect(await response.json()).toMatchObject({
      result: { language: 'de' },
    })
    expect(kirby.requests).toHaveLength(2)
  })

  it('passes cache-control from Kirby on to the client', async () => {
    await postQuery('headed')
    const response = await postQuery('headed')

    expect(response.headers.get('cache-control')).toBe('max-age=60')
    expect(kirby.requests).toHaveLength(1)
  })

  it('strips the set-cookie header Kirby sent', async () => {
    const response = await postQuery('session')

    expect(response.headers.has('set-cookie')).toBe(false)
  })
})
