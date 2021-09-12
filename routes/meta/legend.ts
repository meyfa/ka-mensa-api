import { Router } from 'express'

import { Cache } from '../../lib/cache'
import { LegendController } from '../../controllers/legend-controller'
import { createHandler } from '../../lib/controller-handler'

/**
 * Create the router for retrieving legend meta information.
 *
 * @param cache The cache object.
 * @returns The router object.
 */
export function legendRoute (cache: Cache): Router {
  const controller = new LegendController()

  const router = Router()

  router.get('/', createHandler(async () => await controller.getLegend()))

  return router
}
