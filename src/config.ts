export default {
  server: {
    /**
     * Address to listen on, e.g. :: (or 0.0.0.0) for all addresses,
     * ::1 (or 127.0.0.1) for localhost only (use case: reverse proxy), etc.
     */
    host: '::',
    /**
     * Port to listen on.
     */
    port: 8080,
    /**
     * Base path as sent in requests (usually /, but can also be /api etc.).
     */
    base: '/',
    /**
     * Cross-Origin settings.
     */
    cors: {
      /**
       * The domains from which requests can be made to this API
       * (the Access-Control-Allow-Origin header). Set to '*' to allow any origin,
       * or set to a single origin such as 'https://example.com'.
       * A value of '' or null will disallow CORS.
       */
      allowOrigin: ''
    }
  },

  fetchJob: {
    /**
     * Time between runs of the fetcher.
     */
    interval: '6 hours',
    /**
     * The data source to be used by the fetch job.
     * Either 'simplesite' (the default) or 'jsonapi' (more reliable, but slightly
     * different output and requires authentication).
     */
    source: 'simplesite',
    simplesiteOptions: {
      /**
       * How many days into the future to fetch when using the simplesite source.
       */
      futureDays: 14
    },
    jsonapiOptions: {
      /**
       * Mandatory authentication credentials for the JSON API.
       */
      auth: {
        user: '',
        password: ''
      }
    }
  }
}
