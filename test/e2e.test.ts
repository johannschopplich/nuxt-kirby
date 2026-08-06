import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { destr } from 'destr'
import { describe, expect, it } from 'vitest'

describe('nuxt-kirby', async () => {
  await setup({
    server: true,
    rootDir: fileURLToPath(new URL('./fixture', import.meta.url)),
  })

  describe('$kql', () => {
    it('returns the query result alongside its status code', async () => {
      const result = await fetchTestResult('/tests/$kql')

      expect(result).toMatchObject({
        code: 200,
        status: 'OK',
        result: {
          title: expect.any(String),
          children: expect.any(Array),
        },
      })
    })
  })

  describe('$kirby (composable)', () => {
    it('returns the response body of a REST path', async () => {
      const result = await fetchTestResult('/tests/$kirby')

      expect(result.result).toHaveProperty('title')
    })
  })

  describe('$kirby (server import)', () => {
    it('sends the language option as X-Language', async () => {
      const { requestedLanguage } = await $fetch<{ requestedLanguage: string }>('/tests/server-imports/language')

      expect(requestedLanguage).toBe('en')
    })

    it('leaves the path unprefixed for a language option', async () => {
      const { requestedPath } = await $fetch<{ requestedPath: string }>('/tests/server-imports/language')

      expect(requestedPath).toBe('api/__template__/__site__')
    })
  })

  describe('useKql', () => {
    it('resolves the query result and reports status success', async () => {
      const result = await fetchTestResult('/tests/use-kql/basic')

      expect(result.status).toBe('success')
      expect(result.data).toMatchObject({
        result: {
          title: expect.any(String),
          children: expect.any(Array),
        },
      })
    })

    it('resolves the query result for a language option', async () => {
      const result = await fetchTestResult('/tests/use-kql/language')

      expect(result.status).toBe('success')
      expect(result.data?.result).toHaveProperty('title')
    })

    it('exposes data and status when lazy', async () => {
      const result = await fetchTestResult('/tests/use-kql/lazy')

      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('status')
    })

    it('leaves data undefined with server: false', async () => {
      const result = await fetchTestResult('/tests/use-kql/server-false')

      expect(result.data).toBeUndefined()
    })

    it('defers the request until execute with immediate: false', async () => {
      const result = await fetchTestResult('/tests/use-kql/immediate-false')

      expect(result.beforeExecute.status).toBe('idle')
      expect(result.beforeExecute.data).toBeUndefined()
      expect(result.afterExecute.status).toBe('success')
      expect(result.afterExecute.data).toBeDefined()
    })
  })

  describe('useKirbyData', () => {
    it('resolves the response body and reports status success', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/basic')

      expect(result.status).toBe('success')
      expect(result.data?.result).toHaveProperty('title')
    })

    it('sends the headers option upstream', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/with-headers')

      expect(result.status).toBe('success')
      expect(result.receivedHeader).toBe('test-value')
    })

    it('sends the query option upstream', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/with-query')

      expect(result.status).toBe('success')
      expect(result.receivedQuery).toEqual({ select: 'title' })
    })

    it('sends the body option with method POST', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/with-body')

      expect(result.status).toBe('success')
      expect(result.receivedMethod).toBe('POST')
      expect(result.receivedBody).toEqual({ test: 'data' })
    })

    it('sends the language option as X-Language', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/language')

      expect(result.status).toBe('success')
      expect(result.receivedLanguage).toBe('en')
    })

    it('exposes data and status when lazy', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/lazy')

      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('status')
    })

    it('leaves data undefined with server: false', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/server-false')

      expect(result.data).toBeUndefined()
    })

    it('defers the request until execute with immediate: false', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/immediate-false')

      expect(result.beforeExecute.status).toBe('idle')
      expect(result.beforeExecute.data).toBeUndefined()
      expect(result.afterExecute.status).toBe('success')
      expect(result.afterExecute.data).toBeDefined()
    })
  })

  describe('prefetch', () => {
    it('resolves a prefetched query from the payload', async () => {
      const result = await fetchTestResult('/tests/prefetch')

      expect(result.status).toBe('success')
      expect(result.data).toMatchObject({
        result: {
          title: expect.any(String),
          children: expect.any(Array),
        },
      })
    })
  })
})

async function fetchTestResult<T = any>(path: string): Promise<T> {
  const html = await $fetch<string>(path)
  const content = html.match(/<script\s+type="text\/test-result">(.*?)<\/script>/s)?.[1]
  return destr(content)
}
