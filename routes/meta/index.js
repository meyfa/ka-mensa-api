'use strict'

const express = require('express')

// ROUTES FACTORY

module.exports = (cache) => {
  const router = express.Router()

  router.use('/legend', require('./legend')(cache))

  return router
}
