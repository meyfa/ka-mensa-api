'use strict'

const express = require('express')

// ROUTES

const router = express.Router()

router.get('/', async (req, res, next) => {
  res.status(200).json({ success: true, data: {} })
})

// EXPORTS

module.exports = router
