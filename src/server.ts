import fastify from 'fastify'
import cors from '@fastify/cors'
import ms from 'ms'
import { DirectoryAdapter } from 'fs-adapters'
import config from './config.js'
import { Cache } from './cache.js'
import { runFetchJob } from './job.js'
import { logger } from './logger.js'
import { onTermination } from 'omniwheel'
import { fixupCache } from './fixup.js'
import { formatDate } from './util/date-format.js'
import path from 'node:path'
import { sendError } from './response.js'
import { ApiError, BadRequestError, InternalServerError, NotFoundError } from './errors.js'
import { defaultRoute } from './routes/default.js'
import { metaRoute } from './routes/meta/index.js'
import { canteensRoute } from './routes/canteens.js'
import { plansRoute } from './routes/plans.js'

const FIXUP_DRY_RUN = false
const DEFAULT_CACHE_DIRECTORY = path.resolve('./cache')

/**
 * Determine the absolute path to the cache directory from the environment variables. This will fall back to a default
 * cache path if the env var is not set.
 *
 * @returns The absolute cache directory path to use.
 */
function getCacheDirectory (): string {
  const directory = process.env.MENSA_CACHE_DIRECTORY
  return directory != null && directory !== ''
    ? path.resolve(directory)
    : DEFAULT_CACHE_DIRECTORY
}

/**
 * Determine the CORS origin to allow from the environment variables.
 * This function will return a string if (and only if) the option is set and is not empty.
 *
 * @returns The origin value, if it is valid, and undefined otherwise.
 */
function getAllowOrigin (): string | undefined {
  const allowOrigin = process.env.MENSA_CORS_ALLOWORIGIN
  return allowOrigin != null && allowOrigin !== ''
    ? allowOrigin
    : undefined
}

/**
 * Perform a full fixup on the given cache. This fills in missing data that might have been missing at cache time but
 * is now inferrable due to an updated data set.
 *
 * @param cache The cache to operate on.
 */
async function fixupCachedFiles (cache: Cache): Promise<void> {
  await fixupCache(cache, (date) => {
    logger.info(`fixup ${formatDate(date)}`)
    return !FIXUP_DRY_RUN
  })
}

/**
 * Run a fetch job in the background, with the interval set in the config.
 *
 * @param cache The plan cache to use.
 */
async function startFetchJob (cache: Cache): Promise<void> {
  const period = ms(config.fetchJob.interval)

  // run the job once immediately, and then repeatedly
  await runFetchJob(cache)
  const interval = setInterval(() => {
    void runFetchJob(cache)
  }, period)

  onTermination(() => clearInterval(interval))
}

/**
 * Start the web server.
 *
 * @param cache The plan cache to use.
 */
async function startServer (cache: Cache): Promise<void> {
  const app = fastify()

  // CORS
  const allowOrigin = getAllowOrigin()
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

  const port = config.server.port
  const host = config.server.host
  await app.listen({ port, host })

  logger.info(`Server listening on :${port}`)

  onTermination(async () => await app.close())
}

/**
 * Application entrypoint.
 */
async function main (): Promise<void> {
  const cacheDirectory = getCacheDirectory()
  logger.info(`Using cache directory "${cacheDirectory}"`)

  const fsAdapter = new DirectoryAdapter(cacheDirectory)
  await fsAdapter.init()

  const cache = new Cache(fsAdapter)

  await fixupCachedFiles(cache)
  await startFetchJob(cache)
  await startServer(cache)
}

await main()
