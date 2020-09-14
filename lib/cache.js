'use strict'

const moment = require('moment')

const parseDate = require('./util/parse-date')

// CONSTANTS

/**
 * ENOENT error code.
 *
 * @type {string}
 */
const ENOENT = 'ENOENT'

// UTILITY METHODS

/**
 * Build the file name from the given date object.
 *
 * @param {object} date The date object.
 * @returns {string} The file name.
 */
function buildFileName (date) {
  return moment(date).format('YYYY-MM-DD') + '.json'
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
    const file = buildFileName(date)

    try {
      const contents = await this.fsAdapter.read(file, { encoding: 'utf8' })
      return JSON.parse(contents)
    } catch (e) {
      if (e && e.code === ENOENT) {
        // missing file - item not found
        return null
      }
      // some more critical error
      throw e
    }
  }

  /**
   * Insert the contents into the cache for the given date.
   *
   * @param {object} date The date object.
   * @param {object[]} contents The cache contents (array of plans for the date).
   * @returns {Promise} Resolves when done.
   */
  async put (date, contents) {
    const file = buildFileName(date)
    await this.fsAdapter.write(file, JSON.stringify(contents))
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
