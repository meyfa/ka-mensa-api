import { Router } from 'express'

import { Cache } from '../lib/cache'

import { defaultRoute } from './default'
import { metaRoute } from './meta'
import { canteensRoute } from './canteens'
import { plansRoute } from './plans'
import { createHandler } from '../lib/create-handler'
import { NotFoundError } from '../lib/errors'

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
