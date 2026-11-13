import { $kirby, defineEventHandler, getQuery } from '#imports'

/**
 * Route that sends the server-side `$kirby` to the path in its query and reports whether the call
 * resolved or the status code it rejected with.
 */
export default defineEventHandler(async (event) => {
  const { path } = getQuery<{ path: string }>(event)

  return {
    outcome: await $kirby(path).then(
      () => 'resolved',
      (error: { statusCode?: number }) => error.statusCode,
    ),
  }
})
