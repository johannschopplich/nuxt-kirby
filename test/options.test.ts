import { describe, expect, it } from 'vitest'
import { assertValidOptions } from '../src/options'

const VALID_OPTIONS = { auth: 'bearer', server: {} }

describe('assertValidOptions', () => {
  it('rejects the removed option prefetch, naming nuxt-prepare as its replacement', () => {
    const message = readErrorMessage(() => assertValidOptions({ ...VALID_OPTIONS, prefetch: {} }))

    expect(message).toContain('`prefetch`')
    expect(message).toContain('nuxt-prepare')
  })

  it('rejects the removed option server.verboseErrors', () => {
    const message = readErrorMessage(() => assertValidOptions({
      ...VALID_OPTIONS,
      server: { verboseErrors: true },
    }))

    expect(message).toContain('`server.verboseErrors`')
  })

  it('rejects an auth method other than basic, bearer and none', () => {
    expect(() => assertValidOptions({ ...VALID_OPTIONS, auth: 'token' })).toThrow('`auth`')
  })

  it.each([
    [
      'forwardCookies',
      { forwardCookies: true },
    ],
    [
      'allowedRoutes',
      { allowedRoutes: [] },
    ],
    [
      'server.cache',
      {
        server: { cache: true },
      },
    ],
  ])('rejects client together with %s', (key, options) => {
    expect(() => assertValidOptions({
      ...VALID_OPTIONS,
      ...options,
      client: true,
    })).toThrow(`\`${key}\``)
  })

  it('reports every invalid option at once and links the migration guide', () => {
    const message = readErrorMessage(() => assertValidOptions({
      ...VALID_OPTIONS,
      prefetch: {},
      server: { verboseErrors: true },
    }))

    expect(message).toContain('`prefetch`')
    expect(message).toContain('`server.verboseErrors`')
    expect(message).toContain('https://nuxt-kirby.byjohann.dev/advanced/migration')
  })
})

function readErrorMessage(run: () => void) {
  try {
    run()
  }
  catch (error) {
    return (error as Error).message
  }

  throw new Error('Expected the options to be rejected')
}
