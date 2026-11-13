import { createServer } from 'node:http'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { afterAll, describe, expect, it } from 'vitest'

const GZIP_BODY = '{"result":"gzip"}'

// A stand-in for Kirby that answers with what a test names in the path.
const kirby = createServer((request, response) => {
  if (request.url!.endsWith('/gzip')) {
    response.setHeader('content-encoding', 'gzip')
    response.end(gzipSync(GZIP_BODY))
    return
  }

  if (request.url!.endsWith('/hop-by-hop')) {
    response.setHeader('x-kept', '1')
    // Two writes without a length make Node send the body chunked.
    response.write('{')
    response.end('}')
    return
  }

  response.setHeader('content-type', 'application/json')
  response.end('{}')
})

await new Promise<void>(resolve => kirby.listen(0, '127.0.0.1', resolve))
const kirbyAddress = kirby.address() as { port: number }

describe('proxy response', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      kirby: {
        url: `http://127.0.0.1:${kirbyAddress.port}`,
      },
    },
  })

  afterAll(async () => {
    await new Promise(resolve => kirby.close(resolve))
  })

  function postToProxy(path: string) {
    return fetch('/api/__kirby__/proxy-response', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path }),
    })
  }

  it('withholds transfer-encoding and passes x-kept through', async () => {
    const response = await postToProxy('hop-by-hop')

    expect(response.headers.get('x-kept')).toBe('1')
    expect(response.headers.get('transfer-encoding')).toBeNull()
  })

  it('passes a compressed response back decoded and without content-encoding', async () => {
    const response = await postToProxy('gzip')

    expect(response.headers.get('content-encoding')).toBeNull()
    expect(await response.text()).toBe(GZIP_BODY)
  })
})
