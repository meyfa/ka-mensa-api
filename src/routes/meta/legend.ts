import { LegendController } from '../../controllers/legend-controller.js'
import { FastifyPluginAsync } from 'fastify'
import { sendResult } from '../../response.js'

/**
 * Create the routes for retrieving legend meta information.
 *
 * @returns A Fastify plugin.
 */
export const legendRoute = (): FastifyPluginAsync => async (app) => {
  const controller = new LegendController()

  app.get('/', async (req, reply) => {
    await sendResult(reply, await controller.getLegend())
  })
}
