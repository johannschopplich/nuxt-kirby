import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-types'
import type { NitroFetchOptions } from 'nitropack'
import type { ModuleOptions } from '../../module'
import { joinURL } from 'ufo'
import { useRuntimeConfig } from '#imports'
import { createAuthHeader, headersToObject } from '../utils'

export type KirbyFetchOptions = Omit<
  NitroFetchOptions<string>,
  'baseURL'
> & {
  /**
   * Language code to fetch data for in multi-language Kirby setups.
   */
  language?: string
}

export type KqlFetchOptions = Pick<
  NitroFetchOptions<string>,
  | 'onRequest'
  | 'onRequestError'
  | 'onResponse'
  | 'onResponseError'
  | 'headers'
  | 'retry'
  | 'retryDelay'
  | 'retryStatusCodes'
  | 'timeout'
  | 'signal'
> & {
  /**
   * Language code to fetch data for in multi-language Kirby setups.
   */
  language?: string
}

export function $kirby<T = any>(
  path: string,
  opts: KirbyFetchOptions = {},
): Promise<T> {
  const { headers, language, ...fetchOptions } = opts
  const kirby = useRuntimeConfig().kirby as Required<ModuleOptions>

  if (language)
    path = joinURL(language, path)

  return globalThis.$fetch<T, string>(path, {
    ...fetchOptions,
    baseURL: kirby.url,
    headers: {
      ...headersToObject(headers),
      ...createAuthHeader(kirby),
    },
  }) as Promise<T>
}

export function $kql<T extends KirbyQueryResponse<any, boolean> = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  opts: KqlFetchOptions = {},
): Promise<T> {
  const { headers, language, ...fetchOptions } = opts
  const kirby = useRuntimeConfig().kirby as Required<ModuleOptions>

  return globalThis.$fetch<T, string>(kirby.kqlPath, {
    ...fetchOptions,
    baseURL: kirby.url,
    method: 'POST',
    body: query,
    headers: {
      ...headersToObject(headers),
      ...createAuthHeader(kirby),
      ...(language && { 'X-Language': language }),
    },
  }) as Promise<T>
}
