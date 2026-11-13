import type { KirbyQueryRequest, KirbyQueryResponse } from 'kirby-types'
import type { NuxtError } from 'nuxt/app'
import type { $kql as _$kql } from '../src/runtime/composables/$kql'
import type { useKirbyData as _useKirbyData } from '../src/runtime/composables/useKirbyData'
import type { useKql as _useKql } from '../src/runtime/composables/useKql'
import { describe, expectTypeOf, it } from 'vitest'
import { ref } from 'vue'

declare const $kql: typeof _$kql
declare const useKirbyData: typeof _useKirbyData
declare const useKql: typeof _useKql

type SiteResponse = KirbyQueryResponse<{ title: string }>

describe('$kql', () => {
  it('rejects method and body', () => {
    // @ts-expect-error: A KQL query is always a `POST`.
    $kql({ query: 'site' }, { method: 'GET' })
    // @ts-expect-error: The query is the body.
    $kql({ query: 'site' }, { body: {} })
  })
})

describe('useKql', () => {
  it('types data as the response type the call names', () => {
    const { data } = useKql<SiteResponse>({ query: 'site' })

    expectTypeOf(data.value).toEqualTypeOf<SiteResponse | undefined>()
  })

  it('types error as the error data the call names', () => {
    const { error } = useKql<SiteResponse, KirbyQueryRequest, { message: string }>({ query: 'site' })

    expectTypeOf(error.value).toEqualTypeOf<NuxtError<{ message: string }> | undefined>()
  })

  it('types data as the return type of transform', () => {
    const { data } = useKql({ query: 'site' }, {
      transform: (response: SiteResponse) => response.code,
    })

    expectTypeOf(data.value).toEqualTypeOf<number | undefined>()
  })

  it('types data as the return type of default', () => {
    const { data } = useKql({ query: 'site' }, {
      default: () => null,
    })

    expectTypeOf(data.value).toEqualTypeOf<KirbyQueryResponse | null>()
  })

  it('accepts a ref and a getter as language', () => {
    expectTypeOf(useKql).toBeCallableWith({ query: 'site' }, {
      language: ref('de'),
    })
    expectTypeOf(useKql).toBeCallableWith({ query: 'site' }, {
      language: () => 'de',
    })
  })

  it('rejects method and body', () => {
    // @ts-expect-error: A KQL query is always a `POST`.
    useKql({ query: 'site' }, { method: 'GET' })
    // @ts-expect-error: The query is the body.
    useKql({ query: 'site' }, { body: {} })
  })
})

describe('useKirbyData', () => {
  it('types data and error as the types the call names', () => {
    const { data, error } = useKirbyData<{ title: string }, { message: string }>('api/site')

    expectTypeOf(data.value).toEqualTypeOf<{ title: string } | undefined>()
    expectTypeOf(error.value).toEqualTypeOf<NuxtError<{ message: string }> | undefined>()
  })

  it('accepts a ref as method, query and body', () => {
    expectTypeOf(useKirbyData).toBeCallableWith('api/site', {
      method: ref<'POST'>('POST'),
      query: ref({ select: 'title' }),
      body: ref({ title: 'Site' }),
    })
  })
})
