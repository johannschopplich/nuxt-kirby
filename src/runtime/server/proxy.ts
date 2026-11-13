import type { H3Event } from 'h3'
import type { ServerKirbyConfig } from '../types'
import {
  createError,
  defineEventHandler,
  getRequestHeader,
  getRequestWebStream,
  send,
  setResponseHeader,
  setResponseStatus,
} from 'h3'
import { useRuntimeConfig } from 'nitropack/runtime'
import { getQuery, joinURL, withQuery } from 'ufo'
import { createAuthHeader } from '../utils'
import { assertAllowedRoute, assertPathBelowBase, resolveRoutePath } from './path'
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
  const kirby = useRuntimeConfig(event).kirby as ServerKirbyConfig
  const { url, headers } = resolveProxyRequest(event)

  // A request from inside the app has no socket, and its response stream is handed back unread.
  const abortController = new AbortController()
  if (event.node.res.socket)
    event.node.res.once('close', () => abortController.abort())

  let response
  try {
    response = await globalThis.$fetch.raw<ReadableStream<Uint8Array>>(url, {
      method: event.method,
      headers,
      body: getRequestWebStream(event),
      responseType: 'stream',
      // The client decides whether to follow a redirect.
      redirect: 'manual',
      ignoreResponseError: true,
      signal: abortController.signal,
    })
  }
  catch (error) {
    // The client is gone, so nobody is left to answer.
    if (abortController.signal.aborted)
      return null

    console.error('[nuxt-kirby]', error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Bad Gateway',
    })
  }

  relayResponseHead(event, response)

  const cookies = response.headers.getSetCookie()
  if (kirby.forwardCookies && cookies.length)
    setResponseHeader(event, 'set-cookie', cookies)

  if (!response._data)
    return send(event)

  return event.node.res.socket
    ? endOnAbort(response._data, abortController.signal)
    : response._data
})

export function relayResponseHead(event: H3Event, { status, statusText, headers }: {
  status: number
  statusText: string
  headers: Iterable<[string, string]>
}) {
  setResponseStatus(event, status, statusText)

  for (const [name, value] of headers) {
    if (!WITHHELD_RESPONSE_HEADERS.has(name))
      setResponseHeader(event, name, value)
  }
}

/**
 * Runs the checks every forwarded request has to pass and resolves what Kirby is sent: the URL and
 * the headers, with the Kirby credentials among them.
 */
export function resolveProxyRequest(event: H3Event): ProxyRequest {
  const kirby = useRuntimeConfig(event).kirby as ServerKirbyConfig
  const path = getRawPath(event)

  if (!kirby.url) {
    console.error('[nuxt-kirby] The Kirby URL is missing. Set `NUXT_KIRBY_URL` or the `url` option.')
    throw createError({
      statusCode: 500,
      statusMessage: 'Kirby URL is missing',
    })
  }

  // A cross-site page could otherwise send requests that carry the visitor's cookie on to Kirby.
  if (kirby.forwardCookies && getRequestHeader(event, 'sec-fetch-site') === 'cross-site') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Cross-site requests are refused with cookie forwarding',
    })
  }

  assertPathBelowBase(path)

  const url = withQuery(joinURL(kirby.url, path), getQuery(event.node.req.url!))
  const routePath = resolveRoutePath(url, kirby.url)
  assertAllowedRoute(kirby.allowedRoutes, routePath, event.method)

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

/**
 * Reads the path below the proxy route as the client sent it, so the checks and Kirby see every
 * percent-encoding. The router's own parameter comes decoded and without a trailing slash.
 */
function getRawPath(event: H3Event) {
  // h3 leaves the undecoded request target here, less `app.baseURL`.
  const pathname = event.node.req.url!.split('?', 1)[0]!
  const pathIndex = event.context.matchedRoute!.path.split('/').indexOf('**:path')

  return pathname.split('/').slice(pathIndex).join('/')
}
