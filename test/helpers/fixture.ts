import { $fetch } from '@nuxt/test-utils/e2e'
import { destr } from 'destr'

/** Reads the result a fixture page hands to `useTestResult` out of the server-rendered HTML. */
export async function fetchTestResult<T = any>(path: string, options?: { query?: Record<string, string>, headers?: Record<string, string> }): Promise<T> {
  const html = await $fetch<string>(path, options)
  const content = html.match(/<script\s+type="text\/test-result">(.*?)<\/script>/s)?.[1]
  return destr(content)
}
