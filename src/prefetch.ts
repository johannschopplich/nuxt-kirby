import type { KirbyQueryResponse } from 'kirby-types'
import type { FetchError } from 'ofetch'
import type { ModuleOptions } from './module'
import { ofetch } from 'ofetch'
import { pascalCase } from 'scule'
import { logger } from './kit'
import { createAuthHeader } from './runtime/utils'

export async function prefetchQueries(
  options: ModuleOptions,
): Promise<Map<string, KirbyQueryResponse>> {
  const results = new Map<string, KirbyQueryResponse>()

  if (!options.prefetch || Object.keys(options.prefetch).length === 0)
    return results

  if (!options.url) {
    logger.error('Skipping KQL prefetch, since no Kirby base URL is provided')
    return results
  }

  // Validate prefetch query keys to prevent naming conflicts.
  for (const key of Object.keys(options.prefetch)) {
    if (key === pascalCase(key)) {
      logger.error(`Prefetch query key "${key}" conflicts with its PascalCase type name. Please use a different key (e.g., "${key.charAt(0).toLowerCase() + key.slice(1)}")`)
    }
  }

  const start = Date.now()

  for (const [key, query] of Object.entries(options.prefetch)) {
    const language = 'language' in query ? query.language : undefined

    if (language && !query.query) {
      logger.error(`Prefetch KQL query "${key}" requires the "query" property in multi-language mode`)
      continue
    }

    try {
      results.set(
        key,
        await ofetch<KirbyQueryResponse>(options.kqlPath!, {
          baseURL: options.url,
          method: 'POST',
          body: language ? query.query : query,
          headers: {
            ...createAuthHeader(options),
            ...(language && { 'X-Language': language }),
          },
        }),
      )
    }
    catch (error) {
      const _error = error as FetchError
      logger.error(
        `Prefetch KQL query "${key}" failed${
          _error.status
            ? ` with status code ${_error.status}:\n${JSON.stringify(_error.data, undefined, 2)}`
            : `: ${_error}`
        }`,
      )
    }
  }

  if (results.size > 0) {
    const firstKey = results.keys().next().value as string

    logger.info(
      `Prefetched ${results.size === 1 ? '' : `${results.size} `}KQL ${
        results.size === 1 ? `query "${firstKey}"` : 'queries'
      } in ${Date.now() - start}ms`,
    )
  }

  return results
}
