import type { IncomingHttpHeaders } from 'node:http'
import type { AddressInfo } from 'node:net'
import { Buffer } from 'node:buffer'
import { createServer } from 'node:http'
import { gzipSync } from 'node:zlib'

export const KIRBY_GZIP_BODY = 'Hello, gzip'

export interface RecordedRequest {
  url: string
  method: string
  headers: IncomingHttpHeaders
  body: string
}

export interface KirbyStandIn {
  /** Host and port the stand-in listens on. */
  host: string
  /** URL of the stand-in's Kirby instance, which lives below `/base`. */
  url: string
  /** Requests the stand-in has received, oldest first. */
  requests: RecordedRequest[]
  close: () => Promise<void>
}

export const KIRBY_REDIRECT_LOCATION = '/base/api/redirected'

/**
 * Starts a stand-in for a Kirby instance that records every request. It answers a JSON KQL query
 * with the query string, the language and the number of the request, and any other request with
 * its URL, method and body. Every answer sets a session cookie and `cache-control`. The query
 * `fail` gets a 500, and a path ending in `/missing` a 404, in `/forbidden` a 403, in `/redirect`
 * a 302 to `KIRBY_REDIRECT_LOCATION`, in `/gzip` `KIRBY_GZIP_BODY` compressed, and in `/reset` a
 * closed connection.
 */
export async function startKirbyStandIn({ delay = 0 } = {}): Promise<KirbyStandIn> {
  const requests: RecordedRequest[] = []
  const server = createServer(async (request, response) => {
    const chunks: Buffer[] = []
    for await (const chunk of request)
      chunks.push(chunk)

    const body = Buffer.concat(chunks).toString()
    const url = request.url!
    const { pathname } = new URL(url, 'http://kirby')
    const method = request.method!
    const requestNumber = requests.push({
      url,
      method,
      headers: request.headers,
      body,
    })
    const language = request.headers['x-language'] ?? null

    if (delay)
      await new Promise(resolve => setTimeout(resolve, delay))

    if (pathname.endsWith('/reset')) {
      request.socket.destroy()
      return
    }

    response.setHeader('set-cookie', `kirby_session=${requestNumber}; Path=/; HttpOnly`)
    response.setHeader('x-powered-by', 'PHP')
    response.setHeader('cache-control', 'max-age=60')

    if (pathname.endsWith('/redirect')) {
      response.writeHead(302, { location: KIRBY_REDIRECT_LOCATION })
      response.end()
      return
    }

    if (pathname.endsWith('/gzip')) {
      response.setHeader('content-encoding', 'gzip')
      response.end(gzipSync(KIRBY_GZIP_BODY))
      return
    }

    response.setHeader('content-type', 'application/json')

    if (pathname.endsWith('/forbidden')) {
      response.statusCode = 403
      response.end(JSON.stringify({ status: 'error', code: 403, message: 'Forbidden' }))
      return
    }

    if (pathname.endsWith('/missing')) {
      response.statusCode = 404
      response.end(JSON.stringify({ status: 'error', code: 404, message: 'Not found' }))
      return
    }

    if (method === 'POST' && pathname === '/base/api/kql' && request.headers['content-type'] === 'application/json') {
      const { query } = JSON.parse(body) as { query?: string }

      if (query === 'fail') {
        response.statusCode = 500
        response.end(JSON.stringify({ status: 'error', code: 500, message: 'Query failed' }))
        return
      }

      response.end(JSON.stringify({
        code: 200,
        status: 'OK',
        result: { query, language, requestNumber },
      }))
      return
    }

    response.end(JSON.stringify({
      url,
      method,
      body,
      language,
      requestNumber,
    }))
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))

  const host = `127.0.0.1:${(server.address() as AddressInfo).port}`

  return {
    host,
    url: `http://${host}/base`,
    requests,
    close: () => new Promise<void>((resolve, reject) => server.close(error => error
      ? reject(error)
      : resolve())),
  }
}
