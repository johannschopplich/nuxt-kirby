import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-types'
import type { AsyncData, KeysOf, NuxtError, PickFrom, UseFetchOptions } from 'nuxt/app'
import type { MaybeRefOrGetter } from 'vue'
import type { AsyncDataFetchOptions } from './useKirbyData'
import { computed, toValue } from 'vue'
import { useRuntimeConfig } from '#imports'
import { _useKirbyFetch, splitAutoKey } from './useKirbyData'

// #region options
export type UseKqlOptions<
  ResT,
  DataT = ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined,
> = AsyncDataFetchOptions<ResT, DataT, PickKeys, DefaultT>
// #endregion options

export function useKql<
  ResT extends KirbyQueryResponse<any, boolean> = KirbyQueryResponse,
  ReqT extends KirbyQueryRequest = KirbyQueryRequest,
  ErrorT = unknown,
  DataT = ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined,
>(
  query: MaybeRefOrGetter<ReqT>,
  arg1?: UseKqlOptions<ResT, DataT, PickKeys, DefaultT> | string,
  arg2?: string,
): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, NuxtError<ErrorT> | undefined> {
  const [opts = {}, autoKey] = splitAutoKey(arg1, arg2)

  return _useKirbyFetch(useRuntimeConfig().public.kirby.kqlPath, {
    ...opts,
    method: 'POST',
    // Nuxt hashes the body into the key, so each query gets an entry of its own and a new query refetches.
    body: computed(() => toValue(query)),
  } as UseFetchOptions<unknown, unknown, KeysOf<unknown>, undefined, string, 'POST'>, autoKey) as AsyncData<PickFrom<DataT, PickKeys> | DefaultT, NuxtError<ErrorT> | undefined>
}
