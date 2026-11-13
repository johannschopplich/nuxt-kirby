import type { KirbyQueryRequest } from 'kirby-types'
import type { NitroFetchOptions } from 'nitropack'
import type { ModuleOptions } from '../module'

/** The module options without `prefetch`, which only the build reads. */
export type ServerKirbyConfig = Omit<Required<ModuleOptions>, 'prefetch'>

/** The fields published in client mode; without it, only `client` is. */
export type PublicKirbyConfig = Pick<Required<ModuleOptions>, 'url' | 'kqlPath' | 'auth' | 'forwardCookies'>
  & Pick<ModuleOptions, 'token' | 'credentials'>
  & { client: boolean }

export interface ServerFetchOptions extends Pick<
  NitroFetchOptions<string>,
  'method' | 'headers' | 'query' | 'body'
> {
  /** A request carries one or the other: `query` for KQL, `path` for the REST API. */
  query?: Partial<KirbyQueryRequest>
  path?: string
  /** Overrides the module's `forwardCookies` for this request. Absent leaves the decision to it. */
  forwardCookies?: boolean
}

export interface ServerFetchRequest extends ServerFetchOptions {
  isQueryRequest: boolean
}
