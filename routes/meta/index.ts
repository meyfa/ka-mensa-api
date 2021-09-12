import express from 'express'

import { Cache } from '../../lib/cache'
import { legendRoute } from './legend'

/**
 * Create the router that combines meta information routes.
 *
 * @param {Cache} cache The cache object.
 * @returns {express.Router} The router object.
 */
export function metaRoute (cache: Cache): express.Router {
  const router = express.Router()

  router.use('/legend', legendRoute(cache))

  return router
}
