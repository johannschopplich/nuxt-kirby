import type { RouterMethod } from 'h3'
import type { NitroFetchOptions } from 'nitropack'

export const AUTH_METHODS = ['basic', 'bearer', 'none'] as const

export type KirbyAuth = typeof AUTH_METHODS[number]

export type RequestMethod = Uppercase<RouterMethod> | RouterMethod

export interface AllowedRoute {
  /** Pathname below the Kirby URL, where `*` matches one segment and a trailing `**` any number of them. */
  path: string
  /** Methods the route accepts; all of them when omitted. */
  methods?: RequestMethod[]
}

export interface BasicCredentials {
  username: string
  password: string
}

// #region kirby-fetch-options
export type KirbyFetchOptions = Omit<NitroFetchOptions<string>, 'baseURL'> & {
  /**
   * Language to ask the content in.
   *
   * @remarks
   * Travels as the `X-Language` header, which Kirby reads on API routes. Kirby Headless 8.1 also
   * reads it on the global-routes catch-all, but only for a path that names no language itself.
   */
  language?: string
}
// #endregion kirby-fetch-options

// #region kql-options
export type KqlOptions = Omit<KirbyFetchOptions, 'method' | 'body' | 'query' | 'params'>
// #endregion kql-options

/** The private runtime config, which `NUXT_KIRBY_*` variables override. */
export interface ServerKirbyConfig {
  url: string
  kqlPath: string
  auth: KirbyAuth
  token: string
  credentials: BasicCredentials
  forwardCookies: boolean
  allowedRoutes: AllowedRoute[]
  server: {
    cache: boolean
    storage: string
    swr: boolean
    maxAge: number
  }
}

/**
 * The public runtime config, which `NUXT_PUBLIC_KIRBY_*` variables override. The URL and the
 * credentials are published in client mode only.
 */
export interface PublicKirbyConfig {
  client: boolean
  kqlPath: string
  url?: string
  auth?: KirbyAuth
  token?: string
  credentials?: BasicCredentials
}
