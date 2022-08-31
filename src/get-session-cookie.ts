import { requestSessionCookie } from 'ka-mensa-fetch'
import ms from 'ms'

/**
 * Session cookie lifetime duration, i.e. time before requesting another.
 */
// The cookie is assumed to live for at least 30 minutes
const COOKIE_TIMEOUT = ms('29min')

let cookieValue: string | undefined
let cookieTime = 0

/**
 * Obtain the session cookie to use. This may return undefined on failure. It will
 * return a cached cookie when available, but if no cookie is available yet or
 * it has reached its lifetime, a fresh cookie will be requested instead.
 *
 * @returns Resolves to a cookie value.
 */
export async function getSessionCookie (): Promise<string | undefined> {
  if (Date.now() - cookieTime < COOKIE_TIMEOUT) {
    return cookieValue
  }

  cookieValue = await requestSessionCookie()
  cookieTime = Date.now()

  return cookieValue
}
