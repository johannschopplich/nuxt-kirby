import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-types'
import type { KirbyFetchOptions, KqlOptions, ServerKirbyConfig } from '../types'
import { useRuntimeConfig } from 'nitropack/runtime'
import { joinURL } from 'ufo'
import { createAuthHeader, createLanguageHeader, mergeHeaders } from '../utils'
import { assertPathBelowBase } from './path'

export type NitroKirbyFetchOptions = KirbyFetchOptions
export type NitroKqlFetchOptions = KqlOptions

export async function $kirby<T = any>(
  path: string,
  opts: NitroKirbyFetchOptions = {},
): Promise<T> {
  const { headers, language, ...fetchOptions } = opts
  const kirby = useRuntimeConfig().kirby as ServerKirbyConfig

  assertPathBelowBase(path)

  // Joined here rather than by `$fetch`, which sends a path that names a scheme to the host it names.
  return globalThis.$fetch<T, string>(joinURL(kirby.url, path), {
    ...fetchOptions,
    // Without it, `$fetch` would prepend `app.baseURL`.
    baseURL: '',
    headers: mergeHeaders(headers, createLanguageHeader(language), createAuthHeader(kirby)),
  }) as Promise<T>
}

export async function $kql<T extends KirbyQueryResponse<any, boolean> = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  opts: NitroKqlFetchOptions = {},
): Promise<T> {
  const kirby = useRuntimeConfig().kirby as ServerKirbyConfig

  return $kirby<T>(kirby.kqlPath, {
    ...opts,
    method: 'POST',
    body: query,
  })
}
