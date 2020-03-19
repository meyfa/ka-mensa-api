'use strict'

const path = require('path')
const fsPromises = require('fs').promises
const moment = require('moment')

const config = require('../config')

const { ABSENT, PRESENT, PresenceSet } = require('./presenceset')

// CONSTANTS

/**
 * File encoding.
 *
 * @type {string}
 */
const FILE_ENCODING = 'utf8'

/**
 * File suffix including extension.
 *
 * @type {string}
 */
const FILE_SUFFIX = '.json'

/**
 * ENOENT error code.
 *
 * @type {string}
 */
const ENOENT = 'ENOENT'

/**
 * EEXIST error code.
 *
 * @type {string}
 */
const EEXIST = 'EEXIST'

// STATE

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
 * Resolve the absolute file path for the given cache key.
 *
 * @param {string} key The cache key.
 * @returns {string} The resolved file path.
 */
function resolveFilePath (key) {
  return path.join(config.cache.directory, key + FILE_SUFFIX)
}

/**
 * Create the cache directory if it does not exist.
 *
 * @returns {Promise} A Promise that resolves when done.
 */
async function ensureCacheDirectoryExists () {
  try {
    await fsPromises.mkdir(config.cache.directory, { recursive: true })
  } catch (e) {
    // ignore if directory exists, otherwise re-throw
    if (e.code !== EEXIST) {
      throw e
    }
  }
}

/**
 * Low-level: Read from the cache file for the given key.
 *
 * @param {string} key The cache key as per `buildKey()`.
 * @returns {Promise} Resolves to parsed cache object.
 */
async function readCacheFile (key) {
  const name = resolveFilePath(key)

  try {
    const contents = await fsPromises.readFile(name, FILE_ENCODING)
    return JSON.parse(contents)
  } catch (e) {
    if (e && e.code === ENOENT) {
      return null
    }
    throw e
  }
}

/**
 * Low-level: Write into the cache file for the given key.
 *
 * @param {string} key The cache key as per `buildKey()`.
 * @param {object} obj The data to write.
 * @returns {Promise} Resolves when done.
 */
async function writeCacheFile (key, obj) {
  const name = resolveFilePath(key)
  const contents = JSON.stringify(obj)

  await ensureCacheDirectoryExists()

  await fsPromises.writeFile(name, contents, FILE_ENCODING)
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

  const item = await readCacheFile(key)
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

  await writeCacheFile(key, contents)
  presence.set(key, PRESENT)
}

module.exports = { get, put }
