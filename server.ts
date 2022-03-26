import express from 'express'
import ms from 'ms'
import cors from 'cors'
import { DirectoryAdapter } from 'fs-adapters'
import config from './config.js'
import { Cache } from './lib/cache.js'
import { runFetchJob } from './lib/job.js'
import { indexRoute } from './routes/index.js'
import { logger } from './lib/logger.js'
import { onTermination, promisifiedClose, promisifiedListen } from 'omniwheel'

/**
 * Determine the CORS origin to allow, from either the environment variables or the config.
 * This function will return a string if and only if the option is set and is not empty.
 *
 * @returns The origin value, if it is valid, and undefined otherwise.
 */
function getAllowOrigin (): string | undefined {
  return [
    process.env.API_SERVER_CORS_ALLOWORIGIN,
    config.server.cors?.allowOrigin
  ].find(value => value != null && value !== '')
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

  logger.log('info', `Server listening on :${port}`)

  onTermination(async () => await promisifiedClose(server))
}

/**
 * Application entrypoint.
 */
async function main (): Promise<void> {
  const fsAdapter = new DirectoryAdapter(config.cache.directory)
  await fsAdapter.init()

  const cache = new Cache(fsAdapter)

  await startFetchJob(cache)
  await startServer(cache)
}

void main()
