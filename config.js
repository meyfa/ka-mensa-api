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
     * The data source to be used by the fetch job.
     * Either 'handicap' (the default) or 'jsonapi' (more reliable, but slightly
     * different output and requires authentication).
     *
     * @type {string}
     */
    source: 'handicap',
    handicapOptions: {
      /**
       * How many days into the future to fetch when using the handicap source.
       *
       * @type {number}
       */
      futureDays: 14
    },
    jsonapiOptions: {
      /**
       * Mandatory authentication credentials for the JSON API.
       *
       * @type {object}
       */
      auth: {
        user: '',
        password: ''
      }
    }
  }
}
