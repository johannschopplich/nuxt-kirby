import type { $Fetch, ResponseType } from 'ofetch'
import type { MaybeRefOrGetter } from 'vue'
import type { KirbyFetchOptions } from '../types'
import { joinURL } from 'ufo'
import { toValue } from 'vue'
import { proxyRoute } from '#build/module/nuxt-kirby.config'
import { useNuxtApp, useRequestEvent, useRequestHeaders, useRuntimeConfig } from '#imports'
import { assertPathBelowBase } from '../server/path'
import { createAuthHeader, createLanguageHeader, mergeHeaders } from '../utils'

let hasWarnedAboutHydration = false

export function $kirby<T = any>(
  path: string,
  opts: KirbyFetchOptions = {},
): Promise<T> {
  warnAboutHydration('$kirby', 'useKirbyData')

  return createKirbyFetch()<T>(path, opts)
}

/** Warns once when a request is sent while the page hydrates, where the server may have sent it already. */
export function warnAboutHydration(functionName: string, composableName: string) {
  if (!import.meta.dev || !import.meta.client || hasWarnedAboutHydration)
    return

  const nuxt = useNuxtApp()

  // Without a server render, no request was sent before this one.
  if (nuxt.isHydrating && nuxt.payload.serverRendered) {
    hasWarnedAboutHydration = true
    console.warn(`[nuxt-kirby] \`${functionName}\` sent a request during hydration. If the server sent it as well while rendering the page, wrap the call in \`useAsyncData\` or use \`${composableName}\` to reuse the server's response.`)
  }
}

export function createKirbyFetch() {
  const runtimeConfig = useRuntimeConfig()
  const kirby = runtimeConfig.public.kirby

  const baseURL = kirby.client
    ? kirby.url!
    : joinURL(runtimeConfig.app.baseURL, proxyRoute)

  // Typed as plain ofetch: Kirby's paths are not the app's routes that Nuxt's typed fetch checks against.
  const kirbyFetch = globalThis.$fetch as $Fetch
  const requestEvent = import.meta.server && !kirby.client
    ? useRequestEvent()
    : undefined
  // During SSR, the server proxy is called in-process and sees only what it is handed, and forwards
  // the cookie only with `forwardCookies`.
  const visitorHeaders = requestEvent
    ? useRequestHeaders(['cookie']) as Record<string, string>
    : {}

  return async function <T = any>(
    path: string,
    opts: Omit<KirbyFetchOptions, 'language'> & { language?: MaybeRefOrGetter<string | undefined> } = {},
  ) {
    const { language, headers, ...fetchOptions } = opts

    // Joining keeps the request on the Kirby host, but not below the Kirby URL. Without client
    // mode, the server proxy runs the check.
    if (kirby.client)
      assertPathBelowBase(path)

    // During SSR, the proxy is called in-process, where nothing derives the content type from a form or
    // `Blob` body as `fetch` does on the wire, a multipart boundary included.
    const encodedBody = requestEvent && (fetchOptions.body instanceof FormData || fetchOptions.body instanceof URLSearchParams || fetchOptions.body instanceof Blob)
      ? new Response(fetchOptions.body)
      : undefined

    return kirbyFetch<T, ResponseType>(joinURL(baseURL, path), {
      ...fetchOptions,
      headers: mergeHeaders(
        visitorHeaders,
        encodedBody?.headers,
        headers,
        createLanguageHeader(toValue(language)),
        kirby.client
          ? createAuthHeader(kirby)
          : undefined,
      ),
      ...(encodedBody && {
        body: new Uint8Array(await encodedBody.arrayBuffer()),
      }),
      // Hands the proxy the page request's platform bindings, such as `event.context.cloudflare`, as `useRequestFetch` does.
      ...(requestEvent && { context: requestEvent.context }),
      // Without it, `$fetch` would prepend `app.baseURL`.
      baseURL: '',
    }) as Promise<T>
  }
}
