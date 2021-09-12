import moment from 'moment'

// CONSTANTS

/**
 * The date format that is used.
 *
 * @type {string}
 */
const DATE_FORMAT = 'YYYY-MM-DD'

// MAIN EXPORT

/**
 * Parse the given date string into a date object.
 *
 * @param {string} str The date string.
 * @returns {object} The parse result.
 */
export function parseDate (str: string): { year: number, month: number, day: number } | undefined {
  const strict = true
  const date = moment(str, DATE_FORMAT, strict)
  if (date.isValid() as boolean) {
    return {
      year: date.year(),
      month: date.month(),
      day: date.date()
    }
  }
  return undefined
}
