import type { ServerFetchOptions } from '../../../../src/runtime/types'
import { defineEventHandler, readBody } from 'h3'

let hits = 0

/**
 * Answers the `__hits__` query with a counter, so a test can tell how many requests a page sent.
 */
export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/__kirby__'))
    return

  const body = await readBody<ServerFetchOptions>(event)

  if (body.query?.query !== '__hits__')
    return

  return { result: { hits: ++hits } }
})
