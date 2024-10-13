import { CanteenPlan, DateSpec, fetchMensa } from 'ka-mensa-fetch'
import { group } from 'group-items'
import moment from 'moment'
import ms from 'ms'
import { Config } from './config.js'
import { getSessionCookie } from './get-session-cookie.js'
import { Cache } from './cache.js'
import { formatDate } from './util/date-format.js'
import { Logger } from 'winston'

/**
 * Maximum age of a plan that is still considered valid for caching. If a plan
 * is older than this, there likely was an error during retrieval or date
 * parsing.
 */
// use a relaxed duration of 10 days, to catch wrongly detected months/years
// while still allowing for some uncertainties
const PLAN_AGE_MAXIMUM = ms('10d')

/**
 * Determine the dates for which plans should be fetched, based on the current
 * date and an offset.
 *
 * If the offset is 0 (dayCount = 0), only today is included;
 * if dayCount = 1, today and tomorrow are included; etc.
 *
 * @param dayCount The number of dates after today to also include.
 * @returns The array of date objects.
 */
function getFetchDates (dayCount: number): DateSpec[] {
  const dates: DateSpec[] = []
  for (let i = 0, date = moment(); i <= dayCount; ++i) {
    dates.push({
      year: date.year(),
      month: date.month(),
      day: date.date()
    })
    date.add(1, 'd')
  }
  return dates
}

/**
 * Use the simplesite source to fetch plans for all canteens, for a few days into
 * the future as defined in the config.
 *
 * @param config The application config.
 * @returns Resolves to the fetched plan set.
 */
async function fetchFromSimpleSite (config: Config): Promise<CanteenPlan[]> {
  const dayCount = Math.max(config.simplesite.days, 0)
  const dates = getFetchDates(dayCount)
  const sessionCookie = await getSessionCookie()

  return await fetchMensa('simplesite', { dates, sessionCookie })
}

/**
 * Use the jsonapi source to fetch the currently available plans.
 *
 * @param config The application config.
 * @returns Resolves to the fetched plan set.
 */
async function fetchFromJsonApi (config: Config): Promise<CanteenPlan[]> {
  return await fetchMensa('jsonapi', {
    auth: {
      user: config.jsonapi.auth.username,
      password: config.jsonapi.auth.password
    }
  })
}

/**
 * Use the specified string to determine from which source plans should be
 * fetched, and fetch them.
 *
 * @param config The application config.
 * @param source The source to use ('simplesite' / 'jsonapi').
 * @returns Resolves to the fetched plan set.
 */
async function fetchFromSource (config: Config, source: string): Promise<CanteenPlan[]> {
  switch (source) {
    case 'jsonapi':
      return await fetchFromJsonApi(config)
    case 'simplesite':
      return await fetchFromSimpleSite(config)
  }
  throw new Error('invalid source setting')
}

/**
 * Run the fetcher job, updating the available plans.
 *
 * This does not necessarily result in a complete set of plans. All it does is
 * fetch a sufficient amount of plans, so that when this is called regularly
 * there will be no gaps.
 *
 * @param config The application config.
 * @param logger The logger instance.
 * @param cache The cache instance.
 */
export async function runFetchJob (config: Config, logger: Logger, cache: Cache): Promise<void> {
  const source = config.fetch.source
  logger.info(`fetching plans (source=${source})`)

  let plans
  try {
    plans = await fetchFromSource(config, source)
  } catch (e) {
    logger.error(e)
    return
  }

  const now = moment()

  // for each date: add respective plans array to cache
  for (const [date, plansForDate] of group(plans).by((plan) => plan.date).asTuples()) {
    const formattedDate = formatDate(date)

    // check for invalid date
    if (now.diff(date) > PLAN_AGE_MAXIMUM) {
      logger.warn(`data for ${formattedDate} will not be stored due to its age`)
      continue
    }

    const canteensList = plansForDate.map((plan) => plan.id).join(',')
    logger.info(`caching ${formattedDate} with ${plansForDate.length} canteens: [${canteensList}]`)

    await cache.put(date, plansForDate)
  }
}
