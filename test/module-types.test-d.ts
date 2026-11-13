import type { AllowedRoute, KirbyFetchOptions, KirbyQueryRequest, KqlOptions, NitroKirbyFetchOptions, NitroKqlFetchOptions, UseKirbyDataOptions, UseKqlOptions } from '#nuxt-kirby'
import { describe, expectTypeOf, it } from 'vitest'

// An export that fails to resolve turns into `any`.
describe('#nuxt-kirby', () => {
  it('exports the types of kirby-types and the option types', () => {
    expectTypeOf<KirbyQueryRequest>().not.toBeAny()
    expectTypeOf<AllowedRoute>().not.toBeAny()
    expectTypeOf<KirbyFetchOptions>().not.toBeAny()
    expectTypeOf<KqlOptions>().not.toBeAny()
    expectTypeOf<UseKirbyDataOptions<unknown>>().not.toBeAny()
    expectTypeOf<UseKqlOptions<unknown>>().not.toBeAny()
    expectTypeOf<NitroKirbyFetchOptions>().not.toBeAny()
    expectTypeOf<NitroKqlFetchOptions>().not.toBeAny()
  })
})
