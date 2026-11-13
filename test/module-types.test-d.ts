import type { AllowedRoute, KirbyFetchOptions, KqlOptions, NitroKirbyFetchOptions, NitroKqlFetchOptions, UseKirbyDataOptions, UseKqlOptions } from '#nuxt-kirby'
import { describe, expectTypeOf, it } from 'vitest'

// An export that fails to resolve turns into `any`.
describe('#nuxt-kirby', () => {
  it('exports the option types', () => {
    expectTypeOf<AllowedRoute>().not.toBeAny()
    expectTypeOf<KirbyFetchOptions>().not.toBeAny()
    expectTypeOf<KqlOptions>().not.toBeAny()
    expectTypeOf<UseKirbyDataOptions<unknown>>().not.toBeAny()
    expectTypeOf<UseKqlOptions<unknown>>().not.toBeAny()
    expectTypeOf<NitroKirbyFetchOptions>().not.toBeAny()
    expectTypeOf<NitroKqlFetchOptions>().not.toBeAny()
  })
})
