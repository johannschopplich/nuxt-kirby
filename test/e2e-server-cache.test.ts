import { join } from 'node:path'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

// The default fixture leaves `server.cache` off, so the cached branch of the proxy handler needs a
// second app to run in.
describe('server cache', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      kirby: {
        server: {
          cache: true,
        },
      },
    },
  })

  it('answers a repeated query with the response it stored', async () => {
    const first = await postToProxy({ query: 'site', select: ['title'] })
    expect(first.status).toBe(200)

    const result = await first.json()
    expect(result).toMatchObject({ result: { title: expect.any(String) } })

    const second = await postToProxy({ query: 'site', select: ['title'] })
    expect(await second.json()).toEqual(result)
  })
})

function postToProxy(query: Record<string, unknown>): Promise<Response> {
  return fetch('/api/__kirby__/$kql-test', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  })
}
