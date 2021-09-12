import { Request, Response, Router } from 'express'

import { Cache } from '../lib/cache'

/**
 * Create the router for retrieving API status information.
 *
 * @param cache The cache object.
 * @returns The router object.
 */
export function defaultRoute (cache: Cache): Router {
  const router = Router()

  router.get('/', (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: {} })
  })

  return router
}
