import { describe, expect, it } from 'vitest'
import { assertValidOptions } from '../src/options'

const VALID_OPTIONS = { auth: 'bearer', server: {} }

describe('assertValidOptions', () => {
  it('rejects the removed option prefetch, naming nuxt-prepare as its replacement', () => {
    const message = readErrorMessage(() => assertValidOptions({ ...VALID_OPTIONS, prefetch: {} }, {}))

    expect(message).toContain('`prefetch`')
    expect(message).toContain('nuxt-prepare')
  })

  it('rejects the removed option server.verboseErrors', () => {
    const message = readErrorMessage(() => assertValidOptions({
      ...VALID_OPTIONS,
      server: { verboseErrors: true },
    }, {}))

    expect(message).toContain('`server.verboseErrors`')
  })

  it.each([
    ['KIRBY_BASE_URL', 'NUXT_KIRBY_URL'],
    ['KIRBY_API_TOKEN', 'NUXT_KIRBY_TOKEN'],
    ['KIRBY_API_USERNAME', 'NUXT_KIRBY_CREDENTIALS_USERNAME'],
    ['KIRBY_API_PASSWORD', 'NUXT_KIRBY_CREDENTIALS_PASSWORD'],
  ])('rejects the variable %s, naming %s as its successor', (oldName, newName) => {
    const message = readErrorMessage(() => assertValidOptions(VALID_OPTIONS, { [oldName]: 'value' }))

    expect(message).toContain(`\`${oldName}\``)
    expect(message).toContain(`\`${newName}\``)
  })

  it('accepts KIRBY_BASE_URL beside NUXT_KIRBY_URL', () => {
    expect(() => assertValidOptions(VALID_OPTIONS, { KIRBY_BASE_URL: 'value', NUXT_KIRBY_URL: 'value' })).not.toThrow()
  })

  it('accepts KIRBY_BASE_URL beside the url option', () => {
    expect(() => assertValidOptions({ ...VALID_OPTIONS, url: 'https://kirby.example.com' }, { KIRBY_BASE_URL: 'value' })).not.toThrow()
  })

  it('rejects an auth method other than basic, bearer and none', () => {
    expect(() => assertValidOptions({ ...VALID_OPTIONS, auth: 'token' }, {})).toThrow('`auth`')
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
    }, {})).toThrow(`\`${key}\``)
  })

  it('reports every invalid option at once and links the migration guide', () => {
    const message = readErrorMessage(() => assertValidOptions({ ...VALID_OPTIONS, prefetch: {} }, { KIRBY_API_TOKEN: 'value' }))

    expect(message).toContain('`prefetch`')
    expect(message).toContain('`KIRBY_API_TOKEN`')
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
