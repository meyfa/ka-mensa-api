import express from 'express'
import ms from 'ms'
import cors from 'cors'
import { DirectoryAdapter } from 'fs-adapters'
import config from './config.js'
import { Cache } from './cache.js'
import { runFetchJob } from './job.js'
import { indexRoute } from './routes/index.js'
import { logger } from './logger.js'
import { onTermination, promisifiedClose, promisifiedListen } from 'omniwheel'
import { fixupCache } from './fixup.js'
import { formatDate } from './util/date-format.js'
import path from 'node:path'

const FIXUP_DRY_RUN = false
const DEFAULT_CACHE_DIRECTORY = path.resolve('./cache')

/**
 * Determine the absolute path to the cache directory, from either the environment variables or the config.
 * If the option is not configured, a default path will be returned.
 *
 * @returns The absolute cache directory path to use.
 */
function getCacheDirectory (): string {
  const directory = process.env.MENSA_CACHE_DIRECTORY
  if (directory != null && directory !== '') {
    return path.resolve(directory)
  }
  return DEFAULT_CACHE_DIRECTORY
}

/**
 * Determine the CORS origin to allow, from either the environment variables or the config.
 * This function will return a string if and only if the option is set and is not empty.
 *
 * @returns The origin value, if it is valid, and undefined otherwise.
 */
function getAllowOrigin (): string | undefined {
  return [
    process.env.MENSA_CORS_ALLOWORIGIN,
    config.server.cors?.allowOrigin
  ].find(value => value != null && value !== '')
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
  const app = express()
  const allowOrigin = getAllowOrigin()
  if (allowOrigin != null) {
    app.use(cors({ origin: allowOrigin }))
  }
  app.use(config.server.base, indexRoute(cache))

  const port = config.server.port
  const host = config.server.host
  const server = await promisifiedListen(app, port, host)

  logger.info(`Server listening on :${port}`)

  onTermination(async () => await promisifiedClose(server))
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

void main()
