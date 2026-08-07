import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-types'
import type { NitroFetchOptions } from 'nitropack'
import type { AsyncData, AsyncDataOptions, NuxtError } from 'nuxt/app'
import type { MaybeRefOrGetter, MultiWatchSources } from 'vue'
import { hash } from 'ohash'
import { computed, toValue } from 'vue'
import { useFetch } from '#imports'
import { sendKqlRequest } from './$kql'

// #region options
export type UseKqlOptions<T> = Omit<AsyncDataOptions<T>, 'watch'> & Pick<
  NitroFetchOptions<string>,
  | 'onRequest'
  | 'onRequestError'
  | 'onResponse'
  | 'onResponseError'
  | 'headers'
  | 'retry'
  | 'retryDelay'
  | 'retryStatusCodes'
> & {
  /**
   * Language code to fetch data for in multi-language Kirby setups.
   */
  language?: MaybeRefOrGetter<string>
  /**
   * Watch an array of reactive sources and auto-refresh the fetch result when they change.
   * Query and language are watched by default. You can completely ignore reactive sources by using `watch: false`.
   */
  watch?: MultiWatchSources | false
}
// #endregion options

export function useKql<
  ResT extends KirbyQueryResponse<any, boolean> = KirbyQueryResponse,
  ReqT extends KirbyQueryRequest = KirbyQueryRequest,
>(query: MaybeRefOrGetter<ReqT>, opts: UseKqlOptions<ResT> = {}) {
  const { language, ...fetchOptions } = opts

  const _query = computed(() => toValue(query))
  const _language = computed(() => toValue(language))
  const key = computed(() => `$kql${hash([_query.value, _language.value])}`)

  if (Object.keys(_query.value).length === 0 || !_query.value.query)
    console.error('[nuxt-kirby] Empty KQL query')

  // A KQL request has no path of its own, so the key stands in as the request identity.
  return useFetch(key, {
    ...fetchOptions,
    key,
    $fetch: ((_request: string, options) => sendKqlRequest(_query.value, {
      ...options,
      language: _language.value,
      key: key.value,
    })) as typeof globalThis.$fetch,
  }) as AsyncData<ResT | undefined, NuxtError>
}
