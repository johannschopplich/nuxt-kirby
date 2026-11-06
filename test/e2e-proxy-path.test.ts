import { join } from 'node:path'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { serve } from 'srvx'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

let kirbyRequests: { path: string, authorization: string | null }[] = []
let foreignRequests: string[] = []

const kirby = serve({
  hostname: '127.0.0.1',
  port: 0,
  silent: true,
  fetch(request) {
    const { pathname } = new URL(request.url)
    kirbyRequests.push({ path: pathname, authorization: request.headers.get('authorization') })
    return Response.json({ code: 200, status: 'OK', result: { title: 'Site' } })
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

await Promise.all([kirby.ready(), foreign.ready()])
const foreignHost = new URL(foreign.url!).host

describe('proxy', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      kirby: {
        url: new URL('base', kirby.url).href,
      },
    },
  })

  beforeEach(() => {
    kirbyRequests = []
    foreignRequests = []
  })

  afterAll(async () => {
    await Promise.all([kirby.close(), foreign.close()])
  })

  function postToProxy(key: string, body?: Record<string, unknown>) {
    return fetch(`/api/__kirby__/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: body && JSON.stringify(body),
    }).then(response => response.status)
  }

  it.each([
    'http:{host}/stolen',
    ' http:{host}/stolen',
    '//{host}/stolen',
  ])('rejects %j without contacting the host it names', async (pathTemplate) => {
    const status = await postToProxy('proxy-path', { path: pathTemplate.replace('{host}', foreignHost) })

    expect(status).toBe(400)
    expect(foreignRequests).toEqual([])
    expect(kirbyRequests).toEqual([])
  })

  it.each([
    '../secret',
    '%2E%2E/secret',
    '.\t./secret',
    'pages/..\\..\\secret',
    'pages/..%2F..%2F..%2Fsecret',
  ])('rejects %j for leaving the base path', async (path) => {
    const status = await postToProxy('proxy-path', { path })

    expect(status).toBe(400)
    expect(kirbyRequests).toEqual([])
  })

  it('rejects a non-string path', async () => {
    const status = await postToProxy('proxy-path', { path: 123 })

    expect(status).toBe(400)
    expect(kirbyRequests).toEqual([])
  })

  it('sends a $kql request to kqlPath despite isQueryRequest: false in the body', async () => {
    const status = await postToProxy('$kql-proxy-path', {
      isQueryRequest: false,
      path: `http://${foreignHost}/stolen`,
      query: { query: 'site' },
    })

    expect(status).toBe(200)
    expect(foreignRequests).toEqual([])
    expect(kirbyRequests).toEqual([{ path: '/base/api/kql', authorization: 'Bearer test' }])
  })

  it.each(['pages/notes', './pages/notes'])('forwards %s to /base/pages/notes with the Authorization header', async (path) => {
    const status = await postToProxy('proxy-path', { path })

    expect(status).toBe(200)
    expect(kirbyRequests).toEqual([{ path: '/base/pages/notes', authorization: 'Bearer test' }])
  })

  it('replaces an Authorization header from the body with the Kirby credentials', async () => {
    await postToProxy('proxy-path', { path: 'pages/notes', headers: { Authorization: 'Bearer client' } })

    expect(kirbyRequests).toEqual([{ path: '/base/pages/notes', authorization: 'Bearer test' }])
  })

  it('rejects headers that are not an object', async () => {
    const status = await postToProxy('proxy-path', { path: 'pages/notes', headers: 'Bearer client' })

    expect(status).toBe(400)
  })
})
