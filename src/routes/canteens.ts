import { Request, Router } from 'express'
import { Cache } from '../cache.js'
import { CanteensController } from '../controllers/canteens-controller.js'
import { createHandler } from '../create-handler.js'

/**
 * Create the router for retrieving canteen information.
 *
 * @param cache The cache object.
 * @returns The router object.
 */
export function canteensRoute (cache: Cache): Router {
  const controller = new CanteensController()

  const router = Router()

  router.get('/', createHandler(async () => await controller.getAll()))

  router.get('/:canteenId', createHandler(async (req: Request) => {
    return await controller.getOne(req.params.canteenId)
  }))

  router.get('/:canteenId/lines', createHandler(async (req: Request) => {
    return await controller.getLines(req.params.canteenId)
  }))

  router.get('/:canteenId/lines/:lineId', createHandler(async (req: Request) => {
    return await controller.getLine(req.params.canteenId, req.params.lineId)
  }))

  return router
}
