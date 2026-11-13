import type { AllowedRoute, BasicCredentials, KirbyAuth, PublicKirbyConfig, ServerKirbyConfig } from './runtime/types'
import process from 'node:process'
import { addImports, addServerHandler, addServerImports, addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import { defu } from 'defu'
import { join, relative } from 'pathe'
import { joinURL, withLeadingSlash } from 'ufo'
import { name } from '../package.json'
import { logger } from './kit'
import { assertValidOptions } from './options'

// #region options
export interface ModuleOptions {
  /**
   * URL of the Kirby instance, like `https://kirby.example.com`.
   *
   * @remarks
   * `NUXT_KIRBY_URL` overrides it at runtime, in client mode `NUXT_PUBLIC_KIRBY_URL`.
   *
   * @default process.env.NUXT_KIRBY_URL
   */
  url?: string

  /**
   * Path of the KQL endpoint below the Kirby URL.
   *
   * @remarks
   * The default allowed routes and the composables take it from the build, so a
   * `NUXT_KIRBY_KQL_PATH` set at runtime splits the paths.
   *
   * @default 'api/kql' for `bearer` authentication, 'api/query' otherwise
   */
  kqlPath?: string

  /**
   * How requests authenticate with the Kirby instance.
   *
   * @remarks
   * The default `kqlPath` follows it at build time, so a `NUXT_KIRBY_AUTH` set at runtime leaves
   * KQL queries on the build's path.
   *
   * @default 'basic'
   */
  auth?: KirbyAuth

  /**
   * Token for bearer authentication.
   *
   * @remarks
   * `NUXT_KIRBY_TOKEN` overrides it at runtime, in client mode `NUXT_PUBLIC_KIRBY_TOKEN`.
   *
   * @default process.env.NUXT_KIRBY_TOKEN
   */
  token?: string

  /**
   * Username and password for basic authentication.
   *
   * @remarks
   * `NUXT_KIRBY_CREDENTIALS_USERNAME` and `NUXT_KIRBY_CREDENTIALS_PASSWORD` override them at
   * runtime, in client mode `NUXT_PUBLIC_KIRBY_CREDENTIALS_USERNAME` and
   * `NUXT_PUBLIC_KIRBY_CREDENTIALS_PASSWORD`.
   *
   * @default { username: process.env.NUXT_KIRBY_CREDENTIALS_USERNAME, password: process.env.NUXT_KIRBY_CREDENTIALS_PASSWORD }
   */
  credentials?: BasicCredentials

  /**
   * Whether every request goes straight to Kirby, from the browser and during SSR, instead of
   * through the server proxy.
   *
   * @remarks
   * Client mode publishes the Kirby URL and credentials to the browser. Turn it on only for an
   * instance whose credentials may be public, or one that needs none.
   *
   * An explicit `false` holds even with SSR disabled; the default flips there because a
   * client-rendered app often has no server to proxy through.
   *
   * @default false, or true if Nuxt SSR is disabled and neither `forwardCookies`, `allowedRoutes` nor `server.cache` is set
   */
  client?: boolean

  /**
   * Whether the server proxy forwards the visitor's cookie to Kirby and, on a request the browser
   * sends, Kirby's cookies back to the visitor.
   *
   * @remarks
   * A Kirby session lives in a cookie, so without this a logged-in visitor still receives the
   * logged-out response. Turning it on turns the server cache off – one stored response is shared
   * between all visitors – and makes the server proxy refuse requests the browser marks
   * cross-site.
   *
   * @default false
   */
  forwardCookies?: boolean

  /**
   * Routes the server proxy may forward. It refuses every request that matches none.
   *
   * @remarks
   * A list of your own replaces the default, so it has to name the KQL path for KQL queries to
   * pass.
   *
   * @default [{ path: '**', methods: ['GET', 'HEAD'] }, { path: kqlPath, methods: ['POST'] }]
   */
  allowedRoutes?: AllowedRoute[]

  server?: {
    /**
     * Whether KQL queries and `GET` requests are answered from the server cache.
     *
     * @see https://v2.nitro.build/guide/cache
     */
    cache?: boolean

    /**
     * Name of the storage mountpoint to use for caching.
     *
     * @see https://v2.nitro.build/guide/cache
     * @default 'cache'
     */
    storage?: string

    /**
     * Enable stale-while-revalidate behavior (cache is returned while it is being updated).
     *
     * @see https://v2.nitro.build/guide/cache#options
     * @default false
     */
    swr?: boolean

    /**
     * Number of seconds a response stays in the server cache.
     *
     * @see https://v2.nitro.build/guide/cache#options
     * @default 1
     */
    maxAge?: number
  }
}
// #endregion options

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    kirby: ServerKirbyConfig
  }

  interface PublicRuntimeConfig {
    kirby: PublicKirbyConfig
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    configKey: 'kirby',
    compatibility: {
      // The server proxy is written for Nitro 2, which Nuxt 5 replaces.
      nuxt: '>=4.6.0 <5',
    },
  },
  // Nuxt applies a `NUXT_KIRBY_*` variable to the runtime config only once the server runs. Read here
  // as well, a variable set for the build alone reaches a server that is deployed without it.
  defaults: () => ({
    url: process.env.NUXT_KIRBY_URL || '',
    kqlPath: '',
    auth: 'basic',
    token: process.env.NUXT_KIRBY_TOKEN || '',
    credentials: {
      username: process.env.NUXT_KIRBY_CREDENTIALS_USERNAME || '',
      password: process.env.NUXT_KIRBY_CREDENTIALS_PASSWORD || '',
    },
    // Left unset, so that an explicit `false` survives `ssr: false`.
    client: undefined,
    forwardCookies: false,
    // Left unset, because `defu` would join a list of the app's own with a default one.
    allowedRoutes: undefined,
    server: {
      cache: false,
      storage: 'cache',
      swr: false,
      maxAge: 1,
    },
  }),
  setup(moduleOptions, nuxt) {
    const moduleName = name
    const runtimeOptions = nuxt.options.runtimeConfig.kirby as ModuleOptions | undefined
    // Annotated because `defu` widens the merged values.
    const options: ModuleOptions = {
      ...defu(runtimeOptions, moduleOptions),
      // `defu` would join the two lists.
      allowedRoutes: runtimeOptions?.allowedRoutes ?? moduleOptions.allowedRoutes,
    }

    assertValidOptions(options, process.env)

    const kqlPath = options.kqlPath || (options.auth === 'bearer'
      ? 'api/kql'
      : 'api/query')

    const isDefaultClient = options.client == null && !nuxt.options.ssr && !options.forwardCookies && !options.allowedRoutes && !options.server?.cache
    if (isDefaultClient)
      logger.info('Sending requests straight to Kirby because SSR is disabled. Set `client: false` to keep them on the server proxy.')
    const client = options.client ?? isDefaultClient

    if (options.forwardCookies && options.server?.cache)
      logger.warn('Both `forwardCookies` and `server.cache` are set. Cookie forwarding turns the server cache off, because one stored response is shared between all visitors.')

    const serverConfig: ServerKirbyConfig = {
      url: options.url!,
      kqlPath,
      auth: options.auth!,
      token: options.token!,
      credentials: options.credentials!,
      forwardCookies: options.forwardCookies!,
      allowedRoutes: options.allowedRoutes ?? [
        {
          path: '**',
          methods: ['GET', 'HEAD'],
        },
        {
          path: kqlPath,
          methods: ['POST'],
        },
      ],
      server: {
        cache: options.server!.cache!,
        // The Nitro storage mountpoint requires a leading slash.
        storage: withLeadingSlash(options.server!.storage || 'cache'),
        swr: options.server!.swr!,
        maxAge: options.server!.maxAge!,
      },
    }
    nuxt.options.runtimeConfig.kirby = serverConfig

    // The browser reads the config only to send a request itself, so only what that request needs is published.
    const publicConfig: PublicKirbyConfig = client
      ? {
          client,
          kqlPath,
          url: serverConfig.url,
          auth: serverConfig.auth,
          ...(serverConfig.auth === 'bearer' && { token: serverConfig.token }),
          ...(serverConfig.auth === 'basic' && { credentials: serverConfig.credentials }),
        }
      : { client, kqlPath }
    // Cast because `defu` widens the merged values.
    nuxt.options.runtimeConfig.public.kirby = defu(
      nuxt.options.runtimeConfig.public.kirby as Partial<PublicKirbyConfig> | undefined,
      publicConfig,
    ) as PublicKirbyConfig

    const { resolve } = createResolver(import.meta.url)
    // Nuxt hands the transpiled directories on to Nitro to inline, so the server runtime is bundled as well.
    nuxt.options.build.transpile.push(resolve('runtime'))

    // Nitro serves `server/api` below `apiBaseURL`, and the proxy joins it there.
    const proxyRoute = joinURL(nuxt.options.nitro.apiBaseURL || '/api', '__kirby__')

    addServerHandler({
      route: joinURL(proxyRoute, '**:path'),
      handler: resolve('runtime/server/cache'),
    })

    const composables = [
      '$kirby',
      '$kql',
      'useKirbyData',
      'useKql',
    ]

    addImports(composables.map(name => ({
      name,
      from: resolve(`runtime/composables/${name}`),
    })))

    // Nuxt finds a composable to key by scanning the app's own directories alone.
    nuxt.options.optimization.keyedComposables.push(
      ...['useKirbyData', 'useKql'].map(name => ({
        name,
        argumentLength: 3,
        source: resolve(`runtime/composables/${name}`),
      })),
    )

    addServerImports(['$kirby', '$kql'].map(name => ({
      name,
      from: resolve('runtime/server/imports'),
    })))

    addTemplate({
      filename: `module/${moduleName}.config.mjs`,
      getContents: () => `
export const proxyRoute = ${JSON.stringify(proxyRoute)}
`.trimStart(),
    })

    addTemplate({
      filename: `module/${moduleName}.config.d.ts`,
      getContents: () => `
export declare const proxyRoute: string
`.trimStart(),
    })

    nuxt.options.alias[`#${moduleName}`] = join(nuxt.options.buildDir, `module/${moduleName}`)

    const importSpecifierFor = (path: string) => JSON.stringify(relative(join(nuxt.options.buildDir, 'module'), resolve(path)))

    addTemplate({
      filename: `module/${moduleName}.d.ts`,
      write: true,
      getContents: () => `
// Generated by ${moduleName}
export type { AllowedRoute, KirbyFetchOptions, KqlOptions } from ${importSpecifierFor('runtime/types')}
export type { UseKirbyDataOptions } from ${importSpecifierFor('runtime/composables/useKirbyData')}
export type { UseKqlOptions } from ${importSpecifierFor('runtime/composables/useKql')}
export type { NitroKirbyFetchOptions, NitroKqlFetchOptions } from ${importSpecifierFor('runtime/server/imports')}
`.trimStart(),
    })
  },
})
