import type { KirbyQueryResponse } from 'kirby-types'
import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

const route = `/api/__kirby__/${encodeURIComponent('$kqlshared')}`

function postQuery(query: Record<string, unknown>) {
  return $fetch<KirbyQueryResponse<any>>(route, {
    method: 'POST',
    body: { query },
  })
}

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

  it('serves each query its own result when two share a route key', async () => {
    const site = await postQuery({ query: 'site', select: { title: true } })
    const children = await postQuery({ query: 'site.children', select: { id: true } })

    expect(site.result).toMatchObject({ title: expect.any(String) })
    expect(children.result).toEqual(expect.any(Array))
  })
})
