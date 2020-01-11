"use strict";

const path = require("path");
const fsPromises = require("fs").promises;
const moment = require("moment");

const { ABSENT, PRESENT, PresenceSet } = require("./presenceset");


// CONSTANTS

/**
 * File encoding.
 * @type {String}
 */
const FILE_ENCODING = "utf8";

/**
 * File suffix including extension.
 * @type {String}
 */
const FILE_SUFFIX = ".json";

/**
 * Absolute path to directory where cache files are stored.
 * @type {String}
 */
const BASE_DIRECTORY = path.join(__dirname, "../cache");

/**
 * ENOENT error code.
 * @type {String}
 */
const ENOENT = "ENOENT";


// STATE

const presence = new PresenceSet();


// UTILITY METHODS

/**
 * Build a cache key from the given date object.
 *
 * @param {Object} date The date object.
 * @return {String} The cache key.
 */
function buildKey(date) {
    return moment(date).format("YYYY-MM-DD");
}

/**
 * Resolve the absolute file path for the given cache key.
 *
 * @param {String} key The cache key.
 * @return {String} The resolved file path.
 */
function resolveFilePath(key) {
    return path.join(BASE_DIRECTORY, key + FILE_SUFFIX);
}

/**
 * Low-level: Read from the cache file for the given key.
 *
 * @param {String} key The cache key as per `buildKey()`.
 * @return {Promise} Resolves to parsed cache object.
 */
async function readCacheFile(key) {
    const name = resolveFilePath(key);

    try {
        const contents = await fsPromises.readFile(name, FILE_ENCODING);
        return JSON.parse(contents);
    } catch (e) {
        if (e && e.code === ENOENT) {
            return null;
        }
        throw e;
    }
}

/**
 * Low-level: Write into the cache file for the given key.
 *
 * @param {String} key The cache key as per `buildKey()`.
 * @param {Object} obj The data to write.
 * @return {Promise} Resolves when done.
 */
async function writeCacheFile(key, obj) {
    const name = resolveFilePath(key);
    const contents = JSON.stringify(obj);

    await fsPromises.writeFile(name, contents, FILE_ENCODING);
}


// EXPORTS

/**
 * Get the cache contents for the given date.
 *
 * If the cache does not contain data for the given date, returns null.
 *
 * @param {Object} date The date object.
 * @return {Promise} Resolves to the cache contents, null if not cached.
 */
async function get(date) {
    const key = buildKey(date);

    const state = presence.get(key);
    if (state === ABSENT) {
        return null;
    }

    const item = await readCacheFile(key);
    presence.set(key, item ? PRESENT : ABSENT);

    return item;
}

/**
 * Insert the contents into the cache for the given date.
 *
 * @param {Object} date The date object.
 * @param {Object[]} contents The cache contents (array of plans for the date).
 * @return {Promise} Resolves when done.
 */
async function put(date, contents) {
    const key = buildKey(date);

    await writeCacheFile(key, contents);
    presence.set(key, PRESENT);
}

module.exports = { get, put };
