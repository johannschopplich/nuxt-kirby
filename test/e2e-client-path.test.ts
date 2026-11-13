import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { destr } from 'destr'
import { serve } from 'srvx'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

let kirbyRequests: { path: string, authorization: string | null }[] = []
let foreignRequests: string[] = []

const kirby = serve({
  hostname: '127.0.0.1',
  port: 0,
  silent: true,
  fetch(request) {
    kirbyRequests.push({
      path: new URL(request.url).pathname,
      authorization: request.headers.get('authorization'),
    })
    return Response.json({})
  },
})
const foreign = serve({
  hostname: '127.0.0.1',
  port: 0,
  silent: true,
  fetch(request) {
    foreignRequests.push(new URL(request.url).pathname)
    return Response.json({})
  },
})

await Promise.all([
  kirby.ready(),
  foreign.ready(),
])
const foreignHost = new URL(foreign.url!).host

// The server-rendered pass sends a client-mode request the way the browser does, straight to Kirby.
describe('$kirby (client mode)', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      kirby: {
        url: new URL('base', kirby.url).href,
        client: true,
      },
    },
  })

  beforeEach(() => {
    kirbyRequests = []
    foreignRequests = []
  })

  afterAll(async () => {
    await Promise.all([
      kirby.close(),
      foreign.close(),
    ])
  })

  async function sendFromPage(path: string) {
    const html = await $fetch<string>('/tests/$kirby/path', {
      query: { path },
    })
    const content = html.match(/<script\s+type="text\/test-result">(.*?)<\/script>/s)?.[1]
    return destr<{ outcome: string | number }>(content)
  }

  it('rejects http://{host}/stolen without contacting the host it names', async () => {
    const { outcome } = await sendFromPage(`http://${foreignHost}/stolen`)

    expect(outcome).toBe(400)
    expect(foreignRequests).toEqual([])
    expect(kirbyRequests).toEqual([])
  })

  it('sends pages/notes to /base/pages/notes with the Authorization header', async () => {
    const { outcome } = await sendFromPage('pages/notes')

    expect(outcome).toBe('resolved')
    expect(kirbyRequests).toEqual([
      { path: '/base/pages/notes', authorization: 'Bearer test' },
    ])
  })
})
