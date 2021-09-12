import express from 'express'

import { Cache } from '../lib/cache'

import { defaultRoute } from './default'
import { metaRoute } from './meta'
import { canteensRoute } from './canteens'
import { plansRoute } from './plans'

/**
 * Create the router that combines all other routes.
 *
 * @param {Cache} cache The cache object.
 * @returns {express.Router} The router object.
 */
export function indexRoute (cache: Cache): express.Router {
  const router = express.Router()

  router.use('/', defaultRoute(cache))
  router.use('/meta', metaRoute(cache))
  router.use('/canteens', canteensRoute(cache))
  router.use('/plans', plansRoute(cache))

  return router
}
