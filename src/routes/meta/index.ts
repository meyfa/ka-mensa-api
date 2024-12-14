import { legendRoute } from './legend.js'
import type { FastifyPluginAsync } from 'fastify'

/**
 * Create the route that combines meta information routes.
 *
 * @returns A Fastify plugin.
 */
export const metaRoute = (): FastifyPluginAsync => async (app) => {
  await app.register(legendRoute(), { prefix: '/legend' })
}
