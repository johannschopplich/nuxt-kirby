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

/** Sets the module up on the fixture and returns the runtime config it produced. */
async function loadRuntimeConfig(overrides: NuxtConfig) {
  const nuxt = await loadNuxt({
    cwd: join(import.meta.dirname, 'fixture'),
    overrides: {
      ...overrides,
      buildDir,
      kirby: {
        // Nothing listens on the discard port, so the fixture's prefetch fails fast.
        url: 'http://127.0.0.1:9',
        ...overrides.kirby,
      },
    },
  })
  const { runtimeConfig } = nuxt.options
  await nuxt.close()
  return runtimeConfig
}

describe('runtime config', () => {
  it('publishes no credentials with SSR', async () => {
    const { public: publicConfig } = await loadRuntimeConfig({})

    expect(publicConfig.kirby).toEqual({ client: false })
  })

  it('publishes the credentials with `ssr: false` and `client` unset', async () => {
    const { public: publicConfig } = await loadRuntimeConfig({ ssr: false })

    expect(publicConfig.kirby).toMatchObject({ client: true, token: 'test' })
  })

  it('publishes no credentials with `ssr: false` and `client: false`', async () => {
    const { public: publicConfig } = await loadRuntimeConfig({
      ssr: false,
      kirby: { client: false },
    })

    expect(publicConfig.kirby).toEqual({ client: false })
  })

  it('publishes the credentials with `client: true`', async () => {
    const { public: publicConfig } = await loadRuntimeConfig({
      kirby: { client: true },
    })

    expect(publicConfig.kirby).toMatchObject({ client: true, token: 'test' })
  })
})
