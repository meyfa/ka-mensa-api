"use strict";

const path = require("path");

module.exports = {
    /**
     * Config options for the HTTP server.
     * @type {Object}
     */
    server: {
        /**
         * Address to listen on, e.g. :: (or 0.0.0.0) for all addresses,
         * ::1 (or 127.0.0.1) for localhost only (use case: reverse proxy), etc.
         * @type {String}
         */
        host: "::",
        /**
         * Port to listen on.
         * @type {Number}
         */
        port: 8080,
        /**
         * Base path as sent in requests (usually /, but can also be /api etc.).
         * MUST START AND END WITH SLASH '/'
         * @type {String}
         */
        base: "/",
    },

    /**
     * Cache options.
     * @type {Object}
     */
    cache: {
        /**
         * Cache base path.
         * @type {String}
         */
        directory: path.join(__dirname, "./cache"),
    },

    /**
     * Options for the fetch job.
     * @type {Object}
     */
    fetchJob: {
        /**
         * Time between runs of the fetcher.
         * @type {String}
         */
        interval: "6 hours",
        /**
         * How many days into the future to fetch.
         * @type {Number}
         */
        futureDays: 14,
    },
};
