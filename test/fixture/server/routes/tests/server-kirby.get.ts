import { $kirby, defineEventHandler, getQuery } from '#imports'

export default defineEventHandler(async (event) => {
  const { path } = getQuery<{ path: string }>(event)

  return $kirby(path).then(
    response => ({ response }),
    (error: { statusCode?: number }) => ({ statusCode: error.statusCode }),
  )
})
