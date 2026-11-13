import type { BasicCredentials, KirbyAuth } from './types'

export function mergeHeaders(...headers: (HeadersInit | undefined)[]): Record<string, string> {
  const merged: Record<string, string> = {}

  for (const source of headers) {
    for (const [name, value] of new Headers(source))
      merged[name] = value
  }

  return merged
}

export function createAuthHeader({ auth, token, credentials }: {
  auth?: KirbyAuth
  token?: string
  credentials?: BasicCredentials
}) {
  if (auth === 'basic' && credentials)
    return { authorization: `Basic ${globalThis.btoa(`${credentials.username}:${credentials.password}`)}` }

  if (auth === 'bearer')
    return { authorization: `Bearer ${token}` }
}

export function createLanguageHeader(language: string | undefined) {
  return language
    ? { 'x-language': language }
    : undefined
}
