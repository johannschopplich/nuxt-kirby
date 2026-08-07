import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-types'
import type { NitroFetchOptions } from 'nitropack'
import type { ModuleOptions } from '../../module'
import type { ServerFetchOptions } from '../types'
import { hash } from 'ohash'
import { useNuxtApp, useRequestFetch, useRuntimeConfig } from '#imports'
import { buildApiProxyPath, createAuthHeader, createLanguageHeader, headersToObject } from '../utils'

// #region options
export type KqlOptions = Pick<
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
  /**
   * Serve a repeated request from the Nuxt payload instead of sending it again.
   * @default true
   */
  payloadCache?: boolean
  /**
   * By default, a cache key will be generated from the request options.
   * With this option, you can provide a custom cache key.
   * @default undefined
   */
  key?: string
}
// #endregion options

export function $kql<T extends KirbyQueryResponse<any, boolean> = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  opts: KqlOptions = {},
): Promise<T> {
  const nuxt = useNuxtApp()
  const promiseMap = (nuxt._pendingRequests ||= new Map()) as Map<string, Promise<T>>
  const kirby = useRuntimeConfig().public.kirby as Required<ModuleOptions>

  const {
    headers,
    language,
    payloadCache = true,
    key,
    ...fetchOptions
  } = opts

  const _key = key || `$kql${hash([query, language])}`

  if (payloadCache && nuxt.payload.data[_key])
    return Promise.resolve(nuxt.payload.data[_key])

  if (promiseMap.has(_key))
    return promiseMap.get(_key)!

  const sharedHeaders = {
    ...headersToObject(headers),
    ...createLanguageHeader(language),
  }

  const _serverFetchOptions: NitroFetchOptions<string> = {
    method: 'POST',
    body: {
      query,
      headers: sharedHeaders,
    } satisfies ServerFetchOptions,
  }

  const _clientFetchOptions: NitroFetchOptions<string> = {
    baseURL: kirby.url,
    method: 'POST',
    headers: {
      ...sharedHeaders,
      ...createAuthHeader(kirby),
    },
    body: query,
  }

  const request = useRequestFetch()(kirby.client ? kirby.kqlPath : buildApiProxyPath(_key), {
    ...fetchOptions,
    ...(kirby.client ? _clientFetchOptions : _serverFetchOptions),
  })
    .then((response) => {
      if (payloadCache)
        nuxt.payload.data[_key] = response
      return response
    })
    .catch((error) => {
      // Invalidate cache if request fails.
      if (payloadCache)
        nuxt.payload.data[_key] = undefined
      throw error
    })
    .finally(() => {
      promiseMap.delete(_key)
    }) as Promise<T>

  promiseMap.set(_key, request)

  return request
}
