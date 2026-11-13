import { $fetch, fetch } from '@nuxt/test-utils/e2e'
import { destr } from 'destr'

export async function fetchTestResult<T = any>(path: string, query?: Record<string, string>): Promise<T> {
  const html = await $fetch<string>(path, { query })
  const content = html.match(/<script\s+type="text\/test-result">(.*?)<\/script>/s)?.[1]
  return destr(content)
}

/** Addresses the proxy route directly, since a composable would swallow the status code. */
export function postToProxy(key: string, body?: Record<string, unknown>): Promise<Response> {
  return fetch(`/api/__kirby__/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body && JSON.stringify(body),
  })
}
