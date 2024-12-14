import { CanteensController } from '../controllers/canteens-controller.js'
import type { FastifyPluginAsync } from 'fastify'
import { sendResult } from '../response.js'

/**
 * Create the routes for retrieving canteen information.
 *
 * @returns A Fastify plugin.
 */
export const canteensRoute = (): FastifyPluginAsync => async (app) => {
  const controller = new CanteensController()

  app.get('/', async (req, reply) => {
    await sendResult(reply, await controller.getAll())
  })

  app.get<{ Params: { canteenId: string } }>('/:canteenId', async (req, reply) => {
    await sendResult(reply, await controller.getOne(req.params.canteenId))
  })

  app.get<{ Params: { canteenId: string } }>('/:canteenId/lines', async (req, reply) => {
    await sendResult(reply, await controller.getLines(req.params.canteenId))
  })

  app.get<{ Params: { canteenId: string, lineId: string } }>('/:canteenId/lines/:lineId', async (req, reply) => {
    await sendResult(reply, await controller.getLine(req.params.canteenId, req.params.lineId))
  })
}
