import type { IncomingHttpHeaders } from 'node:http'
import type { AddressInfo } from 'node:net'
import { Buffer } from 'node:buffer'
import { createServer } from 'node:http'
import { gzipSync } from 'node:zlib'

export const KIRBY_GZIP_BODY = 'Hello, gzip'
/** Bytes that no UTF-8 string round-trips. */
export const KIRBY_BINARY_BODY = Uint8Array.from({ length: 256 }, (_, index) => index)

export interface RecordedRequest {
  url: string
  method: string
  headers: IncomingHttpHeaders
  body: string
  /** Whether the connection closed before the response was complete. */
  closedEarly: boolean
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
 * a 302 to `KIRBY_REDIRECT_LOCATION`, in `/gzip` `KIRBY_GZIP_BODY` compressed, in `/reset` a
 * closed connection, in `/stream` one chunk and no end, in `/binary` `KIRBY_BINARY_BODY`, and in
 * `/empty` a 204.
 */
export async function startKirbyStandIn({ delay = 0 } = {}): Promise<KirbyStandIn> {
  const requests: RecordedRequest[] = []
  const server = createServer(async (request, response) => {
    const url = request.url!
    const { pathname } = new URL(url, 'http://kirby')
    const method = request.method!
    // Recorded before the body arrives, so that a request cut off during its upload shows up too.
    const recorded: RecordedRequest = {
      url,
      method,
      headers: request.headers,
      body: '',
      closedEarly: false,
    }
    const requestNumber = requests.push(recorded)
    response.once('close', () => {
      recorded.closedEarly = !response.writableFinished
    })

    const chunks: Buffer[] = []
    try {
      for await (const chunk of request)
        chunks.push(chunk)
    }
    catch {
      return
    }

    const body = Buffer.concat(chunks).toString()
    recorded.body = body
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

    if (pathname.endsWith('/empty')) {
      response.statusCode = 204
      response.end()
      return
    }

    if (pathname.endsWith('/binary')) {
      response.setHeader('content-type', 'application/octet-stream')
      response.end(KIRBY_BINARY_BODY)
      return
    }

    if (pathname.endsWith('/stream')) {
      response.write('chunk')
      return
    }

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
