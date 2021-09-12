import { Request, Response, Router } from 'express'

import canteens from 'ka-mensa-fetch/data/canteens.json'

import { Cache } from '../lib/cache'

// CONSTANTS

/**
 * A map: canteen id -> canteen object.
 *
 * @type {Map}
 */
const CANTEENS_BY_ID = new Map(canteens.map(canteen => [canteen.id, canteen]))

/**
 * A map: canteen id -> (map: line id -> line object).
 *
 * @type {Map}
 */
const CANTEEN_LINES_BY_ID = new Map(canteens.map(canteen => [
  canteen.id,
  new Map(canteen.lines.map(line => [line.id, line]))
]))

// ROUTES FACTORY

/**
 * Create the router for retrieving canteen information.
 *
 * @param {Cache} cache The cache object.
 * @returns {Router} The router object.
 */
export function canteensRoute (cache: Cache): Router {
  const router = Router()

  router.get('/', (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: canteens })
  })

  router.get('/:canteenId', (req: Request, res: Response) => {
    const canteen = CANTEENS_BY_ID.get(req.params.canteenId)
    if (canteen == null) {
      res.status(404).json({ success: false, error: 'canteen not found' })
      return
    }
    res.status(200).json({ success: true, data: canteen })
  })

  router.get('/:canteenId/lines', (req: Request, res: Response) => {
    const canteen = CANTEENS_BY_ID.get(req.params.canteenId)
    if (canteen == null) {
      res.status(404).json({ success: false, error: 'canteen not found' })
      return
    }
    res.status(200).json({ success: true, data: canteen.lines })
  })

  router.get('/:canteenId/lines/:lineId', (req: Request, res: Response) => {
    const linesMap = CANTEEN_LINES_BY_ID.get(req.params.canteenId)
    if (linesMap == null) {
      res.status(404).json({ success: false, error: 'canteen not found' })
      return
    }
    const line = linesMap.get(req.params.lineId)
    if (line == null) {
      res.status(404).json({ success: false, error: 'line not found' })
      return
    }
    res.status(200).json({ success: true, data: line })
  })

  return router
}
