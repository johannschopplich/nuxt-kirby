import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-types'
import type { NitroFetchOptions } from 'nitropack'
import type { ModuleOptions } from '../../module'
import { useRuntimeConfig } from '#imports'
import { createAuthHeader, createLanguageHeader, headersToObject } from '../utils'

export type NitroKirbyFetchOptions = Omit<
  NitroFetchOptions<string>,
  'baseURL'
> & {
  /**
   * Language code to fetch data for in multi-language Kirby setups.
   *
   * @remarks
   * Travels as the `X-Language` header, which Kirby reads for API routes only.
   * A page fetched by its own path carries the language in that path instead.
   */
  language?: string
}

export type NitroKqlFetchOptions = Pick<
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
   *
   * @remarks
   * Travels as the `X-Language` header, which Kirby reads for API routes only.
   * A page fetched by its own path carries the language in that path instead.
   */
  language?: string
}

export function $kirby<T = any>(
  path: string,
  opts: NitroKirbyFetchOptions = {},
): Promise<T> {
  const { headers, language, ...fetchOptions } = opts
  const kirby = useRuntimeConfig().kirby as Required<ModuleOptions>

  return globalThis.$fetch<T, string>(path, {
    ...fetchOptions,
    baseURL: kirby.url,
    headers: {
      ...headersToObject(headers),
      ...createLanguageHeader(language),
      ...createAuthHeader(kirby),
    },
  }) as Promise<T>
}

export function $kql<T extends KirbyQueryResponse<any, boolean> = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  opts: NitroKqlFetchOptions = {},
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
      ...createLanguageHeader(language),
      ...createAuthHeader(kirby),
    },
  }) as Promise<T>
}
