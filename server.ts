import { constants } from 'node:os'
import express from 'express'
import ms from 'ms'
import cors from 'cors'
import { DirectoryAdapter } from 'fs-adapters'
import config from './config.js'
import { Cache } from './lib/cache.js'
import { runFetchJob } from './lib/job.js'
import { indexRoute } from './routes/index.js'
import { logger } from './lib/logger.js'

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
 * Something that runs asynchronously in the background, such as a web server or timed job.
 */
interface Service {
  /**
   * Shut down the service.
   */
  readonly stop: () => void | Promise<void>
}

/**
 * Run a fetch job in the background, with the interval set in the config.
 *
 * @param cache The plan cache to use.
 * @returns The job that was started.
 */
async function startFetchJob (cache: Cache): Promise<Service> {
  const period = ms(config.fetchJob.interval)

  // run the job once immediately, and then repeatedly
  await runFetchJob(cache)
  const interval = setInterval(() => {
    void runFetchJob(cache)
  }, period)

  return {
    stop: () => clearInterval(interval)
  }
}

/**
 * Start the web server.
 *
 * @param cache The plan cache to use.
 * @returns The server that was started.
 */
async function startServer (cache: Cache): Promise<Service> {
  const app = express()
  const allowOrigin = getAllowOrigin()
  if (allowOrigin != null) {
    app.use(cors({ origin: allowOrigin }))
  }
  app.use(config.server.base, indexRoute(cache))

  const port = config.server.port
  const host = config.server.host

  const server = app.listen(port, host, () => {
    logger.log('info', `server listening on :${port}`)
  })

  return {
    async stop () {
      return await new Promise((resolve) => {
        server.close(() => resolve())
      })
    }
  }
}

/**
 * Application entrypoint.
 */
async function main (): Promise<void> {
  // set up our exit strategy as early as possible, so we can still abort when something hangs during startup
  const activeServices: Service[] = []
  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.once(signal, () => {
      console.log(`Received ${signal}, exiting`)
      void Promise.all(activeServices.map(async (service) => await service.stop())).then(() => {
        // process exit code is typically 128+signal on Linux, such as 143 for SIGTERM
        process.exit(128 + constants.signals[signal])
      })
    })
  }

  const fsAdapter = new DirectoryAdapter(config.cache.directory)
  await fsAdapter.init()

  const cache = new Cache(fsAdapter)

  activeServices.push(await startFetchJob(cache))
  activeServices.push(await startServer(cache))
}

void main()
