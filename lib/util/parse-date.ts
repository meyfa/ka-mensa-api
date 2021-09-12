import moment from 'moment'
import { DateSpec } from 'ka-mensa-fetch'

// CONSTANTS

/**
 * The date format that is used.
 */
const DATE_FORMAT = 'YYYY-MM-DD'

// MAIN EXPORT

/**
 * Parse the given date string into a date object.
 *
 * @param str The date string.
 * @returns The parse result.
 */
export function parseDate (str: string): DateSpec | undefined {
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
