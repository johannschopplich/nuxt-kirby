import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-types'
import type { KqlOptions } from '../types'
import { useRuntimeConfig } from '#imports'
import { createKirbyFetch, warnAboutHydration } from './$kirby'

export function $kql<T extends KirbyQueryResponse<any, boolean> = KirbyQueryResponse>(
  query: KirbyQueryRequest,
  opts: KqlOptions = {},
): Promise<T> {
  warnAboutHydration('$kql', 'useKql')

  return createKirbyFetch()<T>(useRuntimeConfig().public.kirby.kqlPath, {
    ...opts,
    method: 'POST',
    body: query,
  })
}
