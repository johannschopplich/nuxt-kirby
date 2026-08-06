import type { KirbyQueryRequest } from 'kirby-types'
import type { NitroFetchOptions } from 'nitropack'

export interface ServerFetchOptions extends Pick<
  NitroFetchOptions<string>,
  'method' | 'headers' | 'query' | 'body'
> {
  query?: Partial<KirbyQueryRequest> // Either a KQL query.
  path?: string // Or a Kirby path.
}
