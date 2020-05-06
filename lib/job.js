'use strict'

const fetchMensa = require('ka-mensa-fetch')
const group = require('group-items')
const moment = require('moment')
const ms = require('ms')

const cache = require('./cache')
const config = require('../config')

// CONSTANTS

/**
 * Session cookie lifetime duration, i.e. time before requesting another.
 *
 * @type {number}
 */
// The cookie is assumed to live for at least 30 minutes
const SESSION_COOKIE_TIMEOUT = ms('29min')

// STATE

let sessionCookie = null
let sessionCookieTime = 0

// METHODS

/**
 * Determine the dates for which plans should be fetched.
 *
 * @returns {object[]} The array of date objects.
 */
function getFetchDates () {
  const dayCount = Math.max(config.fetchJob.futureDays, 0)
  const dates = []
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
 * Obtain the session cookie to use. This may return null on failure. It will
 * return a cached cookie when available, but if no cookie is available yet or
 * it has reached its lifetime, a fresh cookie will be requested instead.
 *
 * @returns {Promise} Resolves to a cookie value.
 */
async function getSessionCookie () {
  if (Date.now() - sessionCookieTime < SESSION_COOKIE_TIMEOUT) {
    return sessionCookie
  }

  sessionCookie = await fetchMensa.requestSessionCookie()
  sessionCookieTime = Date.now()

  return sessionCookie
}

// MAIN EXPORT

/**
 * Run the fetcher job, updating the available plans.
 *
 * This does not necessarily result in a complete set of plans. All it does is
 * fetch a sufficient amount of plans, so that when this is called regularly
 * there will be no gaps.
 *
 * @returns {void}
 */
async function run () {
  // fetch plans for all canteens, for a few days into the future
  const dates = getFetchDates()
  const sessionCookie = await getSessionCookie()
  const plans = await fetchMensa({ dates, sessionCookie })

  // for each date: add respective plans array to cache
  for (const [date, plansForDate] of group(plans).by('date').asTuples()) {
    cache.put(date, plansForDate)
  }
}

module.exports = run
