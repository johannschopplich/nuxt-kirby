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
    it('fetches KQL queries', async () => {
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

  describe('$kirby', () => {
    it('fetches Kirby API endpoints', async () => {
      const result = await fetchTestResult('/tests/$kirby')

      expect(result.result).toHaveProperty('title')
    })
  })

  describe('useKql', () => {
    it('fetches data with status', async () => {
      const result = await fetchTestResult('/tests/use-kql/basic')

      expect(result.status).toBe('success')
      expect(result.data).toMatchObject({
        result: {
          title: expect.any(String),
          children: expect.any(Array),
        },
      })
    })

    it('supports language option', async () => {
      const result = await fetchTestResult('/tests/use-kql/language')

      expect(result.status).toBe('success')
      expect(result.data?.result).toHaveProperty('title')
    })

    it('supports lazy loading', async () => {
      const result = await fetchTestResult('/tests/use-kql/lazy')

      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('status')
    })

    it('skips SSR with server: false', async () => {
      const result = await fetchTestResult('/tests/use-kql/server-false')

      expect(result.data).toBeUndefined()
    })

    it('defers execution with immediate: false', async () => {
      const result = await fetchTestResult('/tests/use-kql/immediate-false')

      expect(result.beforeExecute.status).toBe('idle')
      expect(result.beforeExecute.data).toBeUndefined()
      expect(result.afterExecute.status).toBe('success')
      expect(result.afterExecute.data).toBeDefined()
    })
  })

  describe('useKirbyData', () => {
    it('fetches data with status', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/basic')

      expect(result.status).toBe('success')
      expect(result.data?.result).toHaveProperty('title')
    })

    it('supports custom headers', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/with-headers')

      expect(result.status).toBe('success')
      expect(result.data?.result).toBeDefined()
    })

    it('supports query parameters', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/with-query')

      expect(result.status).toBe('success')
      expect(result.data?.result).toBeDefined()
    })

    it('supports POST with body', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/with-body')

      expect(result.status).toBe('success')
    })

    it('supports language option', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/language')

      expect(result).toHaveProperty('data')
    })

    it('supports lazy loading', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/lazy')

      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('status')
    })

    it('skips SSR with server: false', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/server-false')

      expect(result.data).toBeUndefined()
    })

    it('defers execution with immediate: false', async () => {
      const result = await fetchTestResult('/tests/use-kirby-data/immediate-false')

      expect(result.beforeExecute.status).toBe('idle')
      expect(result.beforeExecute.data).toBeUndefined()
      expect(result.afterExecute.status).toBe('success')
      expect(result.afterExecute.data).toBeDefined()
    })
  })

  describe('prefetch', () => {
    it('uses prefetched KQL queries', async () => {
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
