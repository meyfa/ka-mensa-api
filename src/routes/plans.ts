import { Request, Router } from 'express'
import { DateSpec, canteens } from 'ka-mensa-fetch'
import { Cache } from '../cache.js'
import { parseDate } from '../util/parse-date.js'
import { PlansController } from '../controllers/plans-controller.js'
import { createHandler } from '../create-handler.js'
import { BadRequestError } from '../errors.js'
import { parseCommaFilter } from '../util/parse-comma-filter.js'

// CONSTANTS

const CANTEEN_IDS = canteens.map(({ id }) => id)

// UTILITY METHODS

/**
 * Retrieve and parse the 'date' parameter from the given request.
 * An ApiError is thrown if the parameter is invalid.
 *
 * @param req The request.
 * @returns The parsed date.
 */
function getRequestDate (req: Request): DateSpec {
  const date = parseDate(req.params.date)
  if (date == null) {
    throw new BadRequestError('malformed date')
  }
  return date
}

/**
 * Retrieve and parse the 'canteens' comma-delimited request parameter.
 * An ApiError is thrown if the parameter is invalid.
 *
 * @param req The request.
 * @returns The parsed canteens filter.
 */
function getCanteensFilter (req: Request): string[] | undefined {
  if (req.query.canteens == null) {
    return undefined
  }
  const canteensFilter = typeof req.query.canteens === 'string'
    ? parseCommaFilter(req.query.canteens, CANTEEN_IDS)
    : undefined
  if (canteensFilter == null) {
    throw new BadRequestError('invalid filter: canteens')
  }
  return canteensFilter
}

// ROUTES FACTORY

/**
 * Create the router for retrieving plan information.
 *
 * @param cache The cache object.
 * @returns The router object.
 */
export function plansRoute (cache: Cache): Router {
  const controller = new PlansController(cache)

  const router = Router()

  router.get('/', createHandler(async () => await controller.getSummaries()))

  router.get('/:date(\\d{4}-\\d{2}-\\d{2})', createHandler(async (req: Request) => {
    return await controller.getPlan(getRequestDate(req), getCanteensFilter(req))
  }))

  return router
}
