import type { KirbyQueryRequest } from 'kirby-types'
import { join } from 'node:path'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { serve } from 'srvx'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

let upstreamRequestCount = 0

// A stand-in for Kirby, so the number of requests leaving Nitro is observable and a stored response
// is distinguishable from a fresh one by its body. The delay holds a request open long enough for a
// second one to arrive while the first is still in flight.
const upstream = serve({
  hostname: '127.0.0.1',
  port: 0,
  silent: true,
  async fetch() {
    const requestNumber = ++upstreamRequestCount
    await new Promise(resolve => setTimeout(resolve, 100))
    return Response.json({ code: 200, status: 'OK', result: { title: `Site ${requestNumber}` } })
  },
})

await upstream.ready()

describe('server cache', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      kirby: {
        url: upstream.url,
        server: {
          cache: true,
          // Long enough that a repeated query within one test cannot expire.
          maxAge: 60,
        },
      },
    },
  })

  // The cache outlives the test that filled it, so each test below queries something of its own.
  beforeEach(() => {
    upstreamRequestCount = 0
  })

  afterAll(async () => {
    await upstream.close()
  })

  it('answers a repeated query without reaching Kirby again', async () => {
    const first = await postQuery({ query: 'site', select: ['title'] })
    const second = await postQuery({ query: 'site', select: ['title'] })

    expect(await first.json()).toEqual({ code: 200, status: 'OK', result: { title: 'Site 1' } })
    expect(await second.json()).toEqual({ code: 200, status: 'OK', result: { title: 'Site 1' } })
    expect(upstreamRequestCount).toBe(1)
  })

  it('answers concurrent identical queries with one request to Kirby', async () => {
    const [first, second] = await Promise.all([
      postQuery({ query: 'site.children', select: ['id'] }),
      postQuery({ query: 'site.children', select: ['id'] }),
    ])

    expect(await first.json()).toEqual({ code: 200, status: 'OK', result: { title: 'Site 1' } })
    expect(await second.json()).toEqual({ code: 200, status: 'OK', result: { title: 'Site 1' } })
    expect(upstreamRequestCount).toBe(1)
  })
})

function postQuery(query: KirbyQueryRequest): Promise<Response> {
  return fetch('/api/__kirby__/$kql-test', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  })
}
