import { createServer } from 'node:http'
import { join } from 'node:path'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { afterAll, describe, expect, it } from 'vitest'

// A stand-in for Kirby that answers with what a test names in the path.
const kirby = createServer((request, response) => {
  if (request.url!.endsWith('/hop-by-hop')) {
    response.setHeader('keep-alive', 'timeout=99')
    response.setHeader('proxy-authenticate', 'Basic realm="kirby"')
    response.setHeader('upgrade', 'h2c')
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

  it('withholds the hop-by-hop headers Kirby sent', async () => {
    const response = await postToProxy('hop-by-hop')

    expect(response.headers.get('x-kept')).toBe('1')
    expect(response.headers.get('keep-alive')).not.toBe('timeout=99')
    expect(response.headers.get('proxy-authenticate')).toBeNull()
    expect(response.headers.get('upgrade')).toBeNull()
    expect(response.headers.get('transfer-encoding')).toBeNull()
  })
})
