import express from 'express'

import { Cache } from '../lib/cache'

/**
 * Create the router for retrieving API status information.
 *
 * @param {Cache} cache The cache object.
 * @returns {express.Router} The router object.
 */
export function defaultRoute (cache: Cache): express.Router {
  const router = express.Router()

  router.get('/', (req, res) => {
    res.status(200).json({ success: true, data: {} })
  })

  return router
}
