import type { RequestEvent } from 'nuxt/server'
import type { ServerKirbyConfig } from '../types'
import { createError, defineEventHandler, getRequestHeader, useRuntimeConfig } from 'nuxt/server'
import { joinURL, withTrailingSlash } from 'ufo'
import { createAuthHeader } from '../utils'
import { isAllowedRoute, isPathBelowBase, resolveRoutePath } from './path'
import { endOnAbort } from './stream'

/** Headers that describe a single connection rather than the message, so they end at the proxy. */
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

/**
 * The language and the headers that describe the body. The server cache keys a response by nothing
 * else of a request, so no other header may shape what Kirby answers.
 */
const FORWARDED_REQUEST_HEADERS = ['content-type', 'content-length', 'x-language']

export const WITHHELD_RESPONSE_HEADERS = new Set([
  ...HOP_BY_HOP_HEADERS,
  // The body arrives decoded, so its original encoding and length no longer apply.
  'content-encoding',
  'content-length',
  'set-cookie',
  // Both name the software behind the Kirby URL.
  'server',
  'x-powered-by',
])

export interface ProxyRequest {
  url: string
  /** Path below the Kirby URL, with a leading slash. */
  routePath: string
  headers: Record<string, string>
}

export default defineEventHandler(async (event) => {
  const kirby = useRuntimeConfig().kirby as ServerKirbyConfig
  const { url, headers } = resolveProxyRequest(event)
  const { signal } = event.req

  let response
  try {
    response = await fetch(url, {
      method: event.req.method,
      headers,
      body: event.req.body,
      // Node's `fetch` sends a streamed body only with it.
      duplex: 'half',
      // The client decides whether to follow a redirect.
      redirect: 'manual',
      signal,
    } as RequestInit)
  }
  catch (error) {
    // The client is gone, so nobody is left to answer.
    if (signal.aborted)
      return null

    console.error('[nuxt-kirby]', error)
    throw createError({
      status: 502,
      statusText: 'Bad Gateway',
    })
  }

  const responseHeaders = toResponseHeaders(response.headers)
  if (kirby.forwardCookies) {
    for (const cookie of response.headers.getSetCookie())
      responseHeaders.append('set-cookie', cookie)
  }

  return new Response(response.body && endOnAbort(response.body, signal), {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
})

export function toResponseHeaders(headers: Iterable<[string, string]>) {
  const responseHeaders = new Headers()

  for (const [name, value] of headers) {
    if (!WITHHELD_RESPONSE_HEADERS.has(name))
      responseHeaders.append(name, value)
  }

  return responseHeaders
}

/**
 * Runs the checks every forwarded request has to pass and resolves what Kirby is sent: the URL and
 * the headers, with the Kirby credentials among them.
 */
export function resolveProxyRequest(event: RequestEvent): ProxyRequest {
  const runtimeConfig = useRuntimeConfig()
  const kirby = runtimeConfig.kirby as ServerKirbyConfig
  const { path, search } = getRawTarget(event, joinURL(runtimeConfig.app.baseURL, kirby.proxyRoute))

  if (!kirby.url) {
    console.error('[nuxt-kirby] The Kirby URL is missing. Set `NUXT_KIRBY_URL` or the `url` option.')
    throw createError({
      status: 500,
      statusText: 'Kirby URL is missing',
    })
  }

  // A cross-site page could otherwise send requests that carry the visitor's cookie on to Kirby.
  if (kirby.forwardCookies && getRequestHeader(event, 'sec-fetch-site') === 'cross-site') {
    throw createError({
      status: 403,
      statusText: 'Cross-site requests are refused with cookie forwarding',
    })
  }

  if (!isPathBelowBase(path))
    throw pathOutsideBaseError()

  const url = joinURL(kirby.url, path) + search
  const routePath = resolveRoutePath(url, kirby.url)
  if (routePath === undefined)
    throw pathOutsideBaseError()

  if (!isAllowedRoute(kirby.allowedRoutes, routePath, event.req.method)) {
    throw createError({
      status: 403,
      statusText: 'Route is not allowed',
    })
  }

  const headers: Record<string, string> = {}
  for (const name of kirby.forwardCookies
    ? [...FORWARDED_REQUEST_HEADERS, 'cookie']
    : FORWARDED_REQUEST_HEADERS) {
    const value = getRequestHeader(event, name)
    if (value != null)
      headers[name] = value
  }

  return {
    url,
    routePath,
    headers: {
      ...headers,
      ...createAuthHeader(kirby),
    },
  }
}

export function pathOutsideBaseError() {
  return createError({
    status: 400,
    statusText: 'Path must stay below the base URL',
  })
}

/**
 * Reads the path below `prefix` and the query as the client sent them, so the checks and Kirby see
 * every percent-encoding. On Nitro 2 the router's own parameter comes decoded and ends at an encoded `?`.
 */
function getRawTarget(event: RequestEvent, prefix: string) {
  // The URL keeps the encoding as sent and resolves dot segments, `%2E%2E` included, so a path
  // that climbs out of the proxy route no longer starts with it.
  const { pathname, search } = new URL(event.req.url)

  if (pathname !== prefix && !pathname.startsWith(withTrailingSlash(prefix)))
    throw pathOutsideBaseError()

  return {
    path: pathname.slice(prefix.length + 1),
    search,
  }
}
