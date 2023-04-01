import ms from 'ms'
import { DirectoryAdapter } from 'fs-adapters'
import config from './config.js'
import { Cache } from './cache.js'
import { runFetchJob } from './job.js'
import { onTermination } from 'omniwheel'
import { fixupCache } from './fixup.js'
import { formatDate } from './util/date-format.js'
import path from 'node:path'
import { startServer } from './http-server.js'
import winston from 'winston'

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
 * The global logger instance.
 */
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => {
      const { timestamp, level, message } = info as { timestamp: string, level: string, message: string }
      return `${timestamp} ${level}: ${message}`
    })
  ),
  transports: [
    new winston.transports.Console()
  ]
})

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
  await runFetchJob(logger, cache)
  const interval = setInterval(() => {
    void runFetchJob(logger, cache)
  }, period)

  onTermination(() => clearInterval(interval))
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
  await startServer(logger, cache, { allowOrigin: getAllowOrigin() })
}

await main()
