export function buildApiProxyPath(key: string) {
  return `/api/__kirby__/${encodeURIComponent(key)}`
}

export function headersToObject(headers: HeadersInit = {}): Record<string, string> {
  return Object.fromEntries(new Headers(headers))
}

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

    return { Authorization: `Basic ${encoded}` }
  }

  if (auth === 'bearer')
    return { Authorization: `Bearer ${token}` }
}

/**
 * Builds the header Kirby reads the language from, lowercased so that it lands on
 * the same key as a `X-Language` header the caller passed through `headersToObject`
 * rather than travelling alongside it as a second value.
 */
export function createLanguageHeader(language: string | undefined) {
  return language ? { 'x-language': language } : undefined
}
