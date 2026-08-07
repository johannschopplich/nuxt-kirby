export function buildApiProxyPath(key: string) {
  return `/api/__kirby__/${encodeURIComponent(key)}`
}

export function headersToObject(headers: HeadersInit = {}): Record<string, string> {
  return Object.fromEntries(new Headers(headers))
}

/**
 * Builds the credentials header, lowercased so that it overwrites a caller's own
 * `Authorization` instead of being joined with it into one comma-separated value.
 */
export function createAuthHeader({
  auth,
  token,
  credentials,
}: {
  auth?: string
  token?: string
  credentials?: { username: string, password: string }
}) {
  if (auth === 'basic' && credentials) {
    const { username, password } = credentials
    const encoded = globalThis.btoa(`${username}:${password}`)

    return { authorization: `Basic ${encoded}` }
  }

  if (auth === 'bearer')
    return { authorization: `Bearer ${token}` }
}

/**
 * Builds the header Kirby reads the language from, lowercased so that it overwrites
 * a caller's own `X-Language` instead of traveling alongside it as a second value.
 */
export function createLanguageHeader(language: string | undefined) {
  return language ? { 'x-language': language } : undefined
}
