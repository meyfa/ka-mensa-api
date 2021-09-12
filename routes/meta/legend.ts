import express from 'express'

import legend from 'ka-mensa-fetch/data/legend.json'

import { Cache } from '../../lib/cache'

/**
 * Create the router for retrieving legend meta information.
 *
 * @param {Cache} cache The cache object.
 * @returns {express.Router} The router object.
 */
export function legendRoute (cache: Cache): express.Router {
  const router = express.Router()

  router.get('/', (req, res) => {
    res.status(200).json({ success: true, data: legend })
  })

  return router
}
