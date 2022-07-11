import { Router } from 'express'
import { Cache } from '../cache.js'
import { defaultRoute } from './default.js'
import { metaRoute } from './meta/index.js'
import { canteensRoute } from './canteens.js'
import { plansRoute } from './plans.js'
import { createHandler } from '../create-handler.js'
import { NotFoundError } from '../errors.js'

/**
 * Create the router that combines all other routes.
 *
 * @param cache The cache object.
 * @returns The router object.
 */
export function indexRoute (cache: Cache): Router {
  const router = Router()

  router.use('/', defaultRoute(cache))
  router.use('/meta', metaRoute(cache))
  router.use('/canteens', canteensRoute(cache))
  router.use('/plans', plansRoute(cache))

  // 404 fallback
  router.use(createHandler(() => {
    throw new NotFoundError('resource')
  }))

  return router
}
