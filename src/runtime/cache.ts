import { useNuxtApp } from '#imports'

/**
 * Sends the request unless an identical one is already in flight, or – with `payloadCache` – has
 * already put its response into the Nuxt payload.
 */
export function sendCachedRequest<T>(
  key: string,
  payloadCache: boolean,
  send: () => Promise<T>,
): Promise<T> {
  const nuxt = useNuxtApp()
  const pendingRequests = (nuxt._pendingRequests ||= new Map()) as Map<string, Promise<T>>

  if (payloadCache && nuxt.payload.data[key])
    return Promise.resolve(nuxt.payload.data[key])

  const pendingRequest = pendingRequests.get(key)
  if (pendingRequest)
    return pendingRequest

  const request = send()
    .then((response) => {
      if (payloadCache)
        nuxt.payload.data[key] = response
      return response
    })
    .catch((error) => {
      // A failed response must not stay in the payload, where the next call would resolve from it.
      if (payloadCache)
        nuxt.payload.data[key] = undefined
      throw error
    })
    .finally(() => {
      pendingRequests.delete(key)
    }) as Promise<T>

  pendingRequests.set(key, request)

  return request
}
