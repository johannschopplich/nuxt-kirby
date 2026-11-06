import { createError } from 'h3'

/* eslint-disable no-control-regex -- URL parsers strip leading and trailing C0 controls, so the checks look past them. */

/**
 * Throws a 400 for a path that a URL parser or the server behind the Kirby URL could read as absolute
 * or as climbing above it: a scheme, an authority, a tab or line break, or a `..` segment, also
 * percent-encoded or with a `;` parameter.
 */
export function assertPathBelowBase(path: string) {
  const segments = path.split('?', 1)[0]!.replace(/%2e/gi, '.').replace(/%3b/gi, ';').split(/[/\\#]|%2f|%5c/i)

  if (
    /[\t\n\r\u2028\u2029]/.test(path)
    // RFC 3986 forbids a colon in the first segment of a relative path.
    || /^[^/?#]*:/.test(path)
    || /^[\s\u0000-\u001F]*(?:[/\\]\s*){2}/.test(path)
    || segments.some(segment => /^\.\.(?:;|[\u0000-\u0020]*$)/.test(segment))
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Path must stay below the Kirby URL',
    })
  }
}
