import { $kirby, $kql, defineEventHandler } from '#imports'

// A line break makes `Headers` throw.
const invalidHeaders = { 'X-Invalid': 'a\nb' }

export default defineEventHandler(async () => ({
  kirbyErrorName: await $kirby('api/__template__/__site__', { headers: invalidHeaders }).catch((error: Error) => error.name),
  kqlErrorName: await $kql({ query: 'site' }, { headers: invalidHeaders }).catch((error: Error) => error.name),
}))
