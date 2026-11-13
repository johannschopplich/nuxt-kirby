import { $kirby, defineEventHandler, getQuery } from '#imports'

export default defineEventHandler(async (event) => {
  const { path } = getQuery<{ path: string }>(event)

  return {
    outcome: await $kirby(path).then(
      () => 'resolved',
      (error: { statusCode?: number }) => error.statusCode,
    ),
  }
})
