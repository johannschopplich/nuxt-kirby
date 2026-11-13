import type { NuxtConfig } from '@nuxt/schema'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadNuxt } from '@nuxt/kit'
import { afterAll, describe, expect, it } from 'vitest'

const buildDir = await mkdtemp(join(tmpdir(), 'nuxt-kirby-module-'))

afterAll(async () => {
  await rm(buildDir, { recursive: true, force: true })
})

async function loadModule(overrides: NuxtConfig) {
  const nuxt = await loadNuxt({
    cwd: join(import.meta.dirname, 'fixture'),
    overrides: {
      ...overrides,
      buildDir,
    },
  })
  const { runtimeConfig, serverHandlers } = nuxt.options
  await nuxt.close()
  return { runtimeConfig, serverHandlers }
}

describe('runtime config', () => {
  it('publishes client and kqlPath alone with SSR', async () => {
    const { runtimeConfig } = await loadModule({})

    expect(runtimeConfig.public.kirby).toEqual({ client: false, kqlPath: 'api/kql' })
  })

  it('publishes the token with ssr: false and client unset', async () => {
    const { runtimeConfig } = await loadModule({ ssr: false })

    expect(runtimeConfig.public.kirby).toMatchObject({ client: true, token: 'test' })
  })

  it.each([
    [
      'forwardCookies',
      { forwardCookies: true },
    ],
    [
      'allowedRoutes',
      {
        allowedRoutes: [
          { path: 'api/kql' },
        ],
      },
    ],
    [
      'server.cache',
      {
        server: { cache: true },
      },
    ],
  ])('keeps the server proxy with ssr: false and %s', async (_key, kirby) => {
    const { runtimeConfig } = await loadModule({ ssr: false, kirby })

    expect(runtimeConfig.public.kirby).toEqual({ client: false, kqlPath: 'api/kql' })
  })

  it('publishes client, kqlPath, url, auth and credentials alone for auth: basic', async () => {
    const { runtimeConfig } = await loadModule({
      kirby: {
        url: 'https://kirby.example.com',
        client: true,
        auth: 'basic',
        credentials: { username: 'user', password: 'secret' },
      },
    })

    expect(runtimeConfig.public.kirby).toEqual({
      client: true,
      kqlPath: 'api/query',
      url: 'https://kirby.example.com',
      auth: 'basic',
      credentials: { username: 'user', password: 'secret' },
    })
  })

  it('publishes no credentials with ssr: false and client: false', async () => {
    const { runtimeConfig } = await loadModule({
      ssr: false,
      kirby: { client: false },
    })

    expect(runtimeConfig.public.kirby).toEqual({ client: false, kqlPath: 'api/kql' })
  })

  it('allows GET and HEAD on every path and POST on kqlPath by default', async () => {
    const { runtimeConfig } = await loadModule({
      kirby: { kqlPath: 'api/custom' },
    })

    expect(runtimeConfig.kirby.allowedRoutes).toEqual([
      {
        path: '**',
        methods: ['GET', 'HEAD'],
      },
      {
        path: 'api/custom',
        methods: ['POST'],
      },
    ])
  })

  it('keeps a value the app sets in runtimeConfig.public.kirby', async () => {
    const { runtimeConfig } = await loadModule({
      // Nuxt types the runtime config as complete, where an app sets part of it.
      runtimeConfig: {
        public: {
          kirby: { url: 'https://kirby.example.com' },
        },
      } as NuxtConfig['runtimeConfig'],
    })

    expect(runtimeConfig.public.kirby).toMatchObject({ url: 'https://kirby.example.com' })
  })

  it('takes allowedRoutes from runtimeConfig.kirby in place of the option', async () => {
    const allowedRoutes = [
      {
        path: 'api/kql',
        methods: ['POST' as const],
      },
    ]

    const { runtimeConfig } = await loadModule({
      runtimeConfig: {
        kirby: { allowedRoutes },
      } as NuxtConfig['runtimeConfig'],
      kirby: {
        allowedRoutes: [
          { path: 'api/pages/**' },
        ],
      },
    })

    expect(runtimeConfig.kirby.allowedRoutes).toEqual(allowedRoutes)
  })

  it('replaces the default allowed routes with the allowedRoutes option', async () => {
    const allowedRoutes = [
      {
        path: 'api/kql',
        methods: ['POST' as const],
      },
    ]

    const { runtimeConfig } = await loadModule({
      kirby: { allowedRoutes },
    })

    expect(runtimeConfig.kirby.allowedRoutes).toEqual(allowedRoutes)
  })
})

describe('server proxy', () => {
  it('registers its route below nitro.apiBaseURL', async () => {
    const { serverHandlers } = await loadModule({
      nitro: { apiBaseURL: '/backend' },
    })

    expect(serverHandlers.map(handler => handler.route)).toContain('/backend/__kirby__/**:path')
  })
})
