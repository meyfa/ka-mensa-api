"use strict";

const moment = require("moment");


// CONSTANTS

/**
 * The date format that is used.
 * @type {String}
 */
const DATE_FORMAT = "YYYY-MM-DD";


// MAIN EXPORT

/**
 * Parse the given date string into a date object.
 *
 * @param {String} str The date string.
 * @return {Object} The parse result.
 */
function parseDate(str) {
    const strict = true;
    const date = moment(str, DATE_FORMAT, strict);
    if (date.isValid()) {
        return {
            year: date.year(),
            month: date.month(),
            day: date.date(),
        };
    }
    return null;
}

module.exports = parseDate;
