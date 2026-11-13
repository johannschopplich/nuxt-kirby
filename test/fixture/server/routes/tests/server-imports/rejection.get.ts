import { $kql, defineEventHandler } from '#imports'

// A line break makes `Headers` throw.
const invalidHeaders = { 'X-Invalid': 'a\nb' }

export default defineEventHandler(async () => ({
  errorName: await $kql({ query: 'site' }, { headers: invalidHeaders }).catch((error: Error) => error.name),
}))
