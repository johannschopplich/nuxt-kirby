import { join } from 'node:path'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { fetchTestResult } from './helpers/fixture'
import { startKirbyStandIn } from './helpers/kirby'

describe('forwardCookies', async () => {
  const kirby = await startKirbyStandIn()
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
        forwardCookies: true,
        // Set as well, so that a response answered from the server cache would show.
        server: { cache: true, maxAge: 60 },
      },
    },
  })

  it('sends the visitor cookie on to Kirby', async () => {
    await fetch('/api/__kirby__/api/site', {
      headers: { cookie: 'kirby_session=visitor' },
    })

    expect(kirby.requests[0]!.headers.cookie).toBe('kirby_session=visitor')
  })

  it('sends the cookie of the page request on to Kirby during SSR', async () => {
    await fetchTestResult('/tests/use-kql', {
      headers: { cookie: 'kirby_session=visitor' },
    })

    expect(kirby.requests[0]!.headers.cookie).toBe('kirby_session=visitor')
  })

  it('passes the set-cookie header Kirby sent on to the visitor', async () => {
    const response = await fetch('/api/__kirby__/api/site')

    expect(response.headers.get('set-cookie')).toBe('kirby_session=1; Path=/; HttpOnly')
  })

  it('reaches Kirby again for a repeated request despite server.cache', async () => {
    await fetch('/api/__kirby__/api/site')
    await fetch('/api/__kirby__/api/site')

    expect(kirby.requests).toHaveLength(2)
  })

  it('refuses a cross-site request without contacting Kirby', async () => {
    const response = await fetch('/api/__kirby__/api/site', {
      headers: { 'sec-fetch-site': 'cross-site' },
    })

    expect(response.status).toBe(403)
    expect(kirby.requests).toEqual([])
  })
})
