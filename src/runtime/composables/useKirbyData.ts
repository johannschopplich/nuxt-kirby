import type { NitroFetchOptions } from 'nitropack'
import type { AsyncData, AsyncDataOptions, NuxtError } from 'nuxt/app'
import type { MaybeRefOrGetter, MultiWatchSources } from 'vue'
import { hash } from 'ohash'
import { computed, toValue } from 'vue'
import { useFetch } from '#imports'
import { sendKirbyRequest } from './$kirby'

// #region options
export type UseKirbyDataOptions<T> = Omit<AsyncDataOptions<T>, 'watch'> & Pick<
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
> & {
  /**
   * Language code to fetch data for in multi-language Kirby setups.
   *
   * @remarks
   * Travels as the `X-Language` header, which Kirby reads on API routes. Kirby Headless 8.1 also
   * reads it on the global-routes catch-all, but only for a path that names no language itself.
   */
  language?: MaybeRefOrGetter<string>
  /**
   * Forward the visitor's cookies to Kirby, overriding the module's `forwardCookies`.
   *
   * @remarks
   * Such a request never reads from or writes to the server-side cache, since one stored response
   * is shared between all visitors.
   */
  forwardCookies?: boolean
  /**
   * Watch an array of reactive sources and auto-refresh the fetch result when they change.
   * Path and language are watched by default. You can completely ignore reactive sources by using `watch: false`.
   */
  watch?: MultiWatchSources | false
}
// #endregion options

export function useKirbyData<T = any>(
  path: MaybeRefOrGetter<string>,
  opts: UseKirbyDataOptions<T> = {},
) {
  const { language, forwardCookies, ...fetchOptions } = opts

  const _language = computed(() => toValue(language))
  const _path = computed(() => toValue(path).replace(/^\//, ''))
  const key = computed(() => `$kirby${hash([
    _path.value,
    _language.value,
    toValue(fetchOptions.query),
    toValue(fetchOptions.method),
    toValue(fetchOptions.body),
  ])}`)

  if (!_path.value)
    console.warn('[nuxt-kirby] Empty Kirby path')

  return useFetch(_path, {
    ...fetchOptions,
    key,
    $fetch: ((_request: string, options) => sendKirbyRequest(_path.value, {
      ...options,
      language: _language.value,
      forwardCookies,
      key: key.value,
    })) as typeof globalThis.$fetch,
  }) as AsyncData<T | undefined, NuxtError>
}
