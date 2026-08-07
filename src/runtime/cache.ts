import { useNuxtApp } from '#imports'

/**
 * Sends the request unless an identical one is already in flight, or has already put its response
 * into the Nuxt payload.
 *
 * @remarks
 * `payloadCache` decides what happens within one environment. Across the two, the payload is the
 * only way an SSR response reaches the client, so the server always writes and the hydrating client
 * always reads – otherwise turning the option off would cost every request a second round trip in
 * the browser.
 */
export function sendCachedRequest<T>(
  requestKey: string,
  payloadCache: boolean,
  send: () => Promise<T>,
): Promise<T> {
  const nuxt = useNuxtApp()
  const pendingRequests = (nuxt._pendingRequests ||= new Map()) as Map<string, Promise<T>>
  const cachesPayload = import.meta.server || payloadCache

  // `useKql` and `useKirbyData` hand Nuxt the request key as their async data key, and what they
  // store under it has been through their own `transform`.
  const key = `raw:${requestKey}`

  if ((nuxt.isHydrating || payloadCache) && nuxt.payload.data[key])
    return Promise.resolve(nuxt.payload.data[key])

  const pendingRequest = pendingRequests.get(key)
  if (pendingRequest)
    return pendingRequest

  const request = send()
    .then((response) => {
      if (cachesPayload)
        nuxt.payload.data[key] = response
      return response
    })
    .catch((error) => {
      // A failed response must not stay in the payload, where the next call would resolve from it.
      if (cachesPayload)
        nuxt.payload.data[key] = undefined
      throw error
    })
    .finally(() => {
      pendingRequests.delete(key)
    }) as Promise<T>

  pendingRequests.set(key, request)

  return request
}
