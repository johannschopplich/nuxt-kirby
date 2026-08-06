export function buildApiProxyPath(key: string) {
  return `/api/__kirby__/${encodeURIComponent(key)}`
}

export function headersToObject(headers: HeadersInit = {}): Record<string, string> {
  return Object.fromEntries(new Headers(headers))
}

/**
 * Builds the credentials header, lowercased for the same reason as the language
 * header: a caller-supplied `Authorization` would otherwise survive as a second
 * key and `Headers` would join both values into `Bearer caller, Bearer config`.
 * Landing on one key lets the configured credentials overwrite what a caller
 * sent, which is what keeps a browser from choosing the upstream credentials.
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
 * Builds the header Kirby reads the language from, lowercased so that it lands on
 * the same key as a `X-Language` header the caller passed through `headersToObject`
 * rather than travelling alongside it as a second value.
 */
export function createLanguageHeader(language: string | undefined) {
  return language ? { 'x-language': language } : undefined
}
