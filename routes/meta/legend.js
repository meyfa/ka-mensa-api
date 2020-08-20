'use strict'

const express = require('express')

const legend = require('ka-mensa-fetch/data/legend.json')

// ROUTES

const router = express.Router()

router.get('/', async (req, res, next) => {
  res.status(200).json({ success: true, data: legend })
})

// EXPORTS

module.exports = router
