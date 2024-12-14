import { onTermination } from 'omniwheel'
import type { Cache } from './cache.js'
import fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { sendError } from './response.js'
import { ApiError, BadRequestError, InternalServerError, NotFoundError } from './errors.js'
import { defaultRoute } from './routes/default.js'
import { metaRoute } from './routes/meta/index.js'
import { canteensRoute } from './routes/canteens.js'
import { plansRoute } from './routes/plans.js'
import { Logger } from 'winston'

/**
 * Options for the HTTP server.
 */
export interface HttpServerOptions {
  host: string
  port: number
  allowOrigin?: string
}

/**
 * Start the web server.
 *
 * @param logger The logger to use.
 * @param cache The plan cache to use.
 * @param options Options for the HTTP server.
 * @returns The Fastify instance.
 */
export async function startServer (logger: Logger, cache: Cache, options: HttpServerOptions): Promise<FastifyInstance> {
  const { host, port, allowOrigin } = options

  const app = fastify()

  // CORS
  if (allowOrigin != null) {
    await app.register(cors, { origin: allowOrigin })
  }

  // error handling
  app.setErrorHandler(async (error, req, reply) => {
    if (error instanceof SyntaxError && error.statusCode != null && error.statusCode >= 400 && error.statusCode < 500) {
      // JSON input error
      return await sendError(reply, new BadRequestError('malformed input'))
    } else if (error instanceof ApiError) {
      // one of our own errors
      return await sendError(reply, error)
    } else {
      logger.error(error)
      return await sendError(reply, new InternalServerError())
    }
  })
  app.setNotFoundHandler(async (req, reply) => await sendError(reply, new NotFoundError('route')))

  // routes
  await app.register(defaultRoute(), { prefix: '/' })
  await app.register(metaRoute(), { prefix: '/meta' })
  await app.register(canteensRoute(), { prefix: '/canteens' })
  await app.register(plansRoute(cache), { prefix: '/plans' })

  await app.listen({ port, host })

  logger.info(`Server listening on :${port}`)

  onTermination(async () => await app.close())

  return await app
}
