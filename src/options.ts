import { AUTH_METHODS } from './runtime/types'

// TODO: Drop the removed-option and renamed-variable checks in 6.0.
const REMOVED_OPTIONS: Record<string, string> = {
  prefetch: 'Fetch the query in a nuxt-prepare script instead.',
}

const REMOVED_SERVER_OPTIONS: Record<string, string> = {
  verboseErrors: 'The server proxy passes Kirby\'s answer to a failed request on as it is, and no longer logs the request.',
}

/** The variables 4.x read at build time, each with the option it filled and the variable Nuxt reads at runtime. */
const RENAMED_VARIABLES: [oldName: string, newName: string, hasValue: (options: UnvalidatedOptions) => boolean][] = [
  [
    'KIRBY_BASE_URL',
    'NUXT_KIRBY_URL',
    options => Boolean(options.url),
  ],
  [
    'KIRBY_API_TOKEN',
    'NUXT_KIRBY_TOKEN',
    options => Boolean(options.token),
  ],
  [
    'KIRBY_API_USERNAME',
    'NUXT_KIRBY_CREDENTIALS_USERNAME',
    options => Boolean(options.credentials?.username),
  ],
  [
    'KIRBY_API_PASSWORD',
    'NUXT_KIRBY_CREDENTIALS_PASSWORD',
    options => Boolean(options.credentials?.password),
  ],
]

const MIGRATION_GUIDE_URL = 'https://nuxt-kirby.byjohann.dev/advanced/migration'

interface UnvalidatedOptions {
  [key: string]: unknown
  url?: string
  auth?: string
  token?: string
  credentials?: { username?: string, password?: string }
  client?: boolean
  forwardCookies?: boolean
  allowedRoutes?: unknown
  server?: Record<string, unknown>
}

export function assertValidOptions(input: object, env: Record<string, string | undefined>) {
  const options = input as UnvalidatedOptions
  const optionErrors: string[] = []

  for (const [key, replacement] of Object.entries(REMOVED_OPTIONS)) {
    if (options[key] !== undefined)
      optionErrors.push(`The \`${key}\` option was removed. ${replacement}`)
  }

  for (const [key, replacement] of Object.entries(REMOVED_SERVER_OPTIONS)) {
    if (options.server?.[key] !== undefined)
      optionErrors.push(`The \`server.${key}\` option was removed. ${replacement}`)
  }

  for (const [oldName, newName, hasValue] of RENAMED_VARIABLES) {
    if (env[oldName] && !env[newName] && !hasValue(options))
      optionErrors.push(`The \`${oldName}\` environment variable is no longer read. Rename it to \`${newName}\`.`)
  }

  if (!(AUTH_METHODS as readonly string[]).includes(options.auth!))
    optionErrors.push(`The \`auth\` option is \`${JSON.stringify(options.auth)}\`. Set it to ${new Intl.ListFormat('en', { type: 'disjunction' }).format(AUTH_METHODS.map(method => `\`${method}\``))}.`)

  if (options.client === true) {
    if (options.forwardCookies)
      optionErrors.push('Both `client` and `forwardCookies` are set. Client mode skips the server proxy, so there is no visitor cookie to forward. Pass `credentials: \'include\'` to a request for the browser to send its own cookie for the Kirby URL.')

    if (options.allowedRoutes)
      optionErrors.push('Both `client` and `allowedRoutes` are set. Client mode publishes the Kirby credentials and skips the server proxy, so the allowed routes protect nothing.')

    if (options.server?.cache)
      optionErrors.push('Both `client` and `server.cache` are set. Client mode skips the server proxy, so no response reaches the server cache.')
  }

  if (optionErrors.length) {
    throw new Error([
      'Invalid Nuxt Kirby options:',
      ...optionErrors.map(optionError => `- ${optionError}`),
      `See the migration guide: ${MIGRATION_GUIDE_URL}`,
    ].join('\n'))
  }
}
