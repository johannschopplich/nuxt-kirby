import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-types'
import type { NitroFetchOptions } from 'nitropack'
import type { ModuleOptions } from '../../module'
import type { ServerFetchOptions } from '../types'
import { hash } from 'ohash'
import { useRequestFetch, useRuntimeConfig } from '#imports'
import { sendCachedRequest } from '../cache'
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

export function $kql<T extends KirbyQueryResponse<any, boolean> = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  opts: KqlOptions = {},
): Promise<T> {
  const { payloadCache = true, ...requestOptions } = opts
  const key = opts.key || `$kql${hash([query, opts.language, opts.forwardCookies])}`

  return sendCachedRequest(key, payloadCache, () => sendKqlRequest<T>(query, { ...requestOptions, key }))
}

/** Sends the query with nothing cached in front of it. */
export function sendKqlRequest<T extends KirbyQueryResponse<any, boolean> = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  opts: Omit<KqlOptions, 'payloadCache'> & { key: string },
): Promise<T> {
  const kirby = useRuntimeConfig().public.kirby as Required<ModuleOptions>

  const {
    headers,
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
      query,
      headers: sharedHeaders,
      forwardCookies,
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
    // There is no proxy to forward anything here, so the browser has to attach the cookie itself.
    credentials: (forwardCookies ?? kirby.forwardCookies) ? 'include' : undefined,
  }

  return useRequestFetch()(kirby.client ? kirby.kqlPath : buildApiProxyPath(key), {
    ...fetchOptions,
    ...(kirby.client ? _clientFetchOptions : _serverFetchOptions),
  }) as Promise<T>
}
