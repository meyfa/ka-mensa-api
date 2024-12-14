import { DirectoryAdapter } from 'fs-adapters'
import { type Config, getConfig } from './config.js'
import { Cache } from './cache.js'
import { runFetchJob } from './job.js'
import { onTermination } from 'omniwheel'
import { fixupCache } from './fixup.js'
import { formatDate } from './util/date-format.js'
import { startServer } from './http-server.js'
import winston from 'winston'

const FIXUP_DRY_RUN = false

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
 * @param config The application config.
 * @param cache The plan cache to use.
 */
async function startFetchJob (config: Config, cache: Cache): Promise<void> {
  // run the job once immediately, and then repeatedly
  await runFetchJob(config, logger, cache)
  const interval = setInterval(() => {
    void runFetchJob(config, logger, cache)
  }, config.fetch.interval)

  onTermination(() => clearInterval(interval))
}

/**
 * Application entrypoint.
 */
async function main (): Promise<void> {
  const config = getConfig()

  logger.info(`Using cache directory "${config.cacheDirectory}"`)

  const fsAdapter = new DirectoryAdapter(config.cacheDirectory)
  await fsAdapter.init()

  const cache = new Cache(fsAdapter)

  await fixupCachedFiles(cache)
  await startFetchJob(config, cache)
  await startServer(logger, cache, {
    host: config.server.host,
    port: config.server.port,
    allowOrigin: config.corsAllowOrigin
  })
}

await main()
