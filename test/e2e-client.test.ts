import { join } from 'node:path'
import { setup } from '@nuxt/test-utils/e2e'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { fetchTestResult } from './helpers/fixture'
import { startKirbyStandIn } from './helpers/kirby'

describe('client mode', async () => {
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
        client: true,
      },
    },
  })

  it('sends a KQL query straight to Kirby with the Kirby credentials and the headers option during SSR', async () => {
    const result = await fetchTestResult('/tests/use-kql')

    expect(result).toMatchObject({ status: 'success' })
    expect(kirby.requests[0]!.url).toBe('/base/api/kql')
    expect(kirby.requests[0]!.headers.authorization).toBe('Bearer test')
    // The server proxy would have withheld it.
    expect(kirby.requests[0]!.headers['x-composable']).toBe('1')
  })

  it('withholds the cookie of the page request from Kirby', async () => {
    await fetchTestResult('/tests/use-kql', {
      headers: { cookie: 'kirby_session=visitor' },
    })

    expect(kirby.requests[0]!.headers).not.toHaveProperty('cookie')
  })

  it('rejects a path that names a host of its own without contacting it', async () => {
    const result = await fetchTestResult('/tests/kirby', {
      query: { path: `http://${kirby.host}/stolen` },
    })

    expect(result.statusCode).toBe(400)
    expect(kirby.requests).toEqual([])
  })
})
