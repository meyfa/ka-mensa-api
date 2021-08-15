'use strict'

const { requestSessionCookie } = require('ka-mensa-fetch')
const ms = require('ms')

// CONSTANTS

/**
 * Session cookie lifetime duration, i.e. time before requesting another.
 *
 * @type {number}
 */
// The cookie is assumed to live for at least 30 minutes
const COOKIE_TIMEOUT = ms('29min')

// STATE

let cookieValue = null
let cookieTime = 0

// MAIN EXPORT

/**
 * Obtain the session cookie to use. This may return null on failure. It will
 * return a cached cookie when available, but if no cookie is available yet or
 * it has reached its lifetime, a fresh cookie will be requested instead.
 *
 * @returns {Promise} Resolves to a cookie value.
 */
async function getSessionCookie () {
  if (Date.now() - cookieTime < COOKIE_TIMEOUT) {
    return cookieValue
  }

  cookieValue = await requestSessionCookie()
  cookieTime = Date.now()

  return cookieValue
}

module.exports = getSessionCookie
