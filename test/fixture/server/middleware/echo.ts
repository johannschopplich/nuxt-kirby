import type { ServerFetchOptions } from '../../../../src/runtime/types'
import { defineEventHandler, readBody } from 'h3'

/**
 * Answers a proxy request naming `__echo__` with the options it carried, so a test can assert on
 * what the proxy forwarded.
 */
export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/__kirby__'))
    return

  const body = await readBody<ServerFetchOptions>(event)

  // A KQL request carries no path, so its query names the echo endpoint instead.
  if (!body.path?.includes('__echo__') && body.query?.query !== '__echo__')
    return

  return {
    result: {
      ...body,
      method: body.method || 'GET',
    },
  }
})
