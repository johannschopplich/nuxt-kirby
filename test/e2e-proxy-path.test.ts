import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { serve } from 'srvx'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { fetchTestResult, postToProxy } from './utils'

const GZIP_BODY = '{"result":"gzip"}'

let kirbyRequests: { path: string, authorization: string | null }[] = []
let foreignRequests: string[] = []

const kirby = serve({
  hostname: '127.0.0.1',
  port: 0,
  silent: true,
  fetch(request) {
    const { pathname } = new URL(request.url)
    kirbyRequests.push({
      path: pathname,
      authorization: request.headers.get('authorization'),
    })

    if (pathname.endsWith('/gzip')) {
      return new Response(gzipSync(GZIP_BODY), {
        headers: { 'content-encoding': 'gzip' },
      })
    }

    if (pathname.endsWith('/hop-by-hop')) {
      // A stream carries no length, so Node sends the body chunked.
      return new Response(new Blob(['{}']).stream(), {
        headers: { 'x-kept': '1' },
      })
    }

    return Response.json({
      code: 200,
      status: 'OK',
      result: { title: 'Site' },
    })
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

await setup({
  server: true,
  rootDir: join(import.meta.dirname, 'fixture'),
  nuxtConfig: {
    kirby: {
      url: new URL('base', kirby.url).href,
      // Only the composables read `client`; the proxy and the server imports run as they would without it.
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

describe('proxy', () => {
  it('rejects an absolute URL without contacting the host it names', async () => {
    const { status } = await postToProxy('proxy-path', {
      path: `http://${foreignHost}/stolen`,
    })

    expect(status).toBe(400)
    expect(foreignRequests).toEqual([])
    expect(kirbyRequests).toEqual([])
  })

  it('rejects a non-string path', async () => {
    const { status } = await postToProxy('proxy-path', { path: 123 })

    expect(status).toBe(400)
    expect(kirbyRequests).toEqual([])
  })

  it('rejects a non-string method', async () => {
    const { status } = await postToProxy('proxy-path', { path: 'pages/notes', method: 123 })

    expect(status).toBe(400)
    expect(kirbyRequests).toEqual([])
  })

  it('rejects a request without a body', async () => {
    const { status } = await postToProxy('proxy-path')

    expect(status).toBe(400)
  })

  it('sends a $kql request to kqlPath despite isQueryRequest: false in the body', async () => {
    const { status } = await postToProxy('$kql-proxy-path', {
      isQueryRequest: false,
      path: `http://${foreignHost}/stolen`,
      query: { query: 'site' },
    })

    expect(status).toBe(200)
    expect(foreignRequests).toEqual([])
    expect(kirbyRequests).toEqual([
      { path: '/base/api/kql', authorization: 'Bearer test' },
    ])
  })

  it('forwards pages/notes to /base/pages/notes with the Authorization header', async () => {
    const { status } = await postToProxy('proxy-path', { path: 'pages/notes' })

    expect(status).toBe(200)
    expect(kirbyRequests).toEqual([
      { path: '/base/pages/notes', authorization: 'Bearer test' },
    ])
  })

  it('replaces an Authorization header from the body with the Kirby credentials', async () => {
    await postToProxy('proxy-path', {
      path: 'pages/notes',
      headers: { Authorization: 'Bearer client' },
    })

    expect(kirbyRequests).toEqual([
      { path: '/base/pages/notes', authorization: 'Bearer test' },
    ])
  })

  it('rejects headers that are not an object', async () => {
    const { status } = await postToProxy('proxy-path', { path: 'pages/notes', headers: 'Bearer client' })

    expect(status).toBe(400)
  })

  it('withholds transfer-encoding and passes x-kept through', async () => {
    const response = await postToProxy('proxy-path', { path: 'hop-by-hop' })

    expect(response.headers.get('x-kept')).toBe('1')
    expect(response.headers.get('transfer-encoding')).toBeNull()
  })

  it('passes a compressed response back decoded', async () => {
    const response = await postToProxy('proxy-path', { path: 'gzip' })

    expect(await response.text()).toBe(GZIP_BODY)
  })
})

describe('$kirby (server import)', () => {
  function sendServerImport(path: string) {
    return $fetch<{ outcome: string | number }>('/tests/server-imports/path', {
      query: { path },
    })
  }

  it('rejects an absolute URL without contacting the host it names', async () => {
    const { outcome } = await sendServerImport(`http://${foreignHost}/stolen`)

    expect(outcome).toBe(400)
    expect(foreignRequests).toEqual([])
    expect(kirbyRequests).toEqual([])
  })

  it('sends pages/notes to /base/pages/notes with the Authorization header', async () => {
    const { outcome } = await sendServerImport('pages/notes')

    expect(outcome).toBe('resolved')
    expect(kirbyRequests).toEqual([
      { path: '/base/pages/notes', authorization: 'Bearer test' },
    ])
  })
})

// The server-rendered pass sends a client-mode request the way the browser does, straight to Kirby.
describe('$kirby (client mode)', () => {
  function sendFromPage(path: string) {
    return fetchTestResult<{ outcome: string | number }>('/tests/$kirby/path', { path })
  }

  it('rejects an absolute URL without contacting the host it names', async () => {
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
