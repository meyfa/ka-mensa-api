import { Router } from 'express'
import { Cache } from '../../cache.js'
import { LegendController } from '../../controllers/legend-controller.js'
import { createHandler } from '../../create-handler.js'

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
