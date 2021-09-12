import { Request, Response, Router } from 'express'

import legend from 'ka-mensa-fetch/data/legend.json'

import { Cache } from '../../lib/cache'

/**
 * Create the router for retrieving legend meta information.
 *
 * @param {Cache} cache The cache object.
 * @returns {Router} The router object.
 */
export function legendRoute (cache: Cache): Router {
  const router = Router()

  router.get('/', (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: legend })
  })

  return router
}
