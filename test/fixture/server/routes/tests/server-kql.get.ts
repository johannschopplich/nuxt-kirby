import { $kql, defineEventHandler } from '#imports'

export default defineEventHandler(() => $kql({ query: 'site' }, { language: 'de' }))
