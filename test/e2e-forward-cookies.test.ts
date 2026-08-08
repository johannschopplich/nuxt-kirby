import type { KirbyQueryRequest } from 'kirby-types'
import { join } from 'node:path'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { serve } from 'srvx'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

let upstreamRequestCount = 0
let receivedCookies: (string | null)[] = []

// A stand-in for Kirby that records what the proxy passed on, so the cookie is observable from the
// test rather than inferred from the proxy's own response.
const upstream = serve({
  hostname: '127.0.0.1',
  port: 0,
  silent: true,
  fetch(request) {
    upstreamRequestCount++
    receivedCookies.push(request.headers.get('cookie'))
    return Response.json({ code: 200, status: 'OK', result: { title: 'Site' } }, {
      headers: { 'set-cookie': 'kirby_session=fresh; Path=/' },
    })
  },
})

await upstream.ready()

describe('forwardCookies', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      kirby: {
        url: upstream.url,
        // Cache on, so that the bypass is observable at all; the option itself stays at its
        // default, so every test opts in for itself.
        server: { cache: true, maxAge: 60 },
      },
    },
  })

  beforeEach(() => {
    upstreamRequestCount = 0
    receivedCookies = []
  })

  afterAll(async () => {
    await upstream.close()
  })

  it('withholds the visitor cookie from Kirby by default', async () => {
    await postQuery({ query: 'site', select: ['title'] })

    expect(receivedCookies).toEqual([null])
  })

  it('sends the visitor cookie on to Kirby', async () => {
    await postQuery({ query: 'site.title', select: ['title'] }, true)

    expect(receivedCookies).toEqual(['kirby_session=abc'])
  })

  it('reaches Kirby again rather than answering a cookie-bearing request from the cache', async () => {
    await postQuery({ query: 'site.children', select: ['title'] }, true)
    await postQuery({ query: 'site.children', select: ['title'] }, true)

    expect(upstreamRequestCount).toBe(2)
  })

  it('passes the session Kirby issues on to the visitor', async () => {
    const response = await postQuery({ query: 'site.info', select: ['title'] }, true)

    expect(response.headers.getSetCookie()).toContain('kirby_session=fresh; Path=/')
  })
})

function postQuery(query: KirbyQueryRequest, forwardCookies?: boolean): Promise<Response> {
  return fetch('/api/__kirby__/$kql-test', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'cookie': 'kirby_session=abc',
    },
    body: JSON.stringify({ query, forwardCookies }),
  })
}
