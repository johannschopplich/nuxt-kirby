import type { AsyncData, KeysOf, NuxtError, PickFrom, UseFetchOptions } from 'nuxt/app'
import type { FetchOptions } from 'ofetch'
import type { MaybeRef, MaybeRefOrGetter } from 'vue'
import type { RequestMethod } from '../types'
import { toValue } from 'vue'
import { defineUseFetchAddon } from '#app/composables/addons'
import { createUseFetch } from '#app/composables/fetch'
import { createKirbyFetch } from './$kirby'

/**
 * Copy of the type Nuxt maps its own fetch options through, which it does not export. `headers` stays out of it:
 * Nuxt watches a ref there, but never calls a getter to see a change.
 */
type ComputedOptions<T extends Record<string, any>> = {
  // eslint-disable-next-line ts/no-unsafe-function-type
  [K in keyof T]: T[K] extends Function ? T[K] : ComputedOptions<T[K]> | MaybeRefOrGetter<T[K]>
}

/** Headers in a ref, or a plain record of them with a ref per value, both of which Nuxt unwraps and watches. */
type MaybeRefHeaders<T> = MaybeRef<T> | (T extends Headers | readonly unknown[]
  ? never
  : T extends Record<string, any>
    ? { [K in keyof T]: MaybeRef<T[K]> }
    : never)

/** Nuxt's own `useFetch` options, less those that type the request against the app's server routes or that the module decides. */
export type AsyncDataFetchOptions<ResT, DataT, PickKeys extends KeysOf<DataT>, DefaultT> = Omit<
  UseFetchOptions<ResT, DataT, PickKeys, DefaultT>,
  'baseURL' | '$fetch' | 'method' | 'query' | 'params' | 'body' | 'headers'
> & {
  headers?: MaybeRefHeaders<FetchOptions['headers']>
  /**
   * Language to ask the content in. Each language gets a key of its own.
   *
   * @remarks
   * Travels as the `X-Language` header, which Kirby reads on API routes. Kirby Headless 8.1 also
   * reads it on the global-routes catch-all, but only for a path that names no language itself.
   */
  language?: MaybeRefOrGetter<string | undefined>
}

// #region options
export type UseKirbyDataOptions<
  ResT,
  DataT = ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined,
> = AsyncDataFetchOptions<ResT, DataT, PickKeys, DefaultT>
  & ComputedOptions<{
    method?: RequestMethod
    query?: FetchOptions['query']
    body?: FetchOptions['body']
  }>
// #endregion options

// Nuxt leaves headers out of its key, so the language joins the key as a segment of its own.
const kirbyAddon = defineUseFetchAddon<{ language?: MaybeRefOrGetter<string | undefined> }>({
  key: options => toValue(options.language),
  setup(options) {
    // Resolved per call, where the Nuxt instance is at hand to read the runtime config from.
    options.$fetch = createKirbyFetch() as typeof options.$fetch
  },
})

// Exported only because Nuxt compiles a `createUseFetch` call in an export declaration alone.
export const _useKirbyFetch = createUseFetch({
  addons: [kirbyAddon],
})

export function splitAutoKey<T>(optionsOrKey: T | string | undefined, autoKey: string | undefined): [T | undefined, string | undefined] {
  // Nuxt appends the call-site key right after the last argument given.
  return typeof optionsOrKey === 'string'
    ? [undefined, optionsOrKey]
    : [optionsOrKey, autoKey]
}

export function useKirbyData<
  ResT = any,
  ErrorT = unknown,
  DataT = ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined,
>(
  path: MaybeRefOrGetter<string>,
  arg1?: UseKirbyDataOptions<ResT, DataT, PickKeys, DefaultT> | string,
  arg2?: string,
): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, NuxtError<ErrorT> | undefined> {
  const [opts = {}, autoKey] = splitAutoKey(arg1, arg2)

  return _useKirbyFetch(path, opts as UseFetchOptions<unknown>, autoKey) as AsyncData<PickFrom<DataT, PickKeys> | DefaultT, NuxtError<ErrorT> | undefined>
}
