import type { NitroFetchOptions } from 'nitropack'
import type { AsyncData, AsyncDataOptions, NuxtError } from 'nuxt/app'
import type { MaybeRefOrGetter, MultiWatchSources } from 'vue'
import { useAsyncData } from '#imports'
import { hash } from 'ohash'
import { joinURL } from 'ufo'
import { computed, toValue } from 'vue'
import { $kirby } from './$kirby'

// #region options
type UseKirbyDataOptions<T> = Omit<AsyncDataOptions<T>, 'watch'> & Pick<
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
  | 'timeout'
> & {
  /**
   * Language code to fetch data for in multi-language Kirby setups.
   */
  language?: MaybeRefOrGetter<string>
  /**
   * Cache the response between function calls for the same path.
   * @default true
   */
  cache?: boolean
  /**
   * Watch an array of reactive sources and auto-refresh the fetch result when they change.
   * Path and language are watched by default. You can completely ignore reactive sources by using `watch: false`.
   * @default undefined
   */
  watch?: MultiWatchSources | false
}
// #endregion options

export function useKirbyData<T = any>(
  path: MaybeRefOrGetter<string>,
  opts: UseKirbyDataOptions<T> = {},
) {
  const {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    watch: watchSources,
    immediate,
    method,
    headers,
    query,
    body,
    language,
    cache = true,
    ...fetchOptions
  } = opts

  const _language = computed(() => toValue(language))
  const _path = computed(() => {
    const value = toValue(path).replace(/^\//, '')
    return _language.value ? joinURL(_language.value, value) : value
  })
  const key = computed(() => `$kirby${hash([
    _path.value,
    query,
    method,
  ])}`)

  if (!_path.value || (_language.value && !_path.value.replace(new RegExp(`^${_language.value}/`), '')))
    console.warn('[useKirbyData] Empty Kirby path')

  const asyncDataOptions: AsyncDataOptions<T> = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    watch: watchSources === false ? [] : [...(watchSources || []), key],
    immediate,
  }

  let controller: AbortController | undefined

  return useAsyncData<T, unknown>(
    watchSources === false ? key.value : key,
    () => {
      controller?.abort?.()
      controller = new AbortController()

      return $kirby(_path.value, {
        ...fetchOptions,
        method,
        headers,
        query,
        body,
        signal: controller.signal,
        language: _language.value,
        cache,
        key: key.value,
      })
    },
    asyncDataOptions,
  ) as AsyncData<T | undefined, NuxtError>
}
