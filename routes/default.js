'use strict'

const express = require('express')

// ROUTES FACTORY

module.exports = (cache) => {
  const router = express.Router()

  router.get('/', async (req, res, next) => {
    res.status(200).json({ success: true, data: {} })
  })

  return router
}
