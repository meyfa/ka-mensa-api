'use strict'

const express = require('express')
const canteens = require('ka-mensa-fetch/data/canteens.json')

const parseDate = require('../lib/util/parse-date')

// CONSTANTS

const CANTEEN_IDS = canteens.map(({ id }) => id)

// MAPPER

/**
 * Map the raw plan data into a presentable format.
 *
 * @param {object} raw The plan data.
 * @returns {object} The mapped plan.
 */
function mapPlan (raw) {
  return {
    date: raw.date,
    canteen: {
      id: raw.id,
      name: raw.name
    },
    lines: raw.lines
  }
}

// UTILITY METHODS

/**
 * Convert a comma-delimited string into an array of unique entries,
 * which must all be contained in the set of allowed values.
 *
 * @param {string} str The string to parse (e,g, 'foo,bar')
 * @param {string[]} allowedValues The allowed set (e.g. ['foo', 'bar']).
 * @returns {string[]|null} The entries, or null if parsing failed.
 */
function parseCommaFilter (str, allowedValues) {
  if (!str) {
    return null
  }
  const items = [...new Set(str.split(','))]
  return items.every(item => allowedValues.includes(item)) ? items : null
}

// ROUTES FACTORY

module.exports = (cache) => {
  const router = express.Router()

  router.get('/', async (req, res, next) => {
    const dates = await cache.list()
    const results = dates.map(date => ({ date }))
    res.status(200).json({ success: true, data: results })
  })

  router.get('/:date(\\d{4}-\\d{2}-\\d{2})', async (req, res, next) => {
    const dateObj = parseDate(req.params.date)
    if (!dateObj) {
      res.status(400).json({ success: false, error: 'malformed date' })
      return
    }

    let data = await cache.get(dateObj)
    if (!data) {
      res.status(404).json({ success: false, error: 'plan not found' })
      return
    }

    if (req.query.canteens) {
      const canteensFilter = parseCommaFilter(req.query.canteens, CANTEEN_IDS)
      if (!canteensFilter) {
        res.status(400).json({ success: false, error: 'invalid filter: canteens' })
        return
      }
      data = data.filter(entry => canteensFilter.includes(entry.id))
    }

    const results = data.map(mapPlan)
    res.status(200).json({ success: true, data: results })
  })

  return router
}
