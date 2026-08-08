import type { NitroFetchOptions } from 'nitropack'
import type { ModuleOptions } from '../../module'
import type { ServerFetchOptions } from '../types'
import { hash } from 'ohash'
import { useRequestFetch, useRuntimeConfig } from '#imports'
import { sendCachedRequest } from '../cache'
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
   * Travels as the `X-Language` header, which Kirby reads on API routes. Kirby Headless 8.1 also
   * reads it on the global-routes catch-all, but only for a path that names no language itself.
   */
  language?: string
  /**
   * Serve a repeated request from the Nuxt payload instead of sending it again.
   * @default true
   */
  payloadCache?: boolean
  /**
   * Forward the visitor's cookies to Kirby, overriding the module's `forwardCookies`.
   *
   * @remarks
   * Such a request never reads from or writes to the server-side cache, since one stored response
   * is shared between all visitors.
   */
  forwardCookies?: boolean
  /**
   * Cache key, generated from the request options by default.
   */
  key?: string
}
// #endregion options

export function $kirby<T = any>(
  path: string,
  opts: KirbyFetchOptions = {},
): Promise<T> {
  const { payloadCache = true, ...requestOptions } = opts
  const key = opts.key || `$kirby${hash([
    path,
    opts.method,
    opts.query,
    opts.body,
    opts.language,
    opts.forwardCookies,
    headersToObject(opts.headers),
  ])}`

  return sendCachedRequest(key, payloadCache, () => sendKirbyRequest<T>(path, { ...requestOptions, key }))
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
    forwardCookies,
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
      forwardCookies,
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
    // There is no proxy to forward anything here, so the browser has to attach the cookie itself.
    credentials: (forwardCookies ?? kirby.forwardCookies) ? 'include' : undefined,
  }

  return useRequestFetch()(kirby.client ? path : buildApiProxyPath(key), {
    ...fetchOptions,
    ...(kirby.client ? _clientFetchOptions : _serverFetchOptions),
  }) as Promise<T>
}
