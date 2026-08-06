import type { NitroFetchOptions } from 'nitropack'
import type { ModuleOptions } from '../../module'
import type { ServerFetchOptions } from '../types'
import { hash } from 'ohash'
import { useNuxtApp, useRequestFetch, useRuntimeConfig } from '#imports'
import { buildApiProxyPath, createAuthHeader, headersToObject } from '../utils'

// #region options
export type KirbyFetchOptions = Pick<
  NitroFetchOptions<string>,
  | 'onRequest'
  | 'onRequestError'
  | 'onResponse'
  | 'onResponseError'
  | 'method'
  | 'headers'
  | 'query'
  | 'body'
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
  /**
   * Cache the response between function calls for the same path.
   * @default true
   */
  cache?: boolean
  /**
   * By default, a cache key will be generated from the request options.
   * With this option, you can provide a custom cache key.
   * @default undefined
   */
  key?: string
}
// #endregion options

export function $kirby<T = any>(
  path: string,
  opts: KirbyFetchOptions = {},
): Promise<T> {
  const nuxt = useNuxtApp()
  const promiseMap = (nuxt._pendingRequests ||= new Map()) as Map<string, Promise<T>>
  const {
    method,
    headers,
    query,
    body,
    language,
    cache = true,
    key,
    ...fetchOptions
  } = opts
  const kirby = useRuntimeConfig().public.kirby as Required<ModuleOptions>

  const _key = key || `$kirby${hash([
    path,
    method,
    query,
    body,
    language,
  ])}`

  if ((nuxt.isHydrating || cache) && nuxt.payload.data[_key])
    return Promise.resolve(nuxt.payload.data[_key])

  if (promiseMap.has(_key))
    return promiseMap.get(_key)!

  const sharedHeaders = headersToObject(headers)
  if (language)
    sharedHeaders['x-language'] = language

  const _serverFetchOptions: NitroFetchOptions<string> = {
    method: 'POST',
    body: {
      path,
      method,
      query,
      body,
      headers: sharedHeaders,
      cache,
    } satisfies ServerFetchOptions,
  }

  const _clientFetchOptions: NitroFetchOptions<string> = {
    baseURL: kirby.url,
    query,
    method,
    headers: {
      ...sharedHeaders,
      ...createAuthHeader(kirby),
    },
    body,
  }

  const request = useRequestFetch()(kirby.client ? path : buildApiProxyPath(_key), {
    ...fetchOptions,
    ...(kirby.client ? _clientFetchOptions : _serverFetchOptions),
  })
    .then((response) => {
      if (import.meta.server || cache)
        nuxt.payload.data[_key] = response
      return response
    })
    .catch((error) => {
      // Invalidate cache if request fails.
      nuxt.payload.data[_key] = undefined
      throw error
    })
    .finally(() => {
      promiseMap.delete(_key)
    }) as Promise<T>

  promiseMap.set(_key, request)

  return request
}
