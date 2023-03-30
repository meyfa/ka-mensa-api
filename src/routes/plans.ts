import { DateSpec, canteens } from 'ka-mensa-fetch'
import { Cache } from '../cache.js'
import { parseDate } from '../util/date-format.js'
import { PlansController } from '../controllers/plans-controller.js'
import { BadRequestError } from '../errors.js'
import { parseCommaFilter } from '../util/parse-comma-filter.js'
import { FastifyPluginAsync } from 'fastify'
import { sendResult } from '../response.js'

const CANTEEN_IDS = canteens.map(({ id }) => id)

/**
 * Retrieve and parse the 'date' parameter from a request.
 * An ApiError is thrown if the parameter is invalid.
 *
 * @param dateParam The raw date parameter.
 * @returns The parsed date.
 */
function getRequestDate (dateParam: string): DateSpec {
  const date = parseDate(dateParam)
  if (date == null) {
    throw new BadRequestError('malformed date')
  }
  return date
}

/**
 * Retrieve and parse the 'canteens' comma-delimited request parameter.
 * An ApiError is thrown if the parameter is invalid.
 *
 * @param query The request query.
 * @param query.canteens The raw canteens filter.
 * @returns The parsed canteens filter.
 */
function getCanteensFilter (query: { canteens: string | string[] }): string[] | undefined {
  if (query.canteens == null) {
    return undefined
  }
  const canteensFilter = typeof query.canteens === 'string'
    ? parseCommaFilter(query.canteens, CANTEEN_IDS)
    : undefined
  if (canteensFilter == null) {
    throw new BadRequestError('invalid filter: canteens')
  }
  return canteensFilter
}

/**
 * Create the routes for retrieving plan information.
 *
 * @param cache The cache object.
 * @returns A Fastify plugin.
 */
export const plansRoute = (cache: Cache): FastifyPluginAsync => async (app) => {
  const controller = new PlansController(cache)

  app.get('/', async () => await controller.getSummaries())

  app.get<{
    Params: { date: string }
    Querystring: { canteens: string | string[] }
  }>('/:date(\\d{4}-\\d{2}-\\d{2})', async (req, reply) => {
    await sendResult(reply, await controller.getPlan(getRequestDate(req.params.date), getCanteensFilter(req.query)))
  })
}
