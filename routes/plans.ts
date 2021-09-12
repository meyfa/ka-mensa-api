import express from 'express'

import canteens from 'ka-mensa-fetch/data/canteens.json'

import { Cache } from '../lib/cache'
import { parseDate } from '../lib/util/parse-date'
import { CanteenPlan } from 'ka-mensa-fetch'

// CONSTANTS

const CANTEEN_IDS = canteens.map(({ id }) => id)

// MAPPER

/**
 * Map the raw plan data into a presentable format.
 *
 * @param {object} raw The plan data.
 * @returns {object} The mapped plan.
 */
function mapPlan (raw: CanteenPlan): Record<string, any> {
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
 * @returns {string[] | undefined} The entries, or undefined if parsing failed.
 */
function parseCommaFilter (str: string, allowedValues: string[]): string[] | undefined {
  if (str == null || str.length === 0) {
    return undefined
  }
  const items = [...new Set(str.split(','))]
  return items.every(item => allowedValues.includes(item)) ? items : undefined
}

// ROUTES FACTORY

/**
 * Create the router for retrieving plan information.
 *
 * @param {Cache} cache The cache object.
 * @returns {express.Router} The router object.
 */
export function plansRoute (cache: Cache): express.Router {
  const router = express.Router()

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.get('/', async (req, res) => {
    const dates = await cache.list()
    const results = dates.map(date => ({ date }))
    res.status(200).json({ success: true, data: results })
  })

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.get('/:date(\\d{4}-\\d{2}-\\d{2})', async (req, res) => {
    const dateObj = parseDate(req.params.date)
    if (dateObj == null) {
      res.status(400).json({ success: false, error: 'malformed date' })
      return
    }

    let data = await cache.get(dateObj)
    if (data == null) {
      res.status(404).json({ success: false, error: 'plan not found' })
      return
    }

    if (req.query.canteens != null) {
      const canteensFilter = typeof req.query.canteens === 'string'
        ? parseCommaFilter(req.query.canteens, CANTEEN_IDS)
        : undefined
      if (canteensFilter == null) {
        res.status(400).json({ success: false, error: 'invalid filter: canteens' })
        return
      }
      data = data.filter(entry => entry.id != null && canteensFilter.includes(entry.id))
    }

    const results = data.map(mapPlan)
    res.status(200).json({ success: true, data: results })
  })

  return router
}
