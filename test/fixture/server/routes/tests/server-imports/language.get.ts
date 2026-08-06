import { $kirby, defineEventHandler } from '#imports'

/**
 * Route that reports how the server-side `$kirby` shaped its outbound request, so a
 * test can read the path and the language header without reaching the Kirby instance
 * for anything other than the response it discards.
 */
export default defineEventHandler(async () => {
  let requestedPath: string | undefined
  let requestedLanguage: string | null | undefined

  await $kirby('api/__template__/__site__', {
    language: 'en',
    onRequest({ request, options }) {
      requestedPath = String(request)
      requestedLanguage = new Headers(options.headers).get('x-language')
    },
  })

  return { requestedPath, requestedLanguage }
})
