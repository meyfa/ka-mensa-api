import express from 'express'
import ms from 'ms'
import cors from 'cors'
import { DirectoryAdapter } from 'fs-adapters'

import config from './config'
import { Cache } from './lib/cache'
import { runFetchJob } from './lib/job'
import { indexRoute } from './routes'
import { logger } from './lib/logger'

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
 * Start the server.
 */
async function start (): Promise<void> {
  const fsAdapter = new DirectoryAdapter(config.cache.directory)
  await fsAdapter.init()

  const cache = new Cache(fsAdapter)

  // setup fetch job
  const fetchInterval = ms(config.fetchJob.interval)
  await runFetchJob(cache)
  setInterval(() => runFetchJob(cache) as any, fetchInterval)

  // setup server and routes
  const app = express()
  const allowOrigin = getAllowOrigin()
  if (allowOrigin != null) {
    app.use(cors({ origin: allowOrigin }))
  }
  app.use(config.server.base, indexRoute(cache))

  // listen
  const port = config.server.port
  const host = config.server.host
  app.listen(port, host, () => {
    logger.log('info', `server listening on :${port}`)
  })
}

void start()
