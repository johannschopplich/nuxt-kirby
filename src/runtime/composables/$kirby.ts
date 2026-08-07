import type { NitroFetchOptions } from 'nitropack'
import type { ModuleOptions } from '../../module'
import type { ServerFetchOptions } from '../types'
import { hash } from 'ohash'
import { useNuxtApp, useRequestFetch, useRuntimeConfig } from '#imports'
import { buildApiProxyPath, createAuthHeader, createLanguageHeader, headersToObject } from '../utils'

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

export function $kirby<T = any>(
  path: string,
  opts: KirbyFetchOptions = {},
): Promise<T> {
  const nuxt = useNuxtApp()
  const promiseMap = (nuxt._pendingRequests ||= new Map()) as Map<string, Promise<T>>

  const { payloadCache = true, ...requestOptions } = opts
  const key = opts.key || `$kirby${hash([
    path,
    opts.method,
    opts.query,
    opts.body,
    opts.language,
  ])}`

  if (payloadCache && nuxt.payload.data[key])
    return Promise.resolve(nuxt.payload.data[key])

  if (promiseMap.has(key))
    return promiseMap.get(key)!

  const request = sendKirbyRequest<T>(path, { ...requestOptions, key })
    .then((response) => {
      if (payloadCache)
        nuxt.payload.data[key] = response
      return response
    })
    .catch((error) => {
      // Invalidate cache if request fails.
      if (payloadCache)
        nuxt.payload.data[key] = undefined
      throw error
    })
    .finally(() => {
      promiseMap.delete(key)
    }) as Promise<T>

  promiseMap.set(key, request)

  return request
}

/** Sends the request with nothing cached in front of it. */
export function sendKirbyRequest<T = any>(
  path: string,
  opts: Omit<KirbyFetchOptions, 'payloadCache'> & { key: string },
): Promise<T> {
  const kirby = useRuntimeConfig().public.kirby as Required<ModuleOptions>

  const {
    method,
    headers,
    query,
    body,
    language,
    key,
    ...fetchOptions
  } = opts

  const sharedHeaders = {
    ...headersToObject(headers),
    ...createLanguageHeader(language),
  }

  const _serverFetchOptions: NitroFetchOptions<string> = {
    method: 'POST',
    body: {
      path,
      method,
      query,
      body,
      headers: sharedHeaders,
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

  return useRequestFetch()(kirby.client ? path : buildApiProxyPath(key), {
    ...fetchOptions,
    ...(kirby.client ? _clientFetchOptions : _serverFetchOptions),
  }) as Promise<T>
}
