'use strict'

const winston = require('winston')
const express = require('express')
const ms = require('ms')

const config = require('./config')
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
  // setup fetch job
  const fetchInterval = ms(config.fetchJob.interval)
  await runFetchJob(logger)
  setInterval(() => runFetchJob(logger), fetchInterval)

  const app = express()

  // routes
  const router = express.Router()
  router.use('/', require('./routes/default'))
  router.use('/meta', require('./routes/meta'))
  router.use('/canteens', require('./routes/canteens'))
  router.use('/plans', require('./routes/plans'))
  app.use(config.server.base, router)

  // listen
  const port = config.server.port
  const host = config.server.host
  app.listen(port, host, () => {
    logger.log('info', 'server listening on :' + port)
  })
})()
