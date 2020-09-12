'use strict'

const winston = require('winston')
const express = require('express')
const ms = require('ms')
const { DirectoryAdapter } = require('fs-adapters')

const config = require('./config')
const Cache = require('./lib/cache')
const runFetchJob = require('./lib/job')

// LOG

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`
    })
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// STARTUP ROUTINE

(async () => {
  const fsAdapter = new DirectoryAdapter(config.cache.directory)
  await fsAdapter.init()

  const cache = new Cache(fsAdapter)

  // setup fetch job
  const fetchInterval = ms(config.fetchJob.interval)
  await runFetchJob(cache, logger)
  setInterval(() => runFetchJob(cache, logger), fetchInterval)

  const app = express()

  // routes
  const router = express.Router()
  router.use('/', require('./routes/default')(cache))
  router.use('/meta', require('./routes/meta')(cache))
  router.use('/canteens', require('./routes/canteens')(cache))
  router.use('/plans', require('./routes/plans')(cache))
  app.use(config.server.base, router)

  // listen
  const port = config.server.port
  const host = config.server.host
  app.listen(port, host, () => {
    logger.log('info', 'server listening on :' + port)
  })
})()
