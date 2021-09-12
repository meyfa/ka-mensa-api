import { Router } from 'express'

import { Cache } from '../lib/cache'
import { createHandler } from '../lib/create-handler'

/**
 * Create the router for retrieving API status information.
 *
 * @param cache The cache object.
 * @returns The router object.
 */
export function defaultRoute (cache: Cache): Router {
  const router = Router()
  router.get('/', createHandler(() => ({})))
  return router
}
