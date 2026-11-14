import type { RequestEvent } from 'nuxt/server'
import type { ServerRequest } from 'ocache'
import type { ServerKirbyConfig } from '../types'
import type { ProxyRequest } from './proxy'
import { destr } from 'destr'
import { createError, defineEventHandler, useRuntimeConfig } from 'nuxt/server'
import { defineCachedFunction } from 'ocache'
import { hash } from 'ohash'
import { withLeadingSlash, withoutTrailingSlash } from 'ufo'
import { useCacheStorage } from '#nuxt-kirby-cache-storage'
import proxy, { resolveProxyRequest, toResponseHeaders, WITHHELD_RESPONSE_HEADERS } from './proxy'

interface CachedRequest extends Pick<ProxyRequest, 'url' | 'headers'> {
  method: 'GET' | 'POST'
  body: string | undefined
}

interface CachedResponse {
  status: number
  statusText: string
  headers: [string, string][]
  body: Uint8Array<ArrayBuffer>
}

// ocache keeps the map of requests it already has in flight inside this closure, so a fresh instance
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

  // ocache hands its cache writes to the request's `waitUntil()`, which Nitro 2 keeps in the context.
  // Without it an edge worker is torn down before the entry reaches storage.
  const request = event.req as ServerRequest
  request.waitUntil ??= event.context.waitUntil as ServerRequest['waitUntil']

  cachedFetcher ??= createCachedFetcher(kirby)
  const body = method === 'POST'
    ? await event.req.text()
    : undefined
  const response = await cachedFetcher(event, { method, url, headers, body }).catch((error) => {
    // ocache gives up on Kirby after its `maxResolveTime` and rejects every caller of the key.
    if (error instanceof Error && error.name === 'TimeoutError') {
      console.error('[nuxt-kirby]', error)
      throw createError({
        status: 504,
        statusText: 'Gateway Timeout',
      })
    }
    throw error
  })

  // A `Response` refuses any body, even an empty one, for a null-body status like 204.
  return new Response(response.body.byteLength
    ? response.body
    : null, {
    status: response.status,
    statusText: response.statusText,
    headers: toResponseHeaders(response.headers),
  })
})

function createCachedFetcher(kirby: ServerKirbyConfig) {
  return defineCachedFunction(
    // ocache reads the event from the first argument only.
    (_event: RequestEvent, request: CachedRequest) => fetchFromKirby(request),
    {
      name: 'nuxt-kirby',
      storage: useCacheStorage,
      base: kirby.server.storage,
      // The body is stored as bytes rather than inside the JSON of the entry.
      payload: 'value.body',
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
  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      redirect: 'manual',
    })

    return {
      status: response.status,
      statusText: response.statusText,
      // A stored `set-cookie` would put Kirby's session in the shared store.
      headers: [...response.headers].filter(([name]) => !WITHHELD_RESPONSE_HEADERS.has(name)),
      body: new Uint8Array(await response.arrayBuffer()),
    }
  }
  catch (error) {
    console.error('[nuxt-kirby]', error)
    throw createError({
      status: 502,
      statusText: 'Bad Gateway',
    })
  }
}
