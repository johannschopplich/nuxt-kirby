import type { RequestEvent } from 'nuxt/server'
import type { ServerKirbyConfig } from '../types'
import type { ProxyRequest } from './proxy'
import { destr } from 'destr'
import { defineCachedFunction } from 'nitropack/runtime'
import { createError, defineEventHandler, useRuntimeConfig } from 'nuxt/server'
import { hash } from 'ohash'
import { withLeadingSlash, withoutTrailingSlash } from 'ufo'
import { base64ToUint8Array, uint8ArrayToBase64 } from 'uint8array-extras'
import proxy, { resolveProxyRequest, toResponseHeaders, WITHHELD_RESPONSE_HEADERS } from './proxy'

interface CachedRequest extends Pick<ProxyRequest, 'url' | 'headers'> {
  method: 'GET' | 'POST'
  body: string | undefined
}

interface CachedResponse {
  status: number
  statusText: string
  headers: [string, string][]
  /** Base64, so that a binary body survives a storage driver that holds JSON. */
  data: string
}

const NULL_BODY_STATUSES = new Set([101, 204, 205, 304])

// Nitro keeps the map of requests it already has in flight inside this closure, so a fresh instance
// per request would send every concurrent caller of one cold key on to Kirby.
let cachedFetcher: ReturnType<typeof createCachedFetcher> | undefined

export default defineEventHandler(async (event) => {
  const kirby = useRuntimeConfig().kirby as ServerKirbyConfig
  const { method } = event.req

  // The cache key cannot see the visitor's cookie, so with cookie forwarding nothing reads from or
  // writes to the shared store.
  if (!kirby.server.cache || kirby.forwardCookies || (method !== 'GET' && method !== 'POST'))
    return proxy(event)

  const { url, routePath, headers } = resolveProxyRequest(event)
  const isKqlQuery = withoutTrailingSlash(routePath) === withLeadingSlash(withoutTrailingSlash(kirby.kqlPath))

  if (method === 'POST' && !isKqlQuery)
    return proxy(event)

  cachedFetcher ??= createCachedFetcher(kirby)
  const response = await cachedFetcher(event, {
    method,
    url,
    headers,
    body: method === 'POST'
      ? await event.req.text()
      : undefined,
  })

  // A `Response` refuses any body, even an empty one, for these statuses.
  return new Response(NULL_BODY_STATUSES.has(response.status)
    ? null
    : base64ToUint8Array(response.data), {
    status: response.status,
    statusText: response.statusText,
    headers: toResponseHeaders(response.headers),
  })
})

function createCachedFetcher(kirby: ServerKirbyConfig) {
  return defineCachedFunction(
    // Nitro reads the event from the first argument only, and hands the cache write to
    // `event.waitUntil()` – without it an edge worker is torn down before the entry reaches storage.
    (_event: RequestEvent, request: CachedRequest) => fetchFromKirby(request),
    {
      name: 'nuxt-kirby',
      base: kirby.server.storage,
      swr: kirby.server.swr,
      maxAge: kirby.server.maxAge,
      // The credentials are the same for every request, so they add nothing to the key.
      getKey: (_event: RequestEvent, { method, url, headers, body }: CachedRequest) => hash([
        method,
        url,
        headers['x-language'],
        // Two spellings of one query share an entry.
        destr(body),
      ]),
      // A 404 or 410 is stored, so that with `swr` a page Kirby no longer has replaces the stored one.
      // Any other error would answer every visitor for as long as the entry lives.
      validate: entry => entry.value !== undefined && (entry.value.status < 400 || entry.value.status === 404 || entry.value.status === 410),
    },
  )
}

async function fetchFromKirby({ method, url, headers, body }: CachedRequest): Promise<CachedResponse> {
  let response
  try {
    response = await globalThis.$fetch.raw<ArrayBuffer>(url, {
      method,
      headers,
      body,
      responseType: 'arrayBuffer',
      redirect: 'manual',
      ignoreResponseError: true,
    })
  }
  catch (error) {
    console.error('[nuxt-kirby]', error)
    throw createError({
      status: 502,
      statusText: 'Bad Gateway',
    })
  }

  return {
    status: response.status,
    statusText: response.statusText,
    // A stored `set-cookie` would put Kirby's session in the shared store.
    headers: [...response.headers].filter(([name]) => !WITHHELD_RESPONSE_HEADERS.has(name)),
    data: uint8ArrayToBase64(new Uint8Array(response._data ?? [])),
  }
}
