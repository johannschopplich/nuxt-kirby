import { join } from 'node:path'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { afterAll, describe, expect, it } from 'vitest'
import { startKirbyStandIn } from './helpers/kirby'

describe('app.baseURL', async () => {
  const kirby = await startKirbyStandIn()
  afterAll(() => kirby.close())

  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      app: { baseURL: '/app/' },
      kirby: { url: kirby.url },
    },
  })

  it('forwards a request below the base URL', async () => {
    const response = await fetch('/app/api/__kirby__/api/site')

    expect(response.status).toBe(200)
    expect(kirby.requests[0]!.url).toBe('/base/api/site')
  })
})
