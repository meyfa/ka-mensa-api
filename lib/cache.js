'use strict'

const moment = require('moment')

const parseDate = require('./util/parse-date')
const { ABSENT, PRESENT, PresenceSet } = require('./presenceset')

// CONSTANTS

/**
 * ENOENT error code.
 *
 * @type {string}
 */
const ENOENT = 'ENOENT'

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

class Cache {
  /**
   * Construct a new Cache with the specified file system adapter.
   *
   * @param {object} fsAdapter The I/O interface.
   */
  constructor (fsAdapter) {
    this.fsAdapter = fsAdapter
    this.presence = new PresenceSet()
  }

  /**
   * Get the cache contents for the given date.
   *
   * If the cache does not contain data for the given date, returns null.
   *
   * @param {object} date The date object.
   * @returns {Promise} Resolves to the cache contents, null if not cached.
   */
  async get (date) {
    const key = buildKey(date)

    const state = this.presence.get(key)
    if (state === ABSENT) {
      return null
    }

    let item = null
    try {
      const file = buildFileName(key)
      const contents = await this.fsAdapter.read(file, { encoding: 'utf8' })
      item = JSON.parse(contents)
    } catch (e) {
      // only forward errors not caused by missing files
      if (!e || e.code !== ENOENT) {
        throw e
      }
    }

    this.presence.set(key, item ? PRESENT : ABSENT)

    return item
  }

  /**
   * Insert the contents into the cache for the given date.
   *
   * @param {object} date The date object.
   * @param {object[]} contents The cache contents (array of plans for the date).
   * @returns {Promise} Resolves when done.
   */
  async put (date, contents) {
    const key = buildKey(date)
    const file = buildFileName(key)

    await this.fsAdapter.write(file, JSON.stringify(contents))
    this.presence.set(key, PRESENT)
  }

  /**
   * Obtain a list of all cached plans, in unspecified order.
   *
   * @returns {Promise} Resolves to an array of date objects.
   */
  async list () {
    const files = await this.fsAdapter.listFiles()
    return files.filter(file => {
      return /^\d{4}-\d{2}-\d{2}.json$/.test(file)
    }).map(file => {
      return parseDate(file.substring(0, file.indexOf('.')))
    })
  }
}

module.exports = Cache
