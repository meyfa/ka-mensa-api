import { fetchMensa, CanteenPlan, DateSpec } from 'ka-mensa-fetch'
import { Logger } from 'winston'
import { group } from 'group-items'
import moment from 'moment'
import ms from 'ms'

import config from '../config'

import { getSessionCookie } from './get-session-cookie'
import { Cache } from './cache'

// CONSTANTS

/**
 * Maximum age of a plan that is still considered valid for caching. If a plan
 * is older than this, there likely was an error during retrieval or date
 * parsing.
 */
// use a relaxed duration of 10 days, to catch wrongly detected months/years
// while still allowing for some uncertainties
const PLAN_AGE_MAXIMUM = ms('10d')

// METHODS

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
 * @returns Resolves to the fetched plan set.
 */
async function fetchFromSimpleSite (): Promise<CanteenPlan[]> {
  const dayCount = Math.max(config.fetchJob.simplesiteOptions.futureDays, 0)
  const dates = getFetchDates(dayCount)
  const sessionCookie = await getSessionCookie()

  return fetchMensa('simplesite', { dates, sessionCookie })
}

/**
 * Use the jsonapi source to fetch the currently available plans.
 *
 * @returns Resolves to the fetched plan set.
 */
async function fetchFromJsonApi (): Promise<CanteenPlan[]> {
  return fetchMensa('jsonapi', {
    auth: {
      user: config.fetchJob.jsonapiOptions.auth.user,
      password: config.fetchJob.jsonapiOptions.auth.password
    }
  })
}

/**
 * Use the specified string to determine from which source plans should be
 * fetched, and fetch them.
 *
 * @param source The source to use ('simplesite' / 'jsonapi').
 * @returns Resolves to the fetched plan set.
 */
async function fetchFromSource (source: string): Promise<CanteenPlan[]> {
  switch (source) {
    case 'jsonapi':
      return await fetchFromJsonApi()
    case 'simplesite':
      return await fetchFromSimpleSite()
  }
  throw new Error('invalid source setting')
}

// MAIN EXPORT

/**
 * Run the fetcher job, updating the available plans.
 *
 * This does not necessarily result in a complete set of plans. All it does is
 * fetch a sufficient amount of plans, so that when this is called regularly
 * there will be no gaps.
 *
 * @param cache The cache instance.
 * @param logger The logger instance.
 */
export async function runFetchJob (cache: Cache, logger: Logger): Promise<void> {
  const source = config.fetchJob.source
  logger.log('info', 'fetching plans (source=' + source + ')')

  let plans
  try {
    plans = await fetchFromSource(source)
  } catch (e) {
    logger.log('error', e)
    return
  }

  const now = moment()

  // for each date: add respective plans array to cache
  for (const [date, plansForDate] of group(plans).by('date').asTuples()) {
    // check for invalid date
    if (now.diff(date) > PLAN_AGE_MAXIMUM) {
      const formattedDate: string = moment(date).format('YYYY-MM-DD')
      logger.log('warn', 'fetched a plan from ' + formattedDate + ' that was not stored due to its age')
      continue
    }

    await cache.put(date, plansForDate)
  }
}
