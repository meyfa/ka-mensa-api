import { FastifyPluginAsync } from 'fastify'
import { sendResult } from '../response.js'

/**
 * Create the routes for retrieving API status information.
 *
 * @returns A Fastify plugin.
 */
export const defaultRoute = (): FastifyPluginAsync => async (app) => {
  app.get('/', async (req, reply) => {
    await sendResult(reply, {})
  })
}
