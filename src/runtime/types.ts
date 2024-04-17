import type { NitroFetchOptions } from 'nitropack'
import type { KirbyQueryRequest } from 'kirby-types'

export type ServerFetchOptions = Pick<
  NitroFetchOptions<string>,
  'query' | 'headers' | 'method' | 'body'
> & {
  // Either fetch a KQL query
  query?: Partial<KirbyQueryRequest>
  // … or from a Kirby path
  path?: string
  cache?: boolean
}
