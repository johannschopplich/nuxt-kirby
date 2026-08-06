import type { KirbyQueryRequest } from 'kirby-types'
import type { NitroFetchOptions } from 'nitropack'

export interface ServerFetchOptions extends Pick<
  NitroFetchOptions<string>,
  'method' | 'headers' | 'query' | 'body'
> {
  /** A request carries one or the other: `query` for KQL, `path` for the REST API. */
  query?: Partial<KirbyQueryRequest>
  path?: string
}
