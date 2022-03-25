import { Router } from 'express'
import { Cache } from '../../lib/cache.js'
import { legendRoute } from './legend.js'

/**
 * Create the router that combines meta information routes.
 *
 * @param cache The cache object.
 * @returns The router object.
 */
export function metaRoute (cache: Cache): Router {
  const router = Router()

  router.use('/legend', legendRoute(cache))

  return router
}
