'use strict'

const { DirectoryAdapter } = require('fs-adapters')

const moment = require('moment')

const config = require('../config')
const parseDate = require('./util/parse-date')
const { ABSENT, PRESENT, PresenceSet } = require('./presenceset')

// CONSTANTS

/**
 * ENOENT error code.
 *
 * @type {string}
 */
const ENOENT = 'ENOENT'

// STATE

const adapter = new DirectoryAdapter(config.cache.directory)
const presence = new PresenceSet()

// UTILITY METHODS

/**
 * Build a cache key from the given date object.
 *
 * @param {object} date The date object.
 * @returns {string} The cache key.
 */
function buildKey (date) {
  return moment(date).format('YYYY-MM-DD')
}

/**
 * Use the cache key to construct a file name.
 *
 * @param {string} key The cache key.
 * @returns {string} The file name.
 */
function buildFileName (key) {
  return key + '.json'
}

// EXPORTS

/**
 * Get the cache contents for the given date.
 *
 * If the cache does not contain data for the given date, returns null.
 *
 * @param {object} date The date object.
 * @returns {Promise} Resolves to the cache contents, null if not cached.
 */
async function get (date) {
  const key = buildKey(date)

  const state = presence.get(key)
  if (state === ABSENT) {
    return null
  }

  let item = null
  try {
    const file = buildFileName(key)
    const contents = await adapter.read(file, { encoding: 'utf8' })
    item = JSON.parse(contents)
  } catch (e) {
    if (!e || e.code !== ENOENT) {
      throw e
    }
  }

  presence.set(key, item ? PRESENT : ABSENT)

  return item
}

/**
 * Insert the contents into the cache for the given date.
 *
 * @param {object} date The date object.
 * @param {object[]} contents The cache contents (array of plans for the date).
 * @returns {Promise} Resolves when done.
 */
async function put (date, contents) {
  const key = buildKey(date)
  const file = buildFileName(key)

  await adapter.write(file, JSON.stringify(contents))
  presence.set(key, PRESENT)
}

/**
 * Obtain a list of all cached plans, in unspecified order.
 *
 * @returns {Promise} Resolves to an array of date objects.
 */
async function list () {
  const files = await adapter.listFiles()
  return files.filter(file => {
    return /^\d{4}-\d{2}-\d{2}.json$/.test(file)
  }).map(file => {
    return parseDate(file.substring(0, file.indexOf('.')))
  })
}

module.exports = { get, put, list }
