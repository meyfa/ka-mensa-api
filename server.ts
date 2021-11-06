import express from 'express'
import ms from 'ms'
import cors from 'cors'
import { DirectoryAdapter } from 'fs-adapters'

import config from './config'
import { Cache } from './lib/cache'
import { runFetchJob } from './lib/job'
import { indexRoute } from './routes'
import { logger } from './logger'

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
  if (config.server.cors?.allowOrigin != null && config.server.cors.allowOrigin !== '') {
    app.use(cors({
      origin: config.server.cors.allowOrigin
    }))
  }
  app.use(config.server.base, indexRoute(cache))

  // listen
  const port = config.server.port
  const host = config.server.host
  app.listen(port, host, () => {
    logger.log('info', `server listening on :${port}`)
  })
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
start()
