import type { KirbyQueryRequest } from 'kirby-types'
import process from 'node:process'
import { addImports, addServerHandler, addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import { defu } from 'defu'
import { join } from 'pathe'
import { pascalCase } from 'scule'
import { withLeadingSlash } from 'ufo'
import { name } from '../package.json'
import { logger } from './kit'
import { prefetchQueries } from './prefetch'

// #region options
export interface ModuleOptions {
  /**
   * Kirby base URL, like `https://kirby.example.com`.
   *
   * @default process.env.KIRBY_BASE_URL
   */
  url?: string

  /**
   * Kirby KQL API endpoint path.
   *
   * @default 'api/kql' for `bearer` authentication, 'api/query' otherwise
   */
  kqlPath?: string

  /**
   * Kirby API authentication method.
   *
   * @default 'basic'
   */
  auth?: 'basic' | 'bearer' | 'none'

  /**
   * Token for bearer authentication.
   *
   * @default process.env.KIRBY_API_TOKEN
   */
  token?: string

  /**
   * Username/password pair for basic authentication.
   *
   * @default { username: process.env.KIRBY_API_USERNAME, password: process.env.KIRBY_API_PASSWORD }
   */
  credentials?: {
    username: string
    password: string
  }

  /**
   * Send client-side requests instead of using the server-side proxy.
   *
   * @remarks
   * By default, data from Kirby is fetched safely with a server-side proxy.
   * If enabled, query requests will be sent directly from the client.
   * Note: This means your token or user credentials will be publicly visible.
   * If Nuxt SSR is disabled, this option is enabled by default.
   *
   * @default false
   */
  client?: boolean

  /**
   * Forward the visitor's cookies to Kirby.
   *
   * @remarks
   * A Kirby session lives in a cookie, so without this a logged-in visitor still receives the
   * logged-out response. Every request that carries a cookie skips the server-side cache, because
   * one stored response is shared between all visitors.
   *
   * Individual calls override this through the `forwardCookies` option of `useKql`, `useKirbyData`,
   * `$kql` and `$kirby`.
   *
   * @default false
   */
  forwardCookies?: boolean

  /**
   * Prefetch custom KQL queries at build-time.
   *
   * @remarks
   * The queries will be fully typed and importable from `#nuxt-kirby`.
   *
   * @default {}
   */
  prefetch?: Record<
    string,
    KirbyQueryRequest | { query: KirbyQueryRequest, language: string }
  >

  server?: {
    /**
     * Enable server-side caching of queries using the Nitro cache API.
     *
     * @see https://nitro.unjs.io/guide/cache
     */
    cache?: boolean

    /**
     * Name of the storage mountpoint to use for caching.
     *
     * @see https://nitro.unjs.io/guide/cache
     * @default 'cache'
     */
    storage?: string

    /**
     * Enable stale-while-revalidate behavior (cache is returned while it is being updated).
     *
     * @see https://nitro.unjs.io/guide/cache#options
     * @default false
     */
    swr?: boolean

    /**
     * Number of seconds to cache the query response.
     *
     * @see https://nitro.unjs.io/guide/cache#options
     * @default 1
     */
    maxAge?: number

    /**
     * Log verbose errors to the console if a query fails.
     *
     * @remarks
     * This will log the full query to the console. Depending on the content of the query, this could be a security risk.
     *
     * @default false
     */
    verboseErrors?: boolean
  }
}
// #endregion options

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    kirby: ModuleOptions
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    configKey: 'kirby',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },
  defaults: {
    url: process.env.KIRBY_BASE_URL || '',
    kqlPath: '',
    auth: 'basic',
    token: process.env.KIRBY_API_TOKEN || '',
    credentials: {
      username: process.env.KIRBY_API_USERNAME || '',
      password: process.env.KIRBY_API_PASSWORD || '',
    },
    client: false,
    forwardCookies: false,
    prefetch: {},
    server: {
      cache: false,
      storage: 'cache',
      swr: false,
      maxAge: 1,
      verboseErrors: false,
    },
  },
  async setup(options, nuxt) {
    const moduleName = name

    if (!options.url)
      logger.error('Missing `KIRBY_BASE_URL` environment variable')

    if (options.auth === 'basic' && (!options.credentials || !options.credentials.username || !options.credentials.password))
      logger.error('Missing `KIRBY_API_USERNAME` and `KIRBY_API_PASSWORD` environment variable for basic authentication')

    if (options.auth === 'bearer' && !options.token)
      logger.error('Missing `KIRBY_API_TOKEN` environment variable for bearer authentication')

    options.kqlPath ||= options.auth === 'bearer' ? 'api/kql' : 'api/query'

    if (!nuxt.options.ssr) {
      logger.info('Kirby requests are client-only because SSR is disabled')
      options.client = true
    }

    if (options.server) {
      // The Nitro storage mountpoint requires a leading slash.
      options.server.storage ||= 'cache'
      options.server.storage = withLeadingSlash(options.server.storage)
    }

    nuxt.options.runtimeConfig.kirby = defu(
      nuxt.options.runtimeConfig.kirby,
      options,
    )

    // Write data to public runtime config if client requests are enabled.
    nuxt.options.runtimeConfig.public.kirby = defu(
      nuxt.options.runtimeConfig.public.kirby as Required<ModuleOptions>,
      options.client
        ? options
        : { client: false },
    )

    const { resolve } = createResolver(import.meta.url)
    nuxt.options.build.transpile.push(resolve('runtime'))

    addServerHandler({
      route: '/api/__kirby__/:key',
      handler: resolve('runtime/server/handler'),
      method: 'post',
    })

    addImports(
      ['$kirby', '$kql', 'useKirbyData', 'useKql'].map(name => ({
        name,
        from: resolve(`runtime/composables/${name}`),
      })),
    )

    nuxt.hooks.hook('nitro:config', (config) => {
      // Inlined because Nitro would otherwise fail to resolve the `utils` import from the server handler.
      config.externals ||= {}
      config.externals.inline ||= []
      config.externals.inline.push(resolve('runtime/utils'))

      config.imports = defu(config.imports, {
        presets: [{
          from: resolve('runtime/server/imports'),
          imports: ['$kirby', '$kql'],
        }],
      })
    })

    nuxt.options.alias[`#${moduleName}`] = join(nuxt.options.buildDir, `module/${moduleName}`)

    const prefetchedQueries = await prefetchQueries(options)

    addTemplate({
      filename: `module/${moduleName}.mjs`,
      write: true,
      getContents() {
        return `
// Generated by ${moduleName}
${[...prefetchedQueries.entries()].map(([key, response]) => `
export const ${key} = ${JSON.stringify(response?.result || null, undefined, 2)}
`.trimStart()).join('') || `export {}\n`}`.trimStart()
      },
    })

    addTemplate({
      filename: `module/${moduleName}.d.ts`,
      write: true,
      getContents() {
        return `
// Generated by ${moduleName}
export type * from 'kirby-types'

${[...prefetchedQueries.entries()].map(([key, response]) => `
export declare const ${key}: ${JSON.stringify(response?.result || null, undefined, 2)}
export type ${pascalCase(key)} = typeof ${key}
`.trimStart()).join('') || `export {}\n`}`.trimStart()
      },
    })
  },
})
