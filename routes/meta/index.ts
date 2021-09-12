import { Router } from 'express'

import { Cache } from '../../lib/cache'
import { legendRoute } from './legend'

/**
 * Create the router that combines meta information routes.
 *
 * @param {Cache} cache The cache object.
 * @returns {Router} The router object.
 */
export function metaRoute (cache: Cache): Router {
  const router = Router()

  router.use('/legend', legendRoute(cache))

  return router
}
