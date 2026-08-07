import type { H3Event } from 'h3'
import type { ModuleOptions } from '../../module'
import type { ServerFetchOptions } from '../types'
import { consola } from 'consola'
import { destr } from 'destr'
import { createError, defineEventHandler, getRouterParam, readBody, setResponseHeader, setResponseStatus, splitCookiesString } from 'h3'
import { defineCachedFunction } from 'nitropack/runtime'
import { hash } from 'ohash'
import { base64ToUint8Array, uint8ArrayToBase64, uint8ArrayToString } from 'uint8array-extras'
import { useRuntimeConfig } from '#imports'
import { createAuthHeader } from '../utils'

const EXCLUDED_HEADERS = new Set([
  // https://github.com/h3js/h3/blob/fe9800bbbe9bda2972cc5d11db7353f4ab70f0ba/src/utils/proxy.ts#L97
  'content-encoding',
  'content-length',
  // Reduce information leakage.
  'server',
  'x-powered-by',
])

export default defineEventHandler(async (event) => {
  const kirby = useRuntimeConfig(event).kirby as Required<ModuleOptions>
  const body = await readBody<ServerFetchOptions>(event)
  const key = decodeURIComponent(getRouterParam(event, 'key')!)
  const isQueryRequest = key.startsWith('$kql')

  // Always give `event` as first argument to make sure cached functions
  // are working as expected in edge workers.
  const fetcher = async (event: H3Event, {
    isQueryRequest,
    query,
    path,
    headers,
    method,
    body,
  }: { isQueryRequest: boolean } & ServerFetchOptions) => {
    const response = await globalThis.$fetch.raw<ArrayBuffer>(isQueryRequest ? kirby.kqlPath : path!, {
      responseType: 'arrayBuffer',
      ignoreResponseError: true,
      baseURL: kirby.url,
      ...(isQueryRequest
        ? {
            method: 'POST',
            body: query,
          }
        : {
            method,
            query,
            body,
          }),
      headers: {
        ...headers,
        ...createAuthHeader(kirby),
      },
    })

    const dataArray = new Uint8Array(response._data ?? [])
    const data = uint8ArrayToBase64(dataArray)

    return {
      status: response.status,
      statusText: response.statusText,
      headers: [...response.headers.entries()],
      data,
    }
  }

  const cachedFetcher = defineCachedFunction(fetcher, {
    name: 'nuxt-kirby',
    base: kirby.server.storage,
    swr: kirby.server.swr,
    maxAge: kirby.server.maxAge,
    // The key stands for the request, so the server derives it from the request.
    // Reading the caller's `key` instead would let one visitor place a response
    // of their choosing under the key another visitor reads.
    getKey: (event: H3Event, options: { isQueryRequest: boolean } & ServerFetchOptions) => hash(options),
  })

  if (isQueryRequest) {
    if (!body.query?.query) {
      throw createError({
        statusCode: 400,
        statusMessage: 'KQL query is empty',
      })
    }
  }
  else {
    // Check if the path is an absolute URL.
    if (body.path && new URL(body.path, 'http://localhost').origin !== 'http://localhost') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Absolute URLs are not allowed',
      })
    }
  }

  try {
    const response = kirby.server.cache
      ? await cachedFetcher(event, { isQueryRequest, ...body })
      : await fetcher(event, { isQueryRequest, ...body })

    const dataArray = base64ToUint8Array(response.data)

    if (response.status >= 400 && response.status < 600) {
      if (isQueryRequest) {
        consola.error(`Failed KQL query "${body.query?.query}" (...) with status code ${response.status}:\n`, destr(
          uint8ArrayToString(dataArray),
        ))
        if (kirby.server.verboseErrors)
          consola.log('Full KQL query request:', body.query)
      }
      else {
        consola.error(`Failed ${(body.method || 'get').toUpperCase()} request to "${body.path}"`)
      }
    }

    const cookies: string[] = []

    for (const [key, value] of response.headers) {
      if (EXCLUDED_HEADERS.has(key))
        continue

      if (key === 'set-cookie') {
        cookies.push(...splitCookiesString(value))
        continue
      }

      setResponseHeader(event, key, value)
    }

    if (cookies.length > 0)
      setResponseHeader(event, 'set-cookie', cookies)

    setResponseStatus(event, response.status, response.statusText)
    return dataArray
  }
  catch (error) {
    consola.error(error)

    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
    })
  }
})
