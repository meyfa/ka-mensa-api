'use strict'

const path = require('path')

module.exports = {
  server: {
    /**
     * Address to listen on, e.g. :: (or 0.0.0.0) for all addresses,
     * ::1 (or 127.0.0.1) for localhost only (use case: reverse proxy), etc.
     *
     * @type {string}
     */
    host: '::',
    /**
     * Port to listen on.
     *
     * @type {number}
     */
    port: 8080,
    /**
     * Base path as sent in requests (usually /, but can also be /api etc.).
     * MUST START AND END WITH SLASH '/'
     *
     * @type {string}
     */
    base: '/'
  },

  cache: {
    /**
     * Cache base path.
     *
     * @type {string}
     */
    directory: path.join(__dirname, './cache')
  },

  fetchJob: {
    /**
     * Time between runs of the fetcher.
     *
     * @type {string}
     */
    interval: '6 hours',
    /**
     * How many days into the future to fetch.
     *
     * @type {number}
     */
    futureDays: 14
  }
}
